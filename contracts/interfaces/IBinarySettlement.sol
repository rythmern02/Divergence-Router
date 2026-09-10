// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBinarySettlement Interface
 * @notice Payout redemption interface for settled DreamDEX event contract outcomes.
 */
interface IBinarySettlement {
    /**
     * @notice Redeems winning outcome tokens for collateral.
     * @param marketId The identifier of the resolved event market.
     * @param outcomeIdx The outcome index (0 for YES/UP, 1 for NO/DOWN).
     * @param amount The number of outcome tokens to redeem.
     * @return payout The amount of collateral token returned to the caller.
     */
    function redeem(
        bytes32 marketId,
        uint8 outcomeIdx,
        uint256 amount
    ) external returns (uint256 payout);
}
