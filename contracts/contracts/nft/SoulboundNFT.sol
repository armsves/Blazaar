// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundNFT is ERC721Enumerable, Ownable {
    string private _baseTokenURI;
    mapping(address => bool) public hasClaimed;

    event SoulboundNFTMinted(address indexed to, uint256 tokenId);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {}

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function mintSoulboundNFT(address to) external onlyOwner {
        require(!hasClaimed[to], "SoulboundNFT: Already claimed");
        uint256 tokenId = totalSupply() + 1;
        _mint(to, tokenId);
        hasClaimed[to] = true;
        emit SoulboundNFTMinted(to, tokenId);
    }

    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "SoulboundNFT: Not the owner");
        _burn(tokenId);
    }
}