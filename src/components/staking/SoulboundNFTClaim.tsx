import React from 'react';
import { useStaking } from '../../hooks/useStaking';

const SoulboundNFTClaim: React.FC = () => {
  const { claimSoulboundNFT, isClaiming, claimError } = useStaking();

  const handleClaim = async () => {
    try {
      await claimSoulboundNFT();
    } catch (error) {
      console.error("Error claiming soulbound NFT:", error);
    }
  };

  return (
    <div className="soulbound-nft-claim">
      <h2>Claim Your Soulbound NFT</h2>
      <button onClick={handleClaim} disabled={isClaiming}>
        {isClaiming ? 'Claiming...' : 'Claim NFT'}
      </button>
      {claimError && <p className="error">{claimError}</p>}
    </div>
  );
};

export default SoulboundNFTClaim;