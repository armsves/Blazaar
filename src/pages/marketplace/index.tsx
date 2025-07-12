import React from 'react';
import NFTGrid from '../../components/marketplace/NFTGrid';
import MarketplaceFilters from '../../components/marketplace/MarketplaceFilters';

const MarketplacePage = () => {
  return (
      <div className="marketplace">
        <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
        <MarketplaceFilters />
        <NFTGrid />
      </div>
  );
};

export default MarketplacePage;