import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { useAccount } from 'wagmi';
import stakingAddress from '../constants/stakingAddress.json';
import { showSuccess, showError, showInfo } from '../utils/toast';

// Actual StakingPool contract ABI from your artifact
const STAKING_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "earned",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "rewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Define the contract methods based on your ACTUAL ABI
interface StakingContractMethods {
  stake(amount: bigint): Promise<ethers.TransactionResponse>;
  withdraw(amount: bigint): Promise<ethers.TransactionResponse>;
  getReward(): Promise<ethers.TransactionResponse>;
  earned(address: string): Promise<bigint>;
  balances(address: string): Promise<bigint>;
  rewards(address: string): Promise<bigint>;
  totalSupply(): Promise<bigint>;
  stakingToken(): Promise<string>;
}

// Use type intersection instead of extending Contract
type StakingContract = Contract & StakingContractMethods;

const STAKING_CONTRACT_ADDRESS = stakingAddress.StakingPool as `0x${string}`;

export const useStaking = () => {
  const { address: account, isConnected } = useAccount();
  const [stakingPool, setStakingPool] = useState<StakingContract | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [rewards, setRewards] = useState('0');
  const [stakedAmount, setStakedAmount] = useState('0');
  const [totalStaked, setTotalStaked] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStakingPool = async () => {
      try {
        const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com');
        const contract = new ethers.Contract(
          STAKING_CONTRACT_ADDRESS, 
          STAKING_ABI, 
          provider
        ) as StakingContract;
        
        setStakingPool(contract);
        
        if (account) {
          await loadStakingData(contract);
        }
      } catch (error) {
        console.error('Error loading staking pool:', error);
        setError('Failed to load staking pool');
      }
    };

    loadStakingPool();
  }, [account]);

  const loadStakingData = async (contract: StakingContract) => {
    if (!account) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading staking data for account:', account);
      console.log('Contract address:', STAKING_CONTRACT_ADDRESS);
      
      // Use the ACTUAL contract methods from your ABI
      const [userEarned, userBalance, totalSupply] = await Promise.all([
        contract.earned(account),      // earned(address) - pending rewards
        contract.balances(account),    // balances(address) - staked amount  
        contract.totalSupply()         // totalSupply() - total staked in pool
      ]);

      console.log('Raw contract data:', {
        userEarned: userEarned.toString(),
        userBalance: userBalance.toString(),
        totalSupply: totalSupply.toString()
      });

      setRewards(ethers.formatEther(userEarned));
      setStakedAmount(ethers.formatEther(userBalance));
      setTotalStaked(ethers.formatEther(totalSupply));
      
      console.log('Formatted data:', {
        rewards: ethers.formatEther(userEarned),
        stakedAmount: ethers.formatEther(userBalance),
        totalStaked: ethers.formatEther(totalSupply)
      });

    } catch (error) {
      console.error('Error loading staking data:', error);
      setError(`Failed to load staking data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const stake = async () => {
    if (!stakingPool || !account || !stakeAmount) {
      showError('Please connect wallet and enter stake amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = stakingPool.connect(signer);

      const amount = ethers.parseEther(stakeAmount);
      console.log('Staking amount:', amount.toString());
      
      showInfo('Processing stake transaction...');
      const tx = await (contractWithSigner as any).stake(amount);
      await tx.wait();
      
      showSuccess(`Successfully staked ${stakeAmount} CHZ!`);
      await loadStakingData(stakingPool);
      setStakeAmount('');
    } catch (error) {
      console.error('Error staking:', error);
      showError(`Failed to stake tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount: string) => {
    if (!stakingPool || !account) {
      showError('Please connect wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = stakingPool.connect(signer);

      const withdrawAmount = ethers.parseEther(amount);
      console.log('With withdrawing amount:', withdrawAmount.toString());
      
      showInfo('Processing withdrawal transaction...');
      const tx = await (contractWithSigner as any).withdraw(withdrawAmount);
      await tx.wait();
      
      showSuccess(`Successfully withdrew ${amount} CHZ!`);
      await loadStakingData(stakingPool);
    } catch (error) {
      console.error('Error withdrawing:', error);
      showError(`Failed to withdraw tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    if (!stakingPool || !account) {
      showError('Please connect wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) throw new Error('No wallet found');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = stakingPool.connect(signer);

      console.log('Claiming rewards...');
      showInfo('Processing claim rewards transaction...');
      const tx = await (contractWithSigner as any).getReward();
      await tx.wait();
      
      showSuccess('Rewards claimed successfully!');
      await loadStakingData(stakingPool);
    } catch (error) {
      console.error('Error claiming rewards:', error);
      showError(`Failed to claim rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    stake,
    withdraw,
    claimRewards,
    stakeAmount,
    setStakeAmount,
    rewards,
    stakedAmount,
    totalStaked,
    loading,
    error,
    isConnected,
    refreshData: () => stakingPool && loadStakingData(stakingPool)
  };
};