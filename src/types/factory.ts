export type TokenFactory = {
  createToken: (name: string, symbol: string, initialSupply: number) => Promise<string>;
  getToken: (tokenAddress: string) => Promise<TokenDetails>;
};

export type NFTFactory = {
  createNFT: (name: string, symbol: string, metadata: string) => Promise<string>;
  getNFT: (nftAddress: string) => Promise<NFTDetails>;
};

export type TokenDetails = {
  address: string;
  name: string;
  symbol: string;
  totalSupply: number;
};

export type NFTDetails = {
  address: string;
  name: string;
  symbol: string;
  metadata: string;
};