export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  price: number;
  isSoulbound: boolean;
}

export interface MarketplaceState {
  nfts: NFT[];
  loading: boolean;
  error: string | null;
}

export interface FilterOptions {
  priceRange: [number, number];
  isSoulbound: boolean | null;
  owner: string | null;
}