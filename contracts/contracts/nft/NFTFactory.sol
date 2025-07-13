// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MarketplaceNFT.sol";
import "./SoulboundNFT.sol";

contract NFTFactory {
    event NFTCreated(address indexed nftAddress, string name, string symbol, address indexed creator);

    function createMarketplaceNFT() external returns (address) {
        MarketplaceNFT newNFT = new MarketplaceNFT();
        
        // Transfer ownership to the caller
        newNFT.transferOwnership(msg.sender);
        
        emit NFTCreated(address(newNFT), "MarketplaceNFT", "MNFT", msg.sender);
        return address(newNFT);
    }

    function createSoulboundNFT(string memory name, string memory symbol) external returns (address) {
        SoulboundNFT newSoulboundNFT = new SoulboundNFT(name, symbol);
        
        // Transfer ownership to the caller
        newSoulboundNFT.transferOwnership(msg.sender);
        
        emit NFTCreated(address(newSoulboundNFT), name, symbol, msg.sender);
        return address(newSoulboundNFT);
    }
}