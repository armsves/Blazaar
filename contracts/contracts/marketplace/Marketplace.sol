// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable, ERC721Holder {
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;

    event Listed(address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event Unlisted(address indexed nftContract, uint256 indexed tokenId);
    event Sold(address indexed nftContract, uint256 indexed tokenId, address buyer, uint256 price);

    constructor() Ownable(msg.sender) {}

    function listNFT(address nftContract, uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than zero");
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isActive: true
        });

        emit Listed(nftContract, tokenId, price);
    }

    function unlistNFT(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "NFT is not listed");
        require(listing.seller == msg.sender, "Only seller can unlist");

        listing.isActive = false;
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);

        emit Unlisted(nftContract, tokenId);
    }

    function buyNFT(address nftContract, uint256 tokenId) external payable {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "NFT is not listed");
        require(msg.value >= listing.price, "Insufficient funds");

        listing.isActive = false;
        payable(listing.seller).transfer(listing.price);
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);

        emit Sold(nftContract, tokenId, msg.sender, listing.price);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}