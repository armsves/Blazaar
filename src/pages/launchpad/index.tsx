import React, { useState } from 'react';
import LaunchpadDashboard from '../../components/launchpad/LaunchpadDashboard';
import TokenLaunchForm from '../../components/launchpad/TokenLaunchForm';
import NFTLaunchForm from '../../components/launchpad/NFTLaunchForm';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
}

interface NFT {
  id: string;
  name: string;
  symbol: string;
  address: string;
}

const LaunchpadPage = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nfts, setNFTs] = useState<NFT[]>([]);

  const handleTokenCreated = (token: Token) => {
    setTokens(prev => [...prev, token]);
  };

  const handleNFTCreated = (nft: NFT) => {
    setNFTs(prev => [...prev, nft]);
  };

  return (
    <div>
      <h1>Launchpad</h1>
      <LaunchpadDashboard />
      <TokenLaunchForm onTokenCreated={handleTokenCreated} />
      <NFTLaunchForm onNFTCreated={handleNFTCreated} />
    </div>
  );
}

export default LaunchpadPage;