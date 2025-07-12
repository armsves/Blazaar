import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getTokenFactoryContract } from '../../../utils/contracts';
import contractAddresses from '../../../constants/contractAddresses.json';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, symbol, initialSupply } = req.body;

    if (!name || !symbol || !initialSupply) {
      return res.status(400).json({ message: 'Missing required fields: name, symbol, initialSupply' });
    }

    // Validate initialSupply is a positive number
    const supply = parseFloat(initialSupply);
    if (isNaN(supply) || supply <= 0) {
      return res.status(400).json({ message: 'Initial supply must be a positive number' });
    }

    // Setup wallet and provider
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://rpc.ankr.com/chiliz';

    if (!privateKey) {
      throw new Error('WALLET_PRIVATE_KEY not found in environment variables');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Get TokenFactory contract
    const tokenFactory = getTokenFactoryContract(contractAddresses.TokenFactory, wallet);

    // Convert initialSupply to wei (assuming 18 decimals)
    const initialSupplyWei = ethers.parseUnits(initialSupply.toString(), 18);

    // Create token via smart contract
    const transaction = await tokenFactory.createToken(name, symbol, initialSupplyWei);
    const receipt = await transaction.wait();

    // Extract token address from events
    let newTokenAddress = '';
    for (const log of receipt.logs) {
      try {
        const parsed = tokenFactory.interface.parseLog(log);
        if (parsed && parsed.name === 'TokenCreated') {
          newTokenAddress = parsed.args[0]; // tokenAddress is the first argument
          break;
        }
      } catch (e) {
        // Log parsing failed, continue to next log
      }
    }

    if (!newTokenAddress) {
      throw new Error('Failed to extract token address from transaction logs');
    }

    res.status(200).json({
      success: true,
      transactionHash: receipt.hash,
      tokenAddress: newTokenAddress,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      name,
      symbol,
      initialSupply: initialSupply.toString()
    });

  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ 
      message: 'Failed to create token', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}