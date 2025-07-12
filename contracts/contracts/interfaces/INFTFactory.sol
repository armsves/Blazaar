// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INFTFactory {
    event NFTCreated(address indexed nftAddress, string name, string symbol, address indexed creator);

    function createNFT(string calldata name, string calldata symbol) external returns (address);
    
    function getNFTsByCreator(address creator) external view returns (address[] memory);
    
    function setBaseURI(string calldata baseURI) external;
    
    function getBaseURI() external view returns (string memory);
}