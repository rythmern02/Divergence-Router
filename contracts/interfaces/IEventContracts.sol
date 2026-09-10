// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DreamDEX Event Contracts — on-chain interfaces from Hackathon Starter Template
/// @notice The raw ABI for a binary (Up/Down) prediction-market pool on Somnia.
///         Sourced from https://github.com/IronicDeGawd/ec-dreamdex-hackathon-template

struct OrderBookLevel {
    uint256 price;      // probability in 1e6 units (900000 = 0.90)
    uint256 quantity;   // total size resting at this level
}

struct BinaryPoolParams {
    address collateralToken;
    address market;             // the per-window market contract (carries the outcome)
    address outcomeToken;       // ERC-6909 singleton holding every market's Up/Down
    uint256 yesId;              // token id for the Up outcome
    uint256 noId;               // token id for the Down outcome
    uint256 oneCollateral;      // 1e6 on testnet — one whole contract
    uint256 setBacking;
    address feeRecipient;
    uint256 makerFeeBpsTimes1k;
    uint256 takerFeeBpsTimes1k;
    uint256 maxBuilderFeeBpsTimes1k;
    uint256 settlementFeeBpsTimes1k;
    address settlement;
    uint64  marketNonce;
    bool    finalized;
}

struct OrderBookParams {
    uint256 tickSize;
    uint256 minQuantity;
    uint256 lotSize;
}

/// @notice The pool: this is where trading happens.
interface IBinaryPool {
    /// @param kind 0=BUY_YES 1=SELL_YES 2=BUY_NO 3=SELL_NO
    /// @param price probability in 1e6 units (900000 = 0.90)
    /// @param orderType 0=LIMIT 1=FILL_OR_KILL 2=IOC 3=POST_ONLY
    /// @param expireTimestampNs order expiry in NANOseconds; must satisfy
    ///        0 < expireTimestampNs <= marketExpiryNs() or it reverts.
    function placeBinaryOrder(
        uint8   kind,
        uint256 price,
        uint256 quantity,
        uint64  expireTimestampNs,
        uint8   orderType,
        uint8   selfMatchingOption,
        address builder,
        uint96  builderFeeBpsTimes1k,
        uint64  userData
    ) external returns (bool success, uint128 orderId);

    function cancelOrder(uint128 orderId) external;

    function getBookLevels(bool isBid, uint64 numLevels) external view returns (OrderBookLevel[] memory);
    function getBinaryPoolParams() external view returns (BinaryPoolParams memory);
    function getOrderBookParameters() external view returns (OrderBookParams memory);
    function marketExpiryNs() external view returns (uint64);
    function finalized() external view returns (bool);

    function deposit(address token, uint256 amount) external;
    function withdraw(address token, uint256 amount) external;
    function getWithdrawableBalance(address user, address token) external view returns (uint256);
}

/// @notice The per-window market contract that carries the settlement outcome.
interface IBinaryMarket {
    function isResolved() external view returns (bool);
    function isVoided() external view returns (bool);
    function payoutNumerators() external view returns (uint256[] memory);
}

/// @notice Outcome Token ERC-6909 standard
interface IOutcomeToken6909 {
    function balanceOf(address owner, uint256 id) external view returns (uint256);
    function isOperator(address owner, address spender) external view returns (bool);
    function setOperator(address spender, bool approved) external returns (bool);
    function transfer(address receiver, uint256 id, uint256 amount) external returns (bool);
    function transferFrom(address sender, address receiver, uint256 id, uint256 amount) external returns (bool);
}
