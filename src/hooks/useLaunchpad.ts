import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getTokenFactoryContract, getNFTFactoryContract, getStakingPoolContract } from '../utils/contracts';
import contractAddresses from '../constants/contractAddresses.json';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
}

interface NFT {
  id: string;
  name: string;
  symbol: string;
  address: string;
}

export const useLaunchpad = () => {
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [tokenAddress, setTokenAddress] = useState('');
  const [nftAddress, setNftAddress] = useState('');
  const [stakingAddress, setStakingAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Use the actual contract addresses from your JSON file
        const tokenFactory = getTokenFactoryContract(contractAddresses.TokenFactory, signer);
        const nftFactory = getNFTFactoryContract(contractAddresses.NFTFactory, signer);
        const stakingPool = getStakingPoolContract(contractAddresses.StakingPool, signer);

        // Fetch deployed contract addresses
        const tokenFactoryAddress = await tokenFactory.getTokenAddress();
        const nftFactoryAddress = await nftFactory.getNFTAddress();
        const stakingPoolAddress = await stakingPool.getStakingAddress();

        setTokenAddress(tokenFactoryAddress);
        setNftAddress(nftFactoryAddress);
        setStakingAddress(stakingPoolAddress);

        // For now, set empty arrays - you'll need to implement these methods in your smart contracts
        // Example of what the contract calls might look like:
        // const deployedTokens = await tokenFactory.getDeployedTokens();
        // const deployedNFTs = await nftFactory.getDeployedNFTs();
        
        setTokens([]); // Start with empty array
        setNfts([]);   // Start with empty array

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  // Function to add a new token to the list (call this after successful token creation)
  const addToken = (token: Token) => {
    setTokens(prev => [...prev, token]);
  };

  // Function to add a new NFT to the list (call this after successful NFT creation)
  const addNFT = (nft: NFT) => {
    setNfts(prev => [...prev, nft]);
  };

  return { 
    loading, 
    tokens, 
    nfts, 
    tokenAddress, 
    nftAddress, 
    stakingAddress, 
    error,
    addToken,
    addNFT
  };
};