import React from 'react';
import { useLaunchpad } from '../../hooks/useLaunchpad';
import TokenLaunchForm from './TokenLaunchForm';
import NFTLaunchForm from './NFTLaunchForm';

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

const LaunchpadDashboard: React.FC = () => {
  const { loading, tokens, nfts, tokenAddress, nftAddress, stakingAddress, error, addToken, addNFT } = useLaunchpad();

  if (loading) {
    return <div className="text-center p-4">Loading contracts...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="launchpad-dashboard p-6">
      <h1 className="text-2xl font-bold mb-6">Launchpad Dashboard</h1>
      
      {/* Contract Info Section */}
      <div className="contract-info mb-8 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Contract Addresses</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div><strong>Token:</strong> {tokenAddress || 'N/A'}</div>
          <div><strong>NFT:</strong> {nftAddress || 'N/A'}</div>
          <div><strong>Staking:</strong> {stakingAddress || 'N/A'}</div>
        </div>
      </div>

      {/* Launch Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Create a New Token</h2>
          <TokenLaunchForm onTokenCreated={addToken} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Create a New NFT</h2>
          <NFTLaunchForm onNFTCreated={addNFT} />
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="tokens-list">
          <h2 className="text-xl font-semibold mb-4">Launched Tokens</h2>
          {tokens.length > 0 ? (
            <ul className="space-y-2">
              {tokens.map((token) => (
                <li key={token.id} className="p-2 border rounded">
                  <div className="font-medium">{token.name}</div>
                  <div className="text-sm text-gray-600">{token.symbol}</div>
                  <div className="text-xs text-gray-500">{token.address}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tokens launched yet.</p>
          )}
        </div>

        <div className="nfts-list">
          <h2 className="text-xl font-semibold mb-4">Launched NFTs</h2>
          {nfts.length > 0 ? (
            <ul className="space-y-2">
              {nfts.map((nft) => (
                <li key={nft.id} className="p-2 border rounded">
                  <div className="font-medium">{nft.name}</div>
                  <div className="text-sm text-gray-600">{nft.symbol}</div>
                  <div className="text-xs text-gray-500">{nft.address}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No NFTs launched yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaunchpadDashboard;