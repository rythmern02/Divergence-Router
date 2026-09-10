// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MockERC6909.sol";

contract MockBinaryPool {
    IERC20 public immutable collateralToken;
    MockERC6909 public immutable outcomeToken;
    uint256 public immutable yesId;
    uint256 public immutable noId;

    bool public shouldFailMint;

    constructor(
        address _collateralToken,
        address _outcomeToken,
        uint256 _yesId,
        uint256 _noId
    ) {
        collateralToken = IERC20(_collateralToken);
        outcomeToken = MockERC6909(_outcomeToken);
        yesId = _yesId;
        noId = _noId;
    }

    function setShouldFailMint(bool fail) external {
        shouldFailMint = fail;
    }

    function mintSet(address yesTo, address noTo, uint256 amount) external {
        require(!shouldFailMint, "Mint execution failed on-chain");

        collateralToken.transferFrom(msg.sender, address(this), amount);
        outcomeToken.mint(yesTo, yesId, amount);
        outcomeToken.mint(noTo, noId, amount);
    }
}
