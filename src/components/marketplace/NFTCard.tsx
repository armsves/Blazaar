import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { NFTItem } from '../../types/nft';
import marketplaceAddress from '../../constants/marketplaceAddress.json';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';
import { showSuccess, showError, showInfo } from '../../utils/toast';

// Marketplace contract ABI
const MARKETPLACE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "nftContract", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "nftContract", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "unlistNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "nftContract", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

// NFT contract ABI for approve function
const NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Get marketplace contract address from JSON file
const MARKETPLACE_CONTRACT_ADDRESS = marketplaceAddress.Marketplace as `0x${string}`;

interface NFTCardProps {
  nft: NFTItem;
  onBuy?: (nft: NFTItem) => void;
  onSell?: (nft: NFTItem) => void;
  connectedWallet?: `0x${string}`;
  isConnected: boolean;
}

const NFTCard: React.FC<NFTCardProps> = ({ 
  nft, 
  onBuy, 
  onSell, 
  connectedWallet, 
  isConnected 
}) => {
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isConfirmUnlistModalOpen, setIsConfirmUnlistModalOpen] = useState(false); // New state
  const [listingPrice, setListingPrice] = useState('');
  const [listedPrice, setListedPrice] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [isUnlisting, setIsUnlisting] = useState(false);

  // Contract write hooks
  const { writeContract: approveNFT, data: approveHash } = useWriteContract();
  const { writeContract: listNFT, data: listHash } = useWriteContract();
  const { writeContract: unlistNFT, data: unlistHash } = useWriteContract();
  const { writeContract: buyNFT, data: buyHash } = useWriteContract();
  
  // Transaction receipt hooks
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isListLoading, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
  });

  const { isLoading: isUnlistLoading, isSuccess: isUnlistSuccess } = useWaitForTransactionReceipt({
    hash: unlistHash,
  });

  const { isLoading: isBuyLoading, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const handleBuy = async () => {
    if (!nft.price || !isConnected) {
      showError('Please connect your wallet and ensure the NFT has a valid price');
      return;
    }

    try {
      console.log('Buying NFT:', nft);
      const priceInWei = parseEther(nft.price.toString());
      
      await buyNFT({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [nft.collection as `0x${string}`, BigInt(nft.tokenId)],
        value: priceInWei
      });

    } catch (error) {
      console.error('Error buying NFT:', error);
      showError('Failed to buy NFT. Please try again.');
    }
  };

  const handleSell = () => {
    setIsListingModalOpen(true);
  };

  const handleUnlist = async () => {
    if (!isConnected || !connectedWallet) {
      showError('Please connect your wallet');
      return;
    }

    // Show confirmation modal instead of browser confirm
    setIsConfirmUnlistModalOpen(true);
  };

  const confirmUnlist = async () => {
    setIsConfirmUnlistModalOpen(false);
    
    try {
      setIsUnlisting(true);
      console.log('Unlisting NFT:', nft);

      await unlistNFT({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'unlistNFT',
        args: [nft.collection as `0x${string}`, BigInt(nft.tokenId)]
      });

    } catch (error) {
      console.error('Error unlisting NFT:', error);
      showError('Failed to unlist NFT. Please try again.');
      setIsUnlisting(false);
    }
  };

  const cancelUnlist = () => {
    setIsConfirmUnlistModalOpen(false);
  };

  const handleListNFT = async () => {
    if (!listingPrice || parseFloat(listingPrice) <= 0) {
      showError('Please enter a valid price');
      return;
    }

    try {
      setIsApproving(true);
      
      // Step 1: Approve the marketplace contract to transfer the NFT
      console.log('Approving NFT for marketplace...');
      await approveNFT({
        address: nft.collection as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'approve',
        args: [MARKETPLACE_CONTRACT_ADDRESS, BigInt(nft.tokenId)]
      });

    } catch (error) {
      console.error('Error approving NFT:', error);
      showError('Failed to approve NFT. Please try again.');
      setIsApproving(false);
      setIsListing(false);
    }
  };

  const handleListNFTOnMarketplace = async () => {
    if (!listingPrice) return;

    try {
      setIsApproving(false);
      setIsListing(true);

      console.log('Listing NFT on marketplace...');
      const priceInWei = parseEther(listingPrice);
      
      console.log('Listing details:', {
        nftContract: nft.collection,
        tokenId: nft.tokenId,
        price: priceInWei.toString(),
        priceInCHZ: listingPrice
      });

      await listNFT({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [nft.collection as `0x${string}`, BigInt(nft.tokenId), priceInWei]
      });

    } catch (error) {
      console.error('Error listing NFT:', error);
      showError('Failed to list NFT. Please try again.');
      setIsListing(false);
    }
  };

  // Watch for approval success to trigger listing
  React.useEffect(() => {
    if (isApproveSuccess && listingPrice) {
      console.log('Approval successful, proceeding to list NFT...');
      handleListNFTOnMarketplace();
    }
  }, [isApproveSuccess, listingPrice]);

  // Handle successful transactions
  React.useEffect(() => {
    if (isListSuccess) {
      setIsListing(false);
      setIsListingModalOpen(false);
      setListedPrice(listingPrice);
      setListingPrice('');
      setIsSuccessModalOpen(true);
      showSuccess('NFT listed successfully!');
    }
  }, [isListSuccess]);

  React.useEffect(() => {
    if (isUnlistSuccess) {
      setIsUnlisting(false);
      showSuccess('NFT unlisted successfully!');
      window.location.reload();
    }
  }, [isUnlistSuccess]);

  React.useEffect(() => {
    if (isBuySuccess) {
      showSuccess('NFT purchased successfully!');
      window.location.reload();
    }
  }, [isBuySuccess]);

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    window.location.reload();
  };

  // Generate sharing URLs - update these lines
  const marketplaceUrl = `https://blazaar.chiliz.com/marketplace`; // Base marketplace URL
  const nftUrl = `${marketplaceUrl}?collection=${nft.collection}&tokenId=${nft.tokenId}`; // Specific NFT URL
  const twitterText = `Check out my NFT "${nft.name}" listed for ${listedPrice} CHZ on Blazaar Marketplace!`;
  const telegramText = `Guys check this NFT out! "${nft.name}" for ${listedPrice} CHZ on Blazaar!`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(nftUrl)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(nftUrl)}&text=${encodeURIComponent(telegramText)}`;
  
  // Check if user is the owner of the NFT
  const isOwner = isConnected && connectedWallet && nft.owner.toLowerCase() === connectedWallet.toLowerCase();
  // Check if user is the seller of a listed NFT
  const isSeller = isConnected && connectedWallet && nft.seller && nft.seller.toLowerCase() === connectedWallet.toLowerCase();

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-lg hover:bg-white/15 transition-all transform hover:scale-105">
        {nft.image && (
          <div className="relative">
            <img 
              src={nft.image} 
              alt={nft.name} 
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=NFT';
              }}
            />
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}
        
        <div className="p-6">
          <h2 className="font-bold text-xl text-white mb-2">{nft.name}</h2>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{nft.description}</p>
          
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">Collection: <span className="text-gray-300">{nft.collectionName}</span></p>
            <p className="text-xs text-gray-400 font-mono">
              Token ID: <span className="text-gray-300">{nft.tokenId}</span>
            </p>
          </div>
          
          {/* Show listing status and price */}
          {nft.isListed && nft.price && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-4 mb-4 backdrop-blur-sm">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <p className="text-sm font-semibold text-blue-300">Listed for Sale</p>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {nft.price} CHZ
              </p>
            </div>
          )}
          
          <div className="mt-4 flex gap-3">
            {nft.isListed ? (
              // NFT is listed for sale
              <>
                {isSeller ? (
                  // Owner/Seller can unlist
                  <button 
                    onClick={handleUnlist}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 text-sm font-semibold disabled:opacity-50 transition-all transform hover:scale-105"
                    disabled={isUnlisting || isUnlistLoading}
                  >
                    {isUnlisting || isUnlistLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Unlisting...
                      </div>
                    ) : (
                      'Unlist'
                    )}
                  </button>
                ) : (
                  // Other users can buy
                  <button 
                    onClick={handleBuy}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-blue-700 text-sm font-semibold disabled:opacity-50 transition-all transform hover:scale-105"
                    disabled={isBuyLoading}
                  >
                    {isBuyLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Buying...
                      </div>
                    ) : (
                      `Buy for ${nft.price} CHZ`
                    )}
                  </button>
                )}
              </>
            ) : (
              // NFT is not listed - only owner can sell
              isOwner && (
                <button 
                  onClick={handleSell}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 text-sm font-semibold disabled:opacity-50 transition-all transform hover:scale-105"
                  disabled={isApproving || isListing}
                >
                  {isApproving || isListing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Sell'
                  )}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Listing Modal */}
      {isListingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-6">List NFT for Sale</h3>
            
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                {nft.image && (
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-white text-lg">{nft.name}</p>
                  <p className="text-sm text-gray-300">Token ID: {nft.tokenId}</p>
                  <p className="text-sm text-gray-400">{nft.collectionName}</p>
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Price (CHZ)
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                placeholder="Enter price in CHZ"
                disabled={isApproving || isListing}
              />
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  setIsListingModalOpen(false);
                  setListingPrice('');
                }}
                className="flex-1 bg-gray-600/20 text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-600/30 transition-all font-medium"
                disabled={isApproving || isListing}
              >
                Cancel
              </button>
              <button
                onClick={handleListNFT}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium"
                disabled={isApproving || isListing || !listingPrice}
              >
                {isApproving ? 'Approving...' : isListing ? 'Listing...' : 'List NFT'}
              </button>
            </div>

            {(isApproveLoading || isListLoading) && (
              <div className="text-center mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm text-gray-300">
                  {isApproveLoading ? 'Confirming approval...' : 'Confirming listing...'}
                </p>
              </div>
            )}

            {isApproving && (
              <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl mb-4">
                <p className="text-sm text-blue-300">
                  Step 1/2: Approving marketplace to transfer your NFT...
                </p>
              </div>
            )}

            {isListing && (
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl">
                <p className="text-sm text-green-300">
                  Step 2/2: Listing NFT on marketplace...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Modal with Social Sharing */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            {/* Success Message */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">NFT Listed Successfully!</h2>
              <p className="text-gray-300">
                {nft.name} is now listed for {listedPrice} CHZ
              </p>
            </div>

            {/* Social Sharing Section */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Share on:</h3>
              <div className="flex items-center justify-center space-x-8">
                <a 
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all transform hover:scale-110"
                >
                  <FaXTwitter className="text-white text-2xl" />
                </a>
                <a
                  href={telegramShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all transform hover:scale-110"
                >
                  <FaTelegram className="text-white text-2xl" />
                </a>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleSuccessModalClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Unlisting */}
      {isConfirmUnlistModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Confirm Unlisting</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to unlist this NFT from the marketplace?
              </p>
              
              {/* NFT Details */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <p className="font-semibold text-white">{nft.name}</p>
                <p className="text-sm text-gray-300">Token ID: {nft.tokenId}</p>
                {nft.price && (
                  <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                    Currently listed for {nft.price} CHZ
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelUnlist}
                  className="flex-1 bg-gray-600/20 text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-600/30 transition-all font-medium"
                  disabled={isUnlisting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnlist}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium disabled:opacity-50"
                  disabled={isUnlisting}
                >
                  {isUnlisting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Unlisting...
                    </div>
                  ) : (
                    'Yes, Unlist'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTCard;