import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ethers } from 'ethers';
import NFTGrid from '../../components/marketplace/NFTGrid';
import MarketplaceFilters from '../../components/marketplace/MarketplaceFilters';
import { useLaunchpad } from '../../hooks/useLaunchpad';
import { NFTItem, Collection } from '../../types/nft';
import marketplaceAddress from '../../constants/marketplaceAddress.json';
import { showSuccess, showError, showInfo } from '../../utils/toast';

// Marketplace contract ABI - expanded to include listNFT function
const MARKETPLACE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "listings",
    "outputs": [
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
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

// Additional collection addresses to fetch NFTs from
const ADDITIONAL_COLLECTION_ADDRESSES = [
  '0xE8719E6233E2e1F320c6567B9fdbF40c8D61C1BB',
  '0x6D3f54f7a2b86cCba6380f318cF7C79EdF7620Bb',
  '0xEFcd72E87C31E2d5C376828Bcb1C25742Be8464B',
  '0x702e06E10092f62196295E9B0Ea89571e8286587',
  '0xbf7205f78593e408B1A6A8f07759C249974F7f6B',
  '0x15BA648B54E20794E31361D73008100E13a5627D',
  '0x1e902644FFF9CdD756dD87d7048B3D58aF3332Ff',
  '0x845CB6363A06E74Bfa08e2546BAbE003C6CB0730'
];

const MarketplacePage = () => {
  const { address: connectedWallet, isConnected } = useAccount();
  const { loading: launchpadLoading, nfts: launchpadCollections, error: launchpadError } = useLaunchpad();
  const [nftItems, setNftItems] = useState<NFTItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selling modal state
  const [isSellingModalOpen, setIsSellingModalOpen] = useState(false);
  const [selectedNFTForSale, setSelectedNFTForSale] = useState<NFTItem | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isListing, setIsListing] = useState(false);

  // Contract write hooks
  const { writeContract: approveNFT, data: approveHash } = useWriteContract();
  const { writeContract: listNFT, data: listHash } = useWriteContract();
  
  // Transaction receipt hooks
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isListLoading, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
  });

  // Watch for transaction success to trigger next step
  useEffect(() => {
    if (isApproveSuccess && selectedNFTForSale && listingPrice) {
      handleListNFTOnMarketplace();
    }
  }, [isApproveSuccess]);

  useEffect(() => {
    if (isListSuccess) {
      setIsListing(false);
      setIsSellingModalOpen(false);
      setSelectedNFTForSale(null);
      setListingPrice('');
      showSuccess('NFT listed successfully!');
      // Reload NFTs to update the UI
      window.location.reload();
    }
  }, [isListSuccess]);

  useEffect(() => {
    const loadCollectionsAndNFTs = async () => {
      if (launchpadLoading) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const provider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com');
        const allNFTs: NFTItem[] = [];
        const allCollections: Collection[] = [];

        // Create marketplace contract instance
        const marketplaceContract = new ethers.Contract(
          MARKETPLACE_CONTRACT_ADDRESS,
          MARKETPLACE_ABI,
          provider
        );

        // Combine launchpad collection addresses with additional addresses
        const launchpadAddresses = launchpadCollections.map(c => c.address);
        const allAddresses = [...launchpadAddresses, ...ADDITIONAL_COLLECTION_ADDRESSES];

        //console.log('Processing collections:', allAddresses);

        // For each address, fetch collection info and NFTs
        for (let i = 0; i < allAddresses.length; i++) {
          const address = allAddresses[i];
          try {
            //console.log(`Fetching collection info for: ${address}`);
            
            // Create contract instance for the NFT collection
            const nftContract = new ethers.Contract(
              address,
              [
                'function nextTokenId() view returns (uint256)',
                'function tokenURI(uint256 tokenId) view returns (string)',
                'function ownerOf(uint256 tokenId) view returns (address)',
                'function name() view returns (string)',
                'function symbol() view returns (string)',
                'function totalSupply() view returns (uint256)'
              ],
              provider
            );

            // Get collection name and symbol from contract
            let contractName = 'Unknown Collection';
            let contractSymbol = 'UNK';
            
            try {
              const [name, symbol] = await Promise.all([
                nftContract.name(),
                nftContract.symbol()
              ]);
              contractName = name || `Collection ${i + 1}`;
              contractSymbol = symbol || `COL${i + 1}`;
              //console.log(`Collection info: ${contractName} (${contractSymbol}) at ${address}`);
            } catch (contractInfoError) {
              console.warn(`Could not fetch contract info for ${address}, using defaults:`, contractInfoError);
              contractName = `Collection ${i + 1}`;
              contractSymbol = `COL${i + 1}`;
            }

            // Add to collections array
            const collection: Collection = {
              id: `collection-${i}`,
              name: contractName,
              symbol: contractSymbol,
              address: address
            };
            allCollections.push(collection);

            // Get token count using nextTokenId or totalSupply
            try {
              let tokenCount = 0;
              let startTokenId = 0;
              
              // Try nextTokenId first (for contracts that start from 0)
              try {
                const nextTokenId = await nftContract.nextTokenId();
                tokenCount = Number(nextTokenId);
                startTokenId = 0;
                //console.log(`Using nextTokenId for ${contractName}: ${tokenCount} tokens (starting from 0)`);
              } catch (nextTokenIdError) {
                //console.log(`nextTokenId not available for ${contractName}, trying totalSupply...`);
                
                // Fallback to totalSupply (for standard ERC721 contracts that start from 1)
                try {
                  const totalSupply = await nftContract.totalSupply();
                  tokenCount = Number(totalSupply);
                  startTokenId = 1;
                  //console.log(`Using totalSupply for ${contractName}: ${tokenCount} tokens (starting from 1)`);
                } catch (totalSupplyError) {
                  console.warn(`Neither nextTokenId nor totalSupply available for ${contractName}:`, totalSupplyError);
                  tokenCount = 0;
                }
              }

              if (tokenCount > 0) { 
                const endTokenId = startTokenId === 0 ? tokenCount : tokenCount + startTokenId;
                
                for (let tokenId = startTokenId; tokenId < endTokenId; tokenId++) {
                  try {
                    //console.log(`Fetching NFT ${tokenId} from ${contractName}`);
                    
                    const [tokenURI, owner] = await Promise.all([
                      nftContract.tokenURI(tokenId),
                      nftContract.ownerOf(tokenId)
                    ]);

                    //console.log(`TokenURI for ${tokenId}:`, tokenURI);
                    //console.log(`Owner for ${tokenId}:`, owner);

                    // Check if this NFT is listed on the marketplace
                    let isListed = false;
                    let listingPrice = '0';
                    let listingSeller = '';

                    try {
                      const listing = await marketplaceContract.listings(address, tokenId);
                      isListed = listing.isActive;
                      listingPrice = ethers.formatEther(listing.price);
                      listingSeller = listing.seller;
                      
                      /*
                      console.log(`Listing info for ${contractName} #${tokenId}:`, {
                        isListed,
                        price: listingPrice,
                        seller: listingSeller
                      });*/
                    } catch (listingError) {
                      console.warn(`Failed to fetch listing for ${contractName} #${tokenId}:`, listingError);
                    }

                    // Initialize metadata with defaults
                    let metadata = {
                      name: `${contractName} #${tokenId}`,
                      description: '',
                      image: '',
                      attributes: [],
                      external_url: '',
                      background_color: ''
                    };

                    if (tokenURI) {
                      try {
                        // Handle IPFS URLs - extract CID and construct gateway URL
                        let metadataURL = tokenURI;
                        if (tokenURI.startsWith('ipfs://')) {
                          const cid = tokenURI.slice(7); // Remove 'ipfs://' prefix
                          metadataURL = `https://ipfs.io/ipfs/${cid}`;
                          //console.log(`Converted IPFS URL: ${metadataURL}`);
                        }
                        
                        //console.log(`Fetching metadata from: ${metadataURL}`);
                        const response = await fetch(metadataURL);
                        
                        if (response.ok) {
                          const fetchedMetadata = await response.json();
                          //console.log(`Metadata for ${contractName} #${tokenId}:`, fetchedMetadata);
                          
                          // Process image URL if it's IPFS
                          let imageUrl = fetchedMetadata.image || '';
                          if (imageUrl.startsWith('ipfs://')) {
                            const imageCid = imageUrl.slice(7);
                            imageUrl = `https://ipfs.io/ipfs/${imageCid}`;
                          }
                          
                          metadata = {
                            name: fetchedMetadata.name || metadata.name,
                            description: fetchedMetadata.description || '',
                            image: imageUrl,
                            attributes: fetchedMetadata.attributes || [],
                            external_url: fetchedMetadata.external_url || '',
                            background_color: fetchedMetadata.background_color || ''
                          };
                        } else {
                          console.warn(`Failed to fetch metadata for ${contractName} #${tokenId}: HTTP ${response.status}`);
                        }
                      } catch (metadataError) {
                        console.warn(`Error fetching metadata for ${contractName} #${tokenId}:`, metadataError);
                      }
                    }

                    // When creating NFT items with marketplace data
                    const nftWithListing: NFTItem = {
                      tokenId: tokenId.toString(),
                      name: metadata.name,
                      description: metadata.description,
                      image: metadata.image,
                      owner: owner,
                      collection: address,
                      collectionName: contractName,
                      price: listingPrice ? parseFloat(listingPrice) : 0, // Convert string to number
                      seller: listingSeller,
                      listingActive: isListed,
                      isListed: isListed,
                      attributes: metadata.attributes,
                      external_url: metadata.external_url,
                      background_color: metadata.background_color
                    };

                    allNFTs.push(nftWithListing);
                    //console.log(`Added NFT to collection:`, nftWithListing);

                  } catch (nftError) {
                    console.warn(`Failed to fetch NFT ${tokenId} from ${contractName}:`, nftError);
                  }
                }
              } else {
                //console.log(`No NFTs minted in collection ${contractName}`);
              }
            } catch (tokenCountError) {
              console.warn(`Failed to get token count for ${address}:`, tokenCountError);
            }

          } catch (collectionError) {
            console.warn(`Failed to fetch collection ${address}:`, collectionError);
          }
        }

        //console.log(`Total collections loaded: ${allCollections.length}`);
        //console.log(`Total NFTs loaded: ${allNFTs.length}`);
        
        setCollections(allCollections);
        setNftItems(allNFTs);

      } catch (err) {
        console.error('Error loading collections and NFTs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load collections and NFTs');
      } finally {
        setLoading(false);
      }
    };

    loadCollectionsAndNFTs();
  }, [launchpadCollections, launchpadLoading]);

  const handleSellNFT = async (nft: NFTItem) => {
    try {
      setSelectedNFTForSale(nft);
      setIsSellingModalOpen(true);
    } catch (error) {
      console.error('Error initiating sell:', error);
    }
  };

  const handleApproveAndListNFT = async () => {
    if (!selectedNFTForSale || !listingPrice || parseFloat(listingPrice) <= 0) {
      showError('Please enter a valid price');
      return;
    }

    if (!isConnected || !connectedWallet) {
      showError('Please connect your wallet');
      return;
    }

    try {
      setIsApproving(true);
      showInfo('Approving NFT for marketplace...');

      await approveNFT({
        address: selectedNFTForSale.collection as `0x${string}`,
        abi: NFT_ABI,
        functionName: 'approve',
        args: [MARKETPLACE_CONTRACT_ADDRESS, BigInt(selectedNFTForSale.tokenId)]
      });

    } catch (error) {
      console.error('Error approving NFT:', error);
      showError('Failed to approve NFT. Please try again.');
      setIsApproving(false);
    }
  };

  const handleListNFTOnMarketplace = async () => {
    if (!selectedNFTForSale || !listingPrice) return;

    try {
      setIsApproving(false);
      setIsListing(true);

      const priceInWei = parseEther(listingPrice);
      showInfo('Listing NFT on marketplace...');

      await listNFT({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [
          selectedNFTForSale.collection as `0x${string}`, 
          BigInt(selectedNFTForSale.tokenId), 
          priceInWei
        ]
      });

    } catch (error) {
      console.error('Error listing NFT:', error);
      showError('Failed to list NFT. Please try again.');
      setIsListing(false);
    }
  };

  const closeSellModal = () => {
    setIsSellingModalOpen(false);
    setSelectedNFTForSale(null);
    setListingPrice('');
    setIsApproving(false);
    setIsListing(false);
  };

  const openCollectionModal = (collection: Collection) => {
    setSelectedCollection(collection);
    setIsModalOpen(true);
  };

  const closeCollectionModal = () => {
    setSelectedCollection(null);
    setIsModalOpen(false);
  };

  const getCollectionNFTs = (collectionAddress: string) => {
    const collectionNFTs = nftItems.filter(nft => nft.collection === collectionAddress);
    //console.log(`Collection ${collectionAddress} has ${collectionNFTs.length} NFTs:`, collectionNFTs);
    return collectionNFTs;
  };

  // Filter collections to only show those with NFTs
  const collectionsWithNFTs = collections.filter(collection => 
    nftItems.filter(nft => nft.collection === collection.address).length > 0
  );

  if (loading || launchpadLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading collections and NFTs...</p>
        </div>
      </div>
    );
  }

  if (error || launchpadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl max-w-md mx-4 backdrop-blur-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Error: {error || launchpadError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-4">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
            NFT Marketplace
          </h1>
          <p className="text-xl text-gray-300">
            Discover, collect, and trade unique NFTs on Chiliz blockchain
          </p>
        </div>
        
        {/* Collections Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Collections ({collectionsWithNFTs.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {collectionsWithNFTs.map((collection) => (
              <div 
                key={collection.id} 
                className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all cursor-pointer transform hover:scale-105"
                onClick={() => openCollectionModal(collection)}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{collection.name}</h3>
                <p className="text-sm text-gray-300 mb-3 font-mono">
                  {collection.symbol} • {collection.address.slice(0, 6)}...{collection.address.slice(-4)}
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    {nftItems.filter(nft => nft.collection === collection.address).length} NFTs
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {collectionsWithNFTs.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No collections with NFTs found</p>
              <p className="text-gray-500 text-sm mt-2">Collections will appear here once NFTs are minted</p>
            </div>
          )}
        </div>

        {/* Filters Section 
        <div className="mb-8">
          <MarketplaceFilters />
        </div>*/}
        
        {/* All NFTs Section */}
        <div className="py-4">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              All NFTs ({nftItems.length})
            </h2>
          </div>
          
          <NFTGrid 
            nfts={nftItems}
            connectedWallet={connectedWallet}
            isConnected={isConnected}
            onSell={handleSellNFT}
          />
        </div>

        {/* Selling Modal */}
        {isSellingModalOpen && selectedNFTForSale && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-white mb-6">List NFT for Sale</h3>
              
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  {selectedNFTForSale.image && (
                    <img 
                      src={selectedNFTForSale.image} 
                      alt={selectedNFTForSale.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold text-white text-lg">{selectedNFTForSale.name}</p>
                    <p className="text-sm text-gray-300">Token ID: {selectedNFTForSale.tokenId}</p>
                    <p className="text-sm text-gray-400">{selectedNFTForSale.collectionName}</p>
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
                  onClick={closeSellModal}
                  className="flex-1 bg-gray-600/20 text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-600/30 transition-all font-medium"
                  disabled={isApproving || isListing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveAndListNFT}
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

        {/* Collection Modal */}
        {isModalOpen && selectedCollection && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeCollectionModal}
          >
            <div 
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-8 border-b border-white/20">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedCollection.name}</h2>
                  <p className="text-gray-300 text-lg">{selectedCollection.symbol}</p>
                  <p className="text-sm text-gray-400 font-mono mt-1">
                    {selectedCollection.address}
                  </p>
                </div>
                <button
                  onClick={closeCollectionModal}
                  className="text-gray-400 hover:text-white text-2xl font-bold w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Collection NFTs ({getCollectionNFTs(selectedCollection.address).length})
                  </h3>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="ml-3 text-white">Loading NFTs...</span>
                  </div>
                ) : getCollectionNFTs(selectedCollection.address).length > 0 ? (
                  <NFTGrid 
                    nfts={getCollectionNFTs(selectedCollection.address)}
                    connectedWallet={connectedWallet}
                    isConnected={isConnected}
                    onSell={handleSellNFT}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-lg">No NFTs found in this collection</p>
                    <p className="text-gray-500 text-sm mt-2">Collection: {selectedCollection.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;