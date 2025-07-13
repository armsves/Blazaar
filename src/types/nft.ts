export interface NFTItem {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  collection: string;
  collectionName: string;
  isListed: boolean;
  attributes: any[];
  external_url: string;
  background_color: string;
  // Add marketplace properties
  price?: number; // Optional since not all NFTs are listed
  seller?: string; // The address of the seller
  listingActive?: boolean; // Whether the listing is currently active
}

export interface MarketplaceListing {
  seller: string;
  price: number;
  isActive: boolean;
}

export interface ListedNFT extends NFTItem {
  listing: MarketplaceListing;
}

export interface Collection {
  id: string;
  name: string;
  symbol: string;
  address: string;
}