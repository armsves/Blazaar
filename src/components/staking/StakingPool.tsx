import React, { useState, useEffect } from 'react';
import { useStaking } from '../../hooks/useStaking';

const StakingPool: React.FC = () => {
  const { stakeTokens, unstakeTokens, rewards, totalStaked } = useStaking();
  const [amount, setAmount] = useState<string>('');

  const handleStake = () => {
    if (amount) {
      stakeTokens(amount);
      setAmount('');
    }
  };

  const handleUnstake = () => {
    unstakeTokens();
  };

  return (
    <div className="staking-pool">
      <h2>Staking Pool</h2>
      <div>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to stake"
        />
        <button onClick={handleStake}>Stake</button>
        <button onClick={handleUnstake}>Unstake</button>
      </div>
      <div>
        <h3>Total Staked: {totalStaked}</h3>
        <h3>Rewards: {rewards}</h3>
      </div>
    </div>
  );
};

export default StakingPool;