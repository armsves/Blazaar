const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy StakingPool contract
    console.log("Deploying StakingPool...");
    const StakingPool = await ethers.getContractFactory("StakingPool");
    
    // Replace with actual token address on Chiliz Spicy testnet
    // This is just an example - use your actual token address
    const stakingTokenAddress = "0x721ef6871f1c4efe730dce047d40d1743b886946"; // Example CHZ token address
    const rewardRate = ethers.parseEther("0.1"); // 0.1 tokens per second
    
    const stakingPool = await StakingPool.deploy(stakingTokenAddress, rewardRate);
    await stakingPool.waitForDeployment();
    const stakingPoolAddress = await stakingPool.getAddress();
    console.log("StakingPool deployed to:", stakingPoolAddress);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);

    // Save addresses to a file for your React app
    const addresses = {
        StakingPool: stakingPoolAddress
    };

    fs.writeFileSync(
        "../src/constants/stakingAddress.json",
        JSON.stringify(addresses, null, 2)
    );

    console.log("Contract addresses saved to ./src/constants/stakingAddress.json");

    return addresses;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });