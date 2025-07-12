import { useState } from 'react';
import { ethers } from 'ethers';
import { TokenFactory, NFTFactory } from '../utils/contracts';

export const useFactory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createToken = async (tokenDetails) => {
    setLoading(true);
    try {
      const contract = TokenFactory();
      const tx = await contract.createToken(tokenDetails);
      await tx.wait();
      setLoading(false);
      return tx;
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const createNFT = async (nftDetails) => {
    setLoading(true);
    try {
      const contract = NFTFactory();
      const tx = await contract.createNFT(nftDetails);
      await tx.wait();
      setLoading(false);
      return tx;
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createToken,
    createNFT,
  };
};