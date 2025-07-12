import { expect } from "chai";
import { ethers } from "hardhat";

describe("Marketplace Contract", function () {
  let Marketplace;
  let marketplace;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Marketplace = await ethers.getContractFactory("Marketplace");
    [owner, addr1, addr2] = await ethers.getSigners();
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {
    it("Should create a new listing", async function () {
      await marketplace.createListing("NFT1", ethers.utils.parseEther("1"), addr1.address);
      const listing = await marketplace.listings(0);
      expect(listing.tokenId).to.equal("NFT1");
      expect(listing.price).to.equal(ethers.utils.parseEther("1"));
      expect(listing.seller).to.equal(addr1.address);
    });

    it("Should allow users to purchase a listing", async function () {
      await marketplace.createListing("NFT1", ethers.utils.parseEther("1"), addr1.address);
      await marketplace.connect(addr2).purchaseListing(0, { value: ethers.utils.parseEther("1") });
      const listing = await marketplace.listings(0);
      expect(listing.seller).to.equal(ethers.constants.AddressZero);
    });
  });
});