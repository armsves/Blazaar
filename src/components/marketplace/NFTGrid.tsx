import React from 'react';
import NFTCard from './NFTCard';
import { useMarketplace } from '../../hooks/useMarketplace';

const NFTGrid: React.FC = () => {
  const { nfts, loading } = useMarketplace();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
};

export default NFTGrid;