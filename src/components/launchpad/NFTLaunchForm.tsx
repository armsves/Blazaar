import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getMarketplaceNFTContract, getMarketplaceContract } from '../../utils/contracts';
import { useLaunchpad } from '../../hooks/useLaunchpad';

interface NFT {
  id: string;
  name: string;
  symbol: string;
  address: string;
}

interface NFTToken {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price?: string;
  listed?: boolean;
}

interface NFTLaunchFormProps {
  onNFTCreated: (nft: NFT) => void;
}

const NFTLaunchForm: React.FC<NFTLaunchFormProps> = ({ onNFTCreated }) => {
  const { nfts, loading } = useLaunchpad();
  
  const [nftName, setNftName] = useState('');
  const [nftSymbol, setNftSymbol] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [rewardToken, setRewardToken] = useState('');
  const [soulbound, setSoulbound] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // States for collection selection and minting
  const [selectedCollection, setSelectedCollection] = useState<NFT | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMintForm, setShowMintForm] = useState(false);
  const [showMintedTokens, setShowMintedTokens] = useState(false);
  const [mintedTokens, setMintedTokens] = useState<NFTToken[]>([]);
  
  // Minting form states
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenImage, setTokenImage] = useState<File | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  
  // Marketplace states
  const [listingPrice, setListingPrice] = useState('');
  const [isListing, setIsListing] = useState<string | null>(null);

  const handleCollectionSelect = (collection: NFT) => {
    setSelectedCollection(collection);
    setShowMintForm(true);
    setShowCreateForm(false);
    setShowMintedTokens(false);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setShowMintForm(false);
    setShowMintedTokens(false);
    setSelectedCollection(null);
  };

  const handleViewMintedTokens = () => {
    setShowMintedTokens(true);
    setShowMintForm(false);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
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

      setSelectedCollection(newNFT);
      onNFTCreated(newNFT);
      setShowMintForm(true);
      setShowCreateForm(false);

      alert('NFT Collection created successfully! Now you can mint tokens.');
    } catch (error) {
      console.error('Error creating NFT:', error);
      alert('Error creating NFT. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollection) return;
    
    setIsMinting(true);

    try {
      // Step 1: Upload image to IPFS
      let imageIpfsUrl = '';
      if (tokenImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', tokenImage);

        const imageResponse = await fetch('/api/ipfs/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to upload image to IPFS');
        }

        const imageResult = await imageResponse.json();
        imageIpfsUrl = imageResult.ipfsUrl;
      }

      // Step 2: Build metadata object
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const metadata = {
        name: tokenName,
        description: tokenDescription,
        image: imageIpfsUrl,
        attributes: [
          {
            trait_type: "Collection",
            value: selectedCollection.name
          },
          {
            trait_type: "Creator",
            value: userAddress
          }
        ],
        external_url: "",
        background_color: "",
      };

      // Step 3: Upload metadata to IPFS
      const metadataResponse = await fetch('/api/ipfs/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const metadataResult = await metadataResponse.json();
      const metadataUri = metadataResult.ipfsUrl;

      // Step 4: Mint NFT using backend endpoint
      const mintResponse = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: selectedCollection.address,
          recipientAddress: userAddress,
          metadataUri: metadataUri
        }),
      });

      if (!mintResponse.ok) {
        const errorData = await mintResponse.json();
        throw new Error(errorData.error || 'Failed to mint NFT');
      }

      const mintResult = await mintResponse.json();

      const newToken: NFTToken = {
        tokenId: mintResult.tokenId,
        name: tokenName,
        description: tokenDescription,
        image: imageIpfsUrl,
        listed: false
      };

      setMintedTokens(prev => [...prev, newToken]);

      // Reset mint form
      setTokenName('');
      setTokenDescription('');
      setTokenImage(null);

      alert(`NFT Token minted successfully! Token ID: ${mintResult.tokenId}`);
    } catch (error) {
      console.error('Minting process failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      alert(`Error minting NFT: ${errorMessage}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleListForSale = async (tokenId: string, price: string) => {
    if (!selectedCollection || !price) return;
    
    setIsListing(tokenId);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const nftContract = getMarketplaceNFTContract(selectedCollection.address, signer);
      const marketplaceContract = getMarketplaceContract('MARKETPLACE_ADDRESS', signer);

      const approveTx = await nftContract.approve(marketplaceContract.address, tokenId);
      await approveTx.wait();

      const priceWei = ethers.parseEther(price);
      const listTx = await marketplaceContract.listItem(selectedCollection.address, tokenId, priceWei);
      await listTx.wait();

      setMintedTokens(prev => 
        prev.map(token => 
          token.tokenId === tokenId 
            ? { ...token, listed: true, price } 
            : token
        )
      );

      alert('NFT listed for sale successfully!');
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert('Error listing NFT. Please try again.');
    } finally {
      setIsListing(null);
    }
  };

  const resetForm = () => {
    setNftName('');
    setNftSymbol('');
    setNftDescription('');
    setNftImage(null);
    setRewardToken('');
    setSoulbound(false);
    setSelectedCollection(null);
    setShowCreateForm(false);
    setShowMintForm(false);
    setShowMintedTokens(false);
    setMintedTokens([]);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading NFT collections...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navigation/Stats Bar */}
      {(selectedCollection || mintedTokens.length > 0) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              {selectedCollection && (
                <h3 className="font-semibold text-lg">
                  {selectedCollection.name} ({selectedCollection.symbol})
                </h3>
              )}
              <p className="text-sm text-gray-600">
                {mintedTokens.length} token{mintedTokens.length !== 1 ? 's' : ''} minted
              </p>
            </div>
            
            {mintedTokens.length > 0 && (
              <button
                onClick={handleViewMintedTokens}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                View All Minted NFTs ({mintedTokens.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collection Selection */}
      {!showCreateForm && !showMintForm && !showMintedTokens && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">NFT Collections</h2>
          
          <button 
            onClick={handleCreateNew}
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
          >
            + Create New NFT Collection
          </button>

          {nfts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Existing Collections</h3>
              <div className="grid gap-3">
                {nfts.map((nft) => (
                  <div 
                    key={nft.id} 
                    className="border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCollectionSelect(nft)}
                  >
                    <h4 className="font-medium">{nft.name} ({nft.symbol})</h4>
                    <p className="text-sm text-gray-600 font-mono">{nft.address}</p>
                    <p className="text-sm text-blue-600 mt-1">Click to mint tokens →</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Minted Tokens Display */}
      {showMintedTokens && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Minted NFT Tokens</h2>
            <div className="space-x-2">
              <button 
                onClick={() => setShowMintForm(true) || setShowMintedTokens(false)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Mint More
              </button>
              <button 
                onClick={() => setShowMintedTokens(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          </div>

          {mintedTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No NFTs minted yet.</p>
              <button 
                onClick={() => setShowMintForm(true) || setShowMintedTokens(false)}
                className="mt-2 text-blue-500 hover:text-blue-600"
              >
                Mint your first NFT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mintedTokens.map((token) => (
                <div key={token.tokenId} className="border rounded-lg overflow-hidden shadow-sm">
                  {/* NFT Image */}
                  {token.image && (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <img 
                        src={token.image.replace('ipfs://', `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/`)}
                        alt={token.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* NFT Details */}
                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-1">{token.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">Token ID: #{token.tokenId}</p>
                    <p className="text-sm mb-3">{token.description}</p>
                    
                    {/* Status Badge */}
                    <div className="mb-3">
                      {token.listed ? (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Listed for {token.price} CHZ
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Not Listed
                        </span>
                      )}
                    </div>
                    
                    {/* Actions */}
                    {!token.listed && (
                      <div className="space-y-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price in CHZ"
                          value={listingPrice}
                          onChange={(e) => setListingPrice(e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                        />
                        <button
                          onClick={() => handleListForSale(token.tokenId, listingPrice)}
                          disabled={isListing === token.tokenId || !listingPrice}
                          className="w-full bg-orange-500 text-white py-2 rounded text-sm hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
                        >
                          {isListing === token.tokenId ? 'Listing...' : 'List for Sale'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NFT Collection Creation Form */}
      {showCreateForm && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create NFT Collection</h2>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>
          
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
              {isCreating ? 'Creating...' : 'Launch NFT Collection'}
            </button>
          </form>
        </div>
      )}

      {/* Minting Form */}
      {showMintForm && selectedCollection && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Mint NFT Token</h2>
            <div className="space-x-2">
              {mintedTokens.length > 0 && (
                <button 
                  onClick={handleViewMintedTokens}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  View Minted ({mintedTokens.length})
                </button>
              )}
              <button 
                onClick={() => setShowMintForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          </div>
          
          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Token Name:</label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full p-2 border rounded"
                required
                disabled={isMinting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Token Description:</label>
              <textarea
                value={tokenDescription}
                onChange={(e) => setTokenDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                required
                disabled={isMinting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Token Image:</label>
              <input
                type="file"
                onChange={(e) => setTokenImage(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded"
                accept="image/*"
                required
                disabled={isMinting}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              disabled={isMinting}
            >
              {isMinting ? 'Minting...' : 'Mint NFT Token'}
            </button>
          </form>

          {/* Recently Minted Tokens Preview */}
          {mintedTokens.length > 0 && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Recently Minted</h4>
              <div className="space-y-2">
                {mintedTokens.slice(-3).map((token) => (
                  <div key={token.tokenId} className="flex justify-between items-center bg-white p-2 rounded">
                    <span className="text-sm">{token.name} (#{token.tokenId})</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      token.listed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {token.listed ? `Listed ${token.price} CHZ` : 'Not Listed'}
                    </span>
                  </div>
                ))}
                {mintedTokens.length > 3 && (
                  <button 
                    onClick={handleViewMintedTokens}
                    className="text-blue-500 text-sm hover:text-blue-600"
                  >
                    View all {mintedTokens.length} tokens →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTLaunchForm;