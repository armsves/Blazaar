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
        const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com');

        const tokenFactory = getTokenFactoryContract(contractAddresses.TokenFactory, provider);
        const nftFactory = getNFTFactoryContract(contractAddresses.NFTFactory, provider);

        // Fetch NFTs created by querying events
        const nftFilter = nftFactory.filters.NFTCreated();
        const nftEvents = await nftFactory.queryFilter(nftFilter);
        
        // Filter for EventLog instances and map them
        const deployedNFTs: NFT[] = nftEvents
          .filter((event): event is ethers.EventLog => event instanceof ethers.EventLog)
          .map((event, index) => ({
            id: index.toString(),
            name: event.args.name,
            symbol: event.args.symbol,
            address: event.args.nftAddress
          }));

        setNfts(deployedNFTs);
        setTokens([]);

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