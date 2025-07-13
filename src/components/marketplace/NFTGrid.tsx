import React from 'react';
import NFTCard from './NFTCard';
import { NFTItem } from '../../types/nft';

interface NFTGridProps {
  nfts: NFTItem[];
  connectedWallet?: `0x${string}`;
  isConnected: boolean;
  onSell: (nft: NFTItem) => Promise<void>;
}

const NFTGrid: React.FC<NFTGridProps> = ({ 
  nfts, 
  connectedWallet, 
  isConnected, 
  onSell 
}) => {
  if (!nfts || nfts.length === 0) {
    return <div className="text-center text-gray-500 py-8">No NFTs found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts.map((nft) => (
        <NFTCard 
          key={`${nft.collection}-${nft.tokenId}`}
          nft={nft}
          connectedWallet={connectedWallet}
          isConnected={isConnected}
          onSell={onSell}
          onBuy={(nft) => {
            console.log('Buying NFT:', nft);
            // Implement buy logic here
          }}
        />
      ))}
    </div>
  );
};

export default NFTGrid;