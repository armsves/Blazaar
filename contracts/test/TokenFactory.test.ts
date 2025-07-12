import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenFactory", function () {
  let TokenFactory;
  let tokenFactory;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    TokenFactory = await ethers.getContractFactory("TokenFactory");
    [owner, addr1, addr2] = await ethers.getSigners();
    tokenFactory = await TokenFactory.deploy();
    await tokenFactory.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tokenFactory.owner()).to.equal(owner.address);
    });
  });

  describe("Token Creation", function () {
    it("Should create a new token", async function () {
      const tx = await tokenFactory.createToken("Test Token", "TT", 1000);
      await tx.wait();

      const tokenAddress = await tokenFactory.tokens(0);
      const tokenContract = await ethers.getContractAt("ERC20Token", tokenAddress);
      expect(await tokenContract.name()).to.equal("Test Token");
      expect(await tokenContract.symbol()).to.equal("TT");
      expect(await tokenContract.totalSupply()).to.equal(1000);
    });

    it("Should emit TokenCreated event", async function () {
      await expect(tokenFactory.createToken("Another Token", "AT", 2000))
        .to.emit(tokenFactory, "TokenCreated")
        .withArgs(owner.address, "Another Token", "AT", 2000);
    });
  });
});