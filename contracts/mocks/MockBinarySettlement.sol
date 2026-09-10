// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC6909.sol";
import "../DivergenceRouter.sol";

contract MockBinarySettlement is IBinarySettlement {
    IERC20 public immutable collateralToken;
    MockERC6909 public immutable outcomeToken;

    mapping(uint256 => bool) public winningOutcomes;
    mapping(uint256 => bool) public voidedOutcomes;

    constructor(address _collateralToken, address _outcomeToken) {
        collateralToken = IERC20(_collateralToken);
        outcomeToken = MockERC6909(_outcomeToken);
    }

    function setWinningOutcome(uint256 outcomeId, bool isWinner) external {
        winningOutcomes[outcomeId] = isWinner;
    }

    function setVoidedOutcome(uint256 outcomeId, bool isVoided) external {
        voidedOutcomes[outcomeId] = isVoided;
    }

    function redeem(
        uint256 outcomeId,
        uint256 amount,
        address to
    ) external override returns (uint256 collateralOut) {
        // Burn outcome tokens from caller (using operator permission)
        outcomeToken.transferFrom(msg.sender, address(this), outcomeId, amount);

        if (voidedOutcomes[outcomeId]) {
            collateralOut = amount / 2;
        } else if (winningOutcomes[outcomeId]) {
            collateralOut = amount;
        } else {
            collateralOut = 0;
        }

        if (collateralOut > 0) {
            collateralToken.transfer(to, collateralOut);
        }
    }
}
