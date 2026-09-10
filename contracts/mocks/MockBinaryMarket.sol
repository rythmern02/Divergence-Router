// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockBinaryMarket {
    uint256 public immutable yesId;
    uint256 public immutable noId;
    address public immutable pool;
    uint8 public status; // 0 = Listed, 1 = Trading, 2 = Locked, 4 = Resolved, 5 = Voided
    uint64 public expiry;
    bool public isResolved;

    constructor(
        address _pool,
        uint256 _yesId,
        uint256 _noId,
        uint8 _status,
        uint64 _expiry
    ) {
        pool = _pool;
        yesId = _yesId;
        noId = _noId;
        status = _status;
        expiry = _expiry;
    }

    function setStatus(uint8 _status) external {
        status = _status;
    }

    function setIsResolved(bool _resolved) external {
        isResolved = _resolved;
    }
}
