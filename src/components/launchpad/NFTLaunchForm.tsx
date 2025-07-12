import React, { useState } from 'react';

interface NFT {
  id: string;
  name: string;
  symbol: string;
  address: string;
}

interface NFTLaunchFormProps {
  onNFTCreated: (nft: NFT) => void;
}

const NFTLaunchForm: React.FC<NFTLaunchFormProps> = ({ onNFTCreated }) => {
  const [nftName, setNftName] = useState('');
  const [nftSymbol, setNftSymbol] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [rewardToken, setRewardToken] = useState('');
  const [soulbound, setSoulbound] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', nftName);
      formData.append('symbol', nftSymbol);
      formData.append('description', nftDescription);
      formData.append('rewardToken', rewardToken);
      formData.append('soulbound', soulbound.toString());
      
      if (nftImage) {
        formData.append('image', nftImage);
      }

      const response = await fetch('/api/nft/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create NFT');
      }

      const result = await response.json();
      
      const newNFT: NFT = {
        id: result.transactionHash,
        name: nftName,
        symbol: nftSymbol,
        address: result.contractAddress
      };

      onNFTCreated(newNFT);

      // Reset form
      setNftName('');
      setNftSymbol('');
      setNftDescription('');
      setNftImage(null);
      setRewardToken('');
      setSoulbound(false);

      alert('NFT created successfully!');
    } catch (error) {
      console.error('Error creating NFT:', error);
      alert('Error creating NFT. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">NFT Name:</label>
        <input
          type="text"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={isCreating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">NFT Symbol:</label>
        <input
          type="text"
          value={nftSymbol}
          onChange={(e) => setNftSymbol(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={isCreating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description:</label>
        <textarea
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          required
          disabled={isCreating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Upload Image:</label>
        <input
          type="file"
          onChange={(e) => setNftImage(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded"
          accept="image/*"
          required
          disabled={isCreating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reward Token Address:</label>
        <input
          type="text"
          value={rewardToken}
          onChange={(e) => setRewardToken(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="0x..."
          required
          disabled={isCreating}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="soulbound"
          checked={soulbound}
          onChange={(e) => setSoulbound(e.target.checked)}
          className="mr-2"
          disabled={isCreating}
        />
        <label htmlFor="soulbound" className="text-sm font-medium">
          Soulbound NFT
        </label>
      </div>

      <button 
        type="submit" 
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={isCreating}
      >
        {isCreating ? 'Creating...' : 'Launch NFT'}
      </button>
    </form>
  );
};

export default NFTLaunchForm;