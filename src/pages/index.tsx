import React from 'react';
import NFTGrid from '../components/marketplace/NFTGrid';
import MarketplaceFilters from '../components/marketplace/MarketplaceFilters';

const Home: React.FC = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4">Welcome to the Blazaar Marketplace</h1>
      <MarketplaceFilters />
      <NFTGrid />
    </div>
  );
};

export default Home;