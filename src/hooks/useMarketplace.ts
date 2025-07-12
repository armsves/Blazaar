import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getMarketplaceContract } from '../utils/contracts';
import { NFT } from '../types/marketplace';
import marketplaceAddresses from '../constants/marketplaceAddress.json';

export const useMarketplace = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        // Use a direct RPC provider instead of browser provider
        const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com');
        
        const marketplaceContract = getMarketplaceContract(marketplaceAddresses.Marketplace, provider);
        
        const nftData = await marketplaceContract.getAllNFTs();
        setNfts(nftData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  return { nfts, loading, error };
};