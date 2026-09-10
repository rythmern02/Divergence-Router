// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC6909.sol";
import "../interfaces/IBinaryMarketsModule.sol";

contract MockBinaryMarketsModule is IBinaryMarketsModule {
    IERC20 public immutable collateralToken;
    MockERC6909 public immutable outcomeToken;

    struct InternalMarket {
        address pool;
        address market;
        uint8 status;
        uint256 yesId;
        uint256 noId;
        uint256 expiry;
        bool shouldFailMint; // Can simulate failed mint / thin liquidity
    }

    mapping(bytes32 => InternalMarket) public internalMarkets;

    constructor(address _collateralToken, address _outcomeToken) {
        collateralToken = IERC20(_collateralToken);
        outcomeToken = MockERC6909(_outcomeToken);
    }

    function setMarket(
        bytes32 marketId,
        address pool,
        address market,
        uint8 status,
        uint256 yesId,
        uint256 noId,
        uint256 expiry,
        bool shouldFailMint
    ) external {
        internalMarkets[marketId] = InternalMarket({
            pool: pool,
            market: market,
            status: status,
            yesId: yesId,
            noId: noId,
            expiry: expiry,
            shouldFailMint: shouldFailMint
        });
    }

    function setMarketStatus(bytes32 marketId, uint8 status) external {
        internalMarkets[marketId].status = status;
    }

    function markets(bytes32 marketId) external view override returns (
        address pool,
        address market,
        uint8 status,
        uint256 yesId,
        uint256 noId,
        uint256 expiry
    ) {
        InternalMarket memory m = internalMarkets[marketId];
        return (m.pool, m.market, m.status, m.yesId, m.noId, m.expiry);
    }

    function mintCompleteSet(bytes32 marketId, uint256 amount) external override {
        InternalMarket memory m = internalMarkets[marketId];
        require(m.status == 1, "Market not in trading state");
        require(!m.shouldFailMint, "Mint execution failed on-chain");

        // Pull collateral from caller
        collateralToken.transferFrom(msg.sender, address(this), amount);

        // Mint 1 YES token and 1 NO token per collateral unit
        outcomeToken.mint(msg.sender, m.yesId, amount);
        outcomeToken.mint(msg.sender, m.noId, amount);
    }

    function mergeCompleteSet(bytes32 marketId, uint256 amount) external override {
        InternalMarket memory m = internalMarkets[marketId];
        outcomeToken.burn(msg.sender, m.yesId, amount);
        outcomeToken.burn(msg.sender, m.noId, amount);

        collateralToken.transfer(msg.sender, amount);
    }
}
