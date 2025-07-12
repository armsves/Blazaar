// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20Token.sol";

contract TokenFactory {
    event TokenCreated(address tokenAddress, string name, string symbol, uint256 initialSupply);

    function createToken(string memory name, string memory symbol, uint256 initialSupply) public returns (address) {
        ERC20Token newToken = new ERC20Token(name, symbol, initialSupply);
        emit TokenCreated(address(newToken), name, symbol, initialSupply);
        return address(newToken);
    }
}