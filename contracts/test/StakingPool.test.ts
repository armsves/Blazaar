import { expect } from "chai";
import { ethers } from "hardhat";

describe("StakingPool", function () {
  let StakingPool;
  let stakingPool;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    StakingPool = await ethers.getContractFactory("StakingPool");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    stakingPool = await StakingPool.deploy();
    await stakingPool.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await stakingPool.owner()).to.equal(owner.address);
    });

    it("Should have zero total staked initially", async function () {
      expect(await stakingPool.totalStaked()).to.equal(0);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      await stakingPool.connect(addr1).stake(ethers.utils.parseEther("1"));
      expect(await stakingPool.totalStaked()).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should update the staker's balance", async function () {
      await stakingPool.connect(addr1).stake(ethers.utils.parseEther("1"));
      expect(await stakingPool.stakedBalance(addr1.address)).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should emit a Staked event", async function () {
      await expect(stakingPool.connect(addr1).stake(ethers.utils.parseEther("1")))
        .to.emit(stakingPool, "Staked")
        .withArgs(addr1.address, ethers.utils.parseEther("1"));
    });
  });

  describe("Withdrawing", function () {
    beforeEach(async function () {
      await stakingPool.connect(addr1).stake(ethers.utils.parseEther("1"));
    });

    it("Should allow users to withdraw tokens", async function () {
      await stakingPool.connect(addr1).withdraw(ethers.utils.parseEther("1"));
      expect(await stakingPool.totalStaked()).to.equal(0);
    });

    it("Should update the staker's balance after withdrawal", async function () {
      await stakingPool.connect(addr1).withdraw(ethers.utils.parseEther("1"));
      expect(await stakingPool.stakedBalance(addr1.address)).to.equal(0);
    });

    it("Should emit a Withdrawn event", async function () {
      await expect(stakingPool.connect(addr1).withdraw(ethers.utils.parseEther("1")))
        .to.emit(stakingPool, "Withdrawn")
        .withArgs(addr1.address, ethers.utils.parseEther("1"));
    });
  });
});