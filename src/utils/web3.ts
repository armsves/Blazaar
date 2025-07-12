import { ethers } from 'ethers';

let provider: ethers.providers.Web3Provider | null = null;

export const initWeb3 = async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    console.error('Please install MetaMask!');
  }
};

export const getProvider = () => {
  if (!provider) {
    throw new Error('Web3 provider is not initialized. Call initWeb3 first.');
  }
  return provider;
};

export const getSigner = () => {
  const signer = getProvider().getSigner();
  return signer;
};

export const getAccount = async () => {
  const signer = getSigner();
  const address = await signer.getAddress();
  return address;
};