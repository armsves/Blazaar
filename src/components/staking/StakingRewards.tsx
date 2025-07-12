import React from 'react';
import { useStaking } from '../../hooks/useStaking';

const StakingRewards: React.FC = () => {
  const { rewards, loading, error } = useStaking();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading rewards: {error.message}</div>;

  return (
    <div>
      <h2>Your Staking Rewards</h2>
      <ul>
        {rewards.map((reward, index) => (
          <li key={index}>
            {reward.amount} {reward.token} - {reward.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StakingRewards;