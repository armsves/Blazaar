# Blazaar Project

Blazaar is a decentralized application (dApp) that serves as an NFT and token launchpad, as well as a marketplace. The platform allows users to create, trade, and stake tokens and NFTs, providing a seamless experience for both creators and collectors.

## Features

- **NFT Marketplace**: Users can browse, buy, and sell NFTs in a user-friendly marketplace.
- **Token Launchpad**: Creators can launch their own tokens with ease using the Token Launch Form.
- **NFT Launchpad**: Users can create and launch their own NFTs through the NFT Launch Form.
- **Staking Mechanism**: Users can stake their tokens to earn rewards in the form of soulbound NFTs.
- **Gated Minting**: Certain NFTs can be minted only by users who have earned specific rewards through staking.
- **Contract Factory**: The platform includes a contract factory for both tokens and NFTs, allowing for easy deployment of new contracts.

## Technology Stack

- **Frontend**: Built with React and Next.js for a responsive and dynamic user interface.
- **Smart Contracts**: Developed using Solidity and deployed on the Spicy testnet and Chiliz mainnet.
- **Web3 Integration**: Utilizes web3.js for blockchain interactions.
- **Styling**: Tailwind CSS for modern and customizable styling.

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/blazaar.git
   cd blazaar
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add your environment variables, including your project ID and any necessary API keys.

4. **Run the Development Server**:
   ```bash
   pnpm dev
   ```

5. **Deploy Contracts**:
   Navigate to the `contracts` directory and run the deployment scripts for the respective networks:
   ```bash
   npx hardhat run scripts/deploy-factories.ts --network spicy
   npx hardhat run scripts/deploy-factories.ts --network chiliz
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.