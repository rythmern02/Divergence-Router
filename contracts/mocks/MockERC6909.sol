// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC6909.sol";

contract MockERC6909 is IERC6909 {
    mapping(address => mapping(uint256 => uint256)) public override balanceOf;
    mapping(address => mapping(address => mapping(uint256 => uint256))) public override allowance;
    mapping(address => mapping(address => bool)) public override isOperator;

    event Transfer(address caller, address indexed sender, address indexed receiver, uint256 indexed id, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 indexed id, uint256 amount);
    event OperatorSet(address indexed owner, address indexed operator, bool approved);

    function transfer(address receiver, uint256 id, uint256 amount) external override returns (bool) {
        require(balanceOf[msg.sender][id] >= amount, "Insufficient balance");
        balanceOf[msg.sender][id] -= amount;
        balanceOf[receiver][id] += amount;
        emit Transfer(msg.sender, msg.sender, receiver, id, amount);
        return true;
    }

    function transferFrom(address sender, address receiver, uint256 id, uint256 amount) external override returns (bool) {
        if (msg.sender != sender && !isOperator[sender][msg.sender]) {
            uint256 allowed = allowance[sender][msg.sender][id];
            if (allowed != type(uint256).max) {
                require(allowed >= amount, "Insufficient allowance");
                allowance[sender][msg.sender][id] = allowed - amount;
            }
        }
        require(balanceOf[sender][id] >= amount, "Insufficient balance");
        balanceOf[sender][id] -= amount;
        balanceOf[receiver][id] += amount;
        emit Transfer(msg.sender, sender, receiver, id, amount);
        return true;
    }

    function approve(address spender, uint256 id, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender][id] = amount;
        emit Approval(msg.sender, spender, id, amount);
        return true;
    }

    function setOperator(address operator, bool approved) external override returns (bool) {
        isOperator[msg.sender][operator] = approved;
        emit OperatorSet(msg.sender, operator, approved);
        return true;
    }

    function mint(address to, uint256 id, uint256 amount) external {
        balanceOf[to][id] += amount;
        emit Transfer(msg.sender, address(0), to, id, amount);
    }

    function burn(address from, uint256 id, uint256 amount) external {
        require(balanceOf[from][id] >= amount, "Insufficient balance");
        balanceOf[from][id] -= amount;
        emit Transfer(msg.sender, from, address(0), id, amount);
    }
}
