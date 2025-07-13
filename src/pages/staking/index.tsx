import React from 'react';
import StakingPool from '../../components/staking/StakingPool';
import StakingRewards from '../../components/staking/StakingRewards';

const StakingPage = () => {
  return (
    <>
      <StakingPool />
      <StakingRewards />
    </>
  );
};

export default StakingPage;