import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { StakingPoolContract } from '../utils/contracts';
import { useWallet } from 'wagmi';

export const useStaking = () => {
  const { account } = useWallet();
  const [stakingPool, setStakingPool] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [rewards, setRewards] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStakingPool = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = StakingPoolContract(provider);
      setStakingPool(contract);
    };

    loadStakingPool();
  }, []);

  const stakeTokens = async () => {
    if (!stakingPool || !account) return;

    setLoading(true);
    try {
      const tx = await stakingPool.stake(ethers.utils.parseEther(stakeAmount));
      await tx.wait();
      setStakeAmount('');
    } catch (error) {
      console.error('Error staking tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    if (!stakingPool || !account) return;

    try {
      const reward = await stakingPool.calculateRewards(account);
      setRewards(ethers.utils.formatEther(reward));
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  return {
    stakeAmount,
    setStakeAmount,
    stakeTokens,
    rewards,
    fetchRewards,
    loading,
  };
};