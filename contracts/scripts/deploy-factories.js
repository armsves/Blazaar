const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Deploying TokenFactory and NFTFactory contracts...");

    const TokenFactory = await ethers.getContractFactory("TokenFactory");
    const NFTFactory = await ethers.getContractFactory("NFTFactory");

    console.log("Deploying TokenFactory...");
    const tokenFactory = await TokenFactory.deploy();
    await tokenFactory.waitForDeployment();
    const tokenFactoryAddress = await tokenFactory.getAddress();
    console.log("TokenFactory deployed to:", tokenFactoryAddress);

    console.log("Deploying NFTFactory...");
    const nftFactory = await NFTFactory.deploy();
    await nftFactory.waitForDeployment();
    const nftFactoryAddress = await nftFactory.getAddress();
    console.log("NFTFactory deployed to:", nftFactoryAddress);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    //const tokenFactoryAddress = '0x2b86c3b937a37Bc14c6556a59CF388180081BB95';
    //const nftFactoryAddress = '0xCc8934e07Ed1b214076BFAA09C7404D6c60C5A2A';
    // Save addresses to a file for your React app
    const addresses = {
        TokenFactory: tokenFactoryAddress,
        NFTFactory: nftFactoryAddress
    };

    fs.writeFileSync(
        "../src/constants/contractAddresses.json",
        JSON.stringify(addresses, null, 2)
    );

    console.log("Contract addresses saved to ./src/constants/contractAddresses.json");

    return addresses;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });