import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTFactory", function () {
  let NFTFactory;
  let nftFactory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    NFTFactory = await ethers.getContractFactory("NFTFactory");
    [owner, addr1, addr2] = await ethers.getSigners();
    nftFactory = await NFTFactory.deploy();
    await nftFactory.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftFactory.owner()).to.equal(owner.address);
    });
  });

  describe("Creating NFTs", function () {
    it("Should create a new NFT", async function () {
      const tx = await nftFactory.createNFT("Test NFT", "TNFT", "https://example.com/nft");
      await tx.wait();

      const nftAddress = await nftFactory.nftAddresses(0);
      const nftContract = await ethers.getContractAt("MarketplaceNFT", nftAddress);
      const name = await nftContract.name();
      expect(name).to.equal("Test NFT");
    });
  });

  describe("Minting NFTs", function () {
    it("Should allow minting of NFTs", async function () {
      const tx = await nftFactory.createNFT("Test NFT", "TNFT", "https://example.com/nft");
      await tx.wait();

      const nftAddress = await nftFactory.nftAddresses(0);
      const nftContract = await ethers.getContractAt("MarketplaceNFT", nftAddress);
      const mintTx = await nftContract.connect(addr1).mint(addr1.address);
      await mintTx.wait();

      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
    });
  });
});