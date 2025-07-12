import React from 'react';
import StakingPool from '../../components/staking/StakingPool';
import StakingRewards from '../../components/staking/StakingRewards';
import SoulboundNFTClaim from '../../components/staking/SoulboundNFTClaim';
import Layout from '../../components/common/Layout';

const StakingPage = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Staking Dashboard</h1>
      <StakingPool />
      <StakingRewards />
      <SoulboundNFTClaim />
    </Layout>
  );
};

export default StakingPage;