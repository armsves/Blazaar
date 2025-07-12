// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketplaceNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    event Minted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event TokenURIUpdated(uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("MarketplaceNFT", "MNFT") Ownable(msg.sender) {}

    function mint(string memory _tokenURI) external onlyOwner {
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        emit Minted(tokenId, msg.sender, _tokenURI);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
        emit TokenURIUpdated(tokenId, _tokenURI);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(ownerOf(tokenId) == from, "Not the owner");
        require(to != address(0), "Invalid address");
        super.transferFrom(from, to, tokenId);
    }
}