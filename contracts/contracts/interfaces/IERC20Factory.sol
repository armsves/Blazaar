// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Factory {
    function createToken(string memory name, string memory symbol, uint256 initialSupply) external returns (address);
    function getTokenAddress(string memory name) external view returns (address);
    function getAllTokens() external view returns (address[] memory);
}