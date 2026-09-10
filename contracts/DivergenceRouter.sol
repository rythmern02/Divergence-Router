// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC6909.sol";

interface IBinaryMarket {
    function yesId() external view returns (uint256);
    function noId() external view returns (uint256);
    function pool() external view returns (address);
    function status() external view returns (uint8);
    function expiry() external view returns (uint64);
    function isResolved() external view returns (bool);
}

interface IBinaryPool {
    function mintSet(address yesTo, address noTo, uint256 amount) external;
}

interface IBinarySettlement {
    function redeem(uint256 outcomeId, uint256 amount, address to) external returns (uint256 collateralOut);
}

/**
 * @title DivergenceRouter
 * @notice 1-Click Atomic Execution Router for structured multi-leg event contract positions on Somnia DreamDEX.
 * @dev Enforces strict EVM transaction atomicity: both legs must fill within tolerance, or the transaction
 *      reverts completely, preventing single-leg naked exposure and eliminating legging-in risk.
 */
contract DivergenceRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IBinarySettlement public immutable settlement;
    IERC6909 public immutable outcomeToken;
    IERC20 public immutable collateralToken;

    enum OutcomeChoice {
        YES, // 0 = YES / UP
        NO   // 1 = NO / DOWN
    }

    struct MarketLeg {
        address market;
        OutcomeChoice choice;
        uint256 minFillAmount;
    }

    struct SplitPosition {
        address user;
        address marketA;
        address marketB;
        uint256 outcomeIdA;
        uint256 outcomeIdB;
        uint8 outcomeIdxA;
        uint8 outcomeIdxB;
        uint256 amountA;
        uint256 amountB;
        bool redeemed;
        uint256 createdAt;
    }

    mapping(uint256 => SplitPosition) public positions;
    mapping(address => uint256[]) private userPositionIds;
    uint256 public nextPositionId;

    event SplitOpened(
        uint256 indexed positionId,
        address indexed user,
        address indexed marketA,
        address marketB,
        uint256 amountA,
        uint256 amountB
    );

    event SplitRedeemed(
        uint256 indexed positionId,
        address indexed user,
        uint256 totalPayout
    );

    error MarketNotTrading(address market, uint8 currentStatus);
    error InsufficientFill(address market, uint256 filled, uint256 required);
    error AlreadyRedeemed(uint256 positionId);
    error NotPositionOwner(uint256 positionId);
    error TransactionExpired(uint64 deadline, uint256 currentTimestamp);
    error ZeroCollateral();

    /**
     * @notice Initializes the router with core DreamDEX protocol contracts.
     * @param _settlement Address of the deployed BinarySettlement contract.
     * @param _outcomeToken Address of the shared OutcomeToken6909 contract.
     * @param _collateralToken Address of the venue collateral (e.g. tUSDC on testnet).
     */
    constructor(
        address _settlement,
        address _outcomeToken,
        address _collateralToken
    ) {
        require(_settlement != address(0), "Invalid settlement address");
        require(_outcomeToken != address(0), "Invalid outcome token address");
        require(_collateralToken != address(0), "Invalid collateral address");

        settlement = IBinarySettlement(_settlement);
        outcomeToken = IERC6909(_outcomeToken);
        collateralToken = IERC20(_collateralToken);

        // Authorize settlement contract to pull ERC-6909 outcome tokens during redemption
        outcomeToken.setOperator(_settlement, true);
    }

    /**
     * @notice Atomically constructs a 2-leg structured divergence/term-structure split position.
     * @dev Reverts entirely if either leg fails to fill >= minFillAmount or is not in Trading state.
     * @param legA Configuration for the first market leg.
     * @param legB Configuration for the second market leg.
     * @param collateralPerLeg Collateral allocated to each individual leg.
     * @param deadline Unix timestamp past which the transaction must revert.
     * @return positionId Unique identifier for the created split position.
     */
    function openSplit(
        MarketLeg calldata legA,
        MarketLeg calldata legB,
        uint256 collateralPerLeg,
        uint64 deadline
    ) external nonReentrant returns (uint256 positionId) {
        if (block.timestamp > deadline) revert TransactionExpired(deadline, block.timestamp);
        if (collateralPerLeg == 0) revert ZeroCollateral();

        uint256 totalCollateral = collateralPerLeg * 2;
        collateralToken.safeTransferFrom(msg.sender, address(this), totalCollateral);

        // Execute Leg A
        (uint256 outcomeIdA, uint256 amountA) = _executeLeg(legA, collateralPerLeg);

        // Execute Leg B (If this reverts or slips, EVM atomicity rolls back Leg A and user's collateral)
        (uint256 outcomeIdB, uint256 amountB) = _executeLeg(legB, collateralPerLeg);

        positionId = ++nextPositionId;
        positions[positionId] = SplitPosition({
            user: msg.sender,
            marketA: legA.market,
            marketB: legB.market,
            outcomeIdA: outcomeIdA,
            outcomeIdB: outcomeIdB,
            outcomeIdxA: uint8(legA.choice),
            outcomeIdxB: uint8(legB.choice),
            amountA: amountA,
            amountB: amountB,
            redeemed: false,
            createdAt: block.timestamp
        });

        userPositionIds[msg.sender].push(positionId);

        emit SplitOpened(
            positionId,
            msg.sender,
            legA.market,
            legB.market,
            amountA,
            amountB
        );
    }

    /**
     * @notice Redeems winning positions on both legs once markets have settled.
     * @dev Any user or keeper can call this; payout is strictly disbursed to the position owner.
     * @param positionId Identifier of the split position.
     * @return totalPayout Total amount of collateral redeemed and transferred to position owner.
     */
    function redeemSplit(uint256 positionId) external nonReentrant returns (uint256 totalPayout) {
        SplitPosition storage pos = positions[positionId];
        if (pos.user == address(0)) revert NotPositionOwner(positionId);
        if (pos.redeemed) revert AlreadyRedeemed(positionId);

        pos.redeemed = true;

        uint256 payoutA = 0;
        uint256 payoutB = 0;

        if (pos.amountA > 0) {
            payoutA = settlement.redeem(pos.outcomeIdA, pos.amountA, pos.user);
        }

        if (pos.amountB > 0) {
            payoutB = settlement.redeem(pos.outcomeIdB, pos.amountB, pos.user);
        }

        totalPayout = payoutA + payoutB;

        emit SplitRedeemed(positionId, pos.user, totalPayout);
    }

    /**
     * @dev Internal helper to validate on-chain status and execute complete set minting on the pool.
     */
    function _executeLeg(
        MarketLeg calldata leg,
        uint256 collateral
    ) internal returns (uint256 outcomeId, uint256 fill) {
        IBinaryMarket m = IBinaryMarket(leg.market);
        uint8 status = m.status();

        // 1 = Trading. Gating on live on-chain status prevents placing orders in Locked or Closed states.
        if (status != 1) revert MarketNotTrading(leg.market, status);

        address pool = m.pool();
        outcomeId = leg.choice == OutcomeChoice.YES ? m.yesId() : m.noId();

        // Approve pool to pull collateral
        collateralToken.forceApprove(pool, collateral);

        uint256 balanceBefore = outcomeToken.balanceOf(address(this), outcomeId);
        IBinaryPool(pool).mintSet(address(this), address(this), collateral);
        fill = outcomeToken.balanceOf(address(this), outcomeId) - balanceBefore;

        if (fill < leg.minFillAmount) {
            revert InsufficientFill(leg.market, fill, leg.minFillAmount);
        }
    }

    /**
     * @notice Retrieves all position IDs created by a specific account.
     */
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositionIds[user];
    }

    /**
     * @notice Retrieves full position details by ID.
     */
    function getPosition(uint256 positionId) external view returns (SplitPosition memory) {
        return positions[positionId];
    }
}
