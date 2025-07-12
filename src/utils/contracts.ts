import { ethers } from 'ethers';
import TokenFactoryABI from '../../contracts/artifacts/contracts/token/TokenFactory.sol/TokenFactory.json';
import NFTFactoryABI from '../../contracts/artifacts/contracts/nft/NFTFactory.sol/NFTFactory.json';
import StakingPoolArtifact from '../../contracts/artifacts/contracts/staking/StakingPool.sol/StakingPool.json';
import MarketplaceArtifact from '../../contracts/artifacts/contracts/marketplace/Marketplace.sol/Marketplace.json';
import contractAddresses from '../constants/contractAddresses.json';

const getContractInstance = (address: string, abi: any, signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(address, abi, signerOrProvider);
};

export function getTokenFactoryContract(address: string, signer: ethers.Signer) {
  return new ethers.Contract(address, TokenFactoryABI.abi, signer);
}

export function getNFTFactoryContract(address: string, signer: ethers.Signer) {
  return new ethers.Contract(address, NFTFactoryABI.abi, signer);
}

export const getStakingPoolContract = (address: string, signerOrProvider: ethers.Signer | ethers.Provider) => {
  return getContractInstance(address, StakingPoolArtifact.abi, signerOrProvider);
};

export const getMarketplaceContract = (address: string, signerOrProvider: ethers.Signer | ethers.Provider) => {
  return getContractInstance(address, MarketplaceArtifact.abi, signerOrProvider);
};

// Add the createNFT function
export const createNFT = async (name: string, symbol: string, uri: string) => {
  // Use the actual NFT factory contract address from the JSON file
  const NFT_FACTORY_ADDRESS = contractAddresses.NFTFactory;
  
  // Get the provider and signer (assuming you have MetaMask or similar)
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Please install MetaMask');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Get the contract instance
  const nftFactory = getNFTFactoryContract(NFT_FACTORY_ADDRESS, signer);
  
  // Call the contract method (adjust method name based on your actual contract)
  const transaction = await nftFactory.createNFT(name, symbol, uri);
  const receipt = await transaction.wait();
  
  return receipt.transactionHash;
};