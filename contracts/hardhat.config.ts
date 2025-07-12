import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      spicy: 'chiliz_spicy', // apiKey is not required, just set a placeholder
    },
    customChains: [
      {
        network: 'spicy',
        chainId: 88882,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/testnet/evm/88882/etherscan',
          browserURL: 'https://testnet.chiliscan.com'
        }
      }
    ]
  },
  networks: {
    spicy: {
      url: process.env.SPICY_RPC_URL || 'https://spicy-rpc.chiliz.com',
      accounts: process.env.SPICY_PRIVATE_KEY ? [process.env.SPICY_PRIVATE_KEY] : [],
      chainId: 88882,
    },
    chiliz: {
      url: process.env.CHILIZ_RPC_URL || '',
      accounts: process.env.CHILIZ_PRIVATE_KEY ? [process.env.CHILIZ_PRIVATE_KEY] : [],
    },
  },
};

export default config;