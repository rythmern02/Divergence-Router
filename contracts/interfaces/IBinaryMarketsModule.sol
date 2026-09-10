// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBinaryMarketsModule Interface
 * @notice Entry point for DreamDEX event contracts: market registry and complete-set minting/merging.
 */
interface IBinaryMarketsModule {
    struct MarketInfo {
        address pool;
        address market;
        uint8 status; // 0 = Listed, 1 = Trading, 2 = Locked, 4 = Resolved, 5 = Voided
        uint256 yesId;
        uint256 noId;
        uint256 expiry;
    }

    function mintCompleteSet(bytes32 marketId, uint256 amount) external;
    function mergeCompleteSet(bytes32 marketId, uint256 amount) external;
    function markets(bytes32 marketId) external view returns (
        address pool,
        address market,
        uint8 status,
        uint256 yesId,
        uint256 noId,
        uint256 expiry
    );
}
