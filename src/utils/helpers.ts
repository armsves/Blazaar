import { BigNumber } from 'ethers';

export const formatEther = (value: BigNumber): string => {
  return ethers.utils.formatEther(value);
};

export const parseEther = (value: string): BigNumber => {
  return ethers.utils.parseEther(value);
};

export const isAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};