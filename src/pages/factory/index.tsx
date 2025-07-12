import React from 'react';
import TokenFactory from '../../components/factory/TokenFactory';
import NFTFactory from '../../components/factory/NFTFactory';
import Layout from '../../components/common/Layout';

const FactoryPage = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Factory</h1>
      <TokenFactory />
      <NFTFactory />
    </Layout>
  );
};

export default FactoryPage;