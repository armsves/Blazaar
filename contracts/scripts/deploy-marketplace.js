const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy Marketplace contract
    console.log("Deploying Marketplace...");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy({
        maxFeePerGas: ethers.parseUnits("2501", "gwei"), // 2501 gwei
        maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"), // 1 gwei
        gasLimit: 5000000
    });
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("Marketplace deployed to:", marketplaceAddress);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);

    // Save addresses to a file for your React app
    const addresses = {
        Marketplace: marketplaceAddress
    };

    fs.writeFileSync(
        "../src/constants/marketplaceAddress.json",
        JSON.stringify(addresses, null, 2)
    );

    console.log("Contract addresses saved to ./src/constants/marketplaceAddress.json");

    // Optionally, you can set up additional contracts or configurations here

    return addresses;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });