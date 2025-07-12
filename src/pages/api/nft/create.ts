import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { getNFTFactoryContract } from '../../../utils/contracts';
import { uploadToIPFS, uploadJSONToIPFS } from '../../../utils/ipfs';
import contractAddresses from '../../../constants/contractAddresses.json';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('NFT creation request received');

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory');
    }

    // Parse form data
    console.log('Parsing form data...');
    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    console.log('Form data parsed:', { fields: Object.keys(fields), files: Object.keys(files) });
    
    // Extract fields with proper type checking
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const symbol = Array.isArray(fields.symbol) ? fields.symbol[0] : fields.symbol;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const rewardToken = Array.isArray(fields.rewardToken) ? fields.rewardToken[0] : fields.rewardToken || '';
    const soulbound = Array.isArray(fields.soulbound) ? fields.soulbound[0] === 'true' : fields.soulbound === 'true';

    console.log('Extracted fields:', { name, symbol, description, rewardToken, soulbound });

    // Validate required fields
    if (!name || !symbol || !description) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields: name, symbol, description' });
    }

    // Setup wallet and provider
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL || 'https://rpc.ankr.com/chiliz';

    if (!privateKey) {
      console.error('Private key not found');
      throw new Error('WALLET_PRIVATE_KEY not found in environment variables');
    }

    // Check if contract address exists
    if (!contractAddresses.NFTFactory) {
      console.error('NFTFactory address not found');
      throw new Error('NFTFactory contract address not found in configuration');
    }

    console.log('Setting up provider and wallet...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('Getting NFT factory contract...');
    const nftFactory = getNFTFactoryContract(contractAddresses.NFTFactory, wallet);

    // Upload image to IPFS (optional)
    let imageUri = '';
    if (files.image) {
      console.log('Processing image upload...');
      try {
        const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
        
        if (imageFile && imageFile.filepath) {
          console.log('Reading image file:', imageFile.filepath);
          const imageBuffer = fs.readFileSync(imageFile.filepath);
          const filename = imageFile.originalFilename || 'nft-image';
          
          console.log('Uploading image to IPFS...');
          imageUri = await uploadToIPFS(imageBuffer, filename);
          console.log('Image uploaded to IPFS:', imageUri);
          
          // Clean up uploaded file
          fs.unlinkSync(imageFile.filepath);
          console.log('Temporary file cleaned up');
        }
      } catch (imageError) {
        console.warn('Image upload failed, continuing without image:', imageError);
        // Continue without image - not a fatal error
      }
    }

    // Create metadata
    console.log('Creating metadata...');
    const metadata = {
      name,
      description,
      image: imageUri,
      attributes: [
        {
          trait_type: 'Soulbound',
          value: soulbound.toString()
        },
        ...(rewardToken ? [{
          trait_type: 'Reward Token',
          value: rewardToken
        }] : [])
      ]
    };

    // Upload metadata to IPFS
    console.log('Uploading metadata to IPFS...');
    const metadataUri = await uploadJSONToIPFS(metadata);
    console.log('Metadata uploaded to IPFS:', metadataUri);

    // Create NFT via smart contract
    // Based on the ABI, we have two options:
    // 1. createMarketplaceNFT() - takes no parameters
    // 2. createSoulboundNFT(name, symbol) - takes name and symbol
    
    let transaction;
    let contractType = 'marketplace';
    
    if (soulbound) {
      console.log('Creating Soulbound NFT with params:', { name, symbol });
      transaction = await nftFactory.createSoulboundNFT(name, symbol);
      contractType = 'soulbound';
    } else {
      console.log('Creating Marketplace NFT (no params)');
      transaction = await nftFactory.createMarketplaceNFT();
      contractType = 'marketplace';
    }
    
    console.log('Transaction sent:', transaction.hash);
    const receipt = await transaction.wait();
    console.log('Transaction confirmed:', receipt.hash);

    // Extract contract address from events
    let newContractAddress = '';
    if (receipt.logs && receipt.logs.length > 0) {
      console.log('Parsing transaction logs...');
      for (const log of receipt.logs) {
        try {
          const parsed = nftFactory.interface.parseLog(log);
          if (parsed && parsed.name === 'NFTCreated') {
            // Based on the event structure: NFTCreated(address indexed nftAddress, string name, string symbol, address indexed creator)
            newContractAddress = parsed.args.nftAddress || parsed.args[0];
            console.log('Found NFT contract address:', newContractAddress);
            break;
          }
        } catch (e) {
          console.log('Failed to parse log:', e);
        }
      }
    }

    if (!newContractAddress) {
      console.warn('Could not extract contract address from transaction logs');
    }

    const response = {
      success: true,
      transactionHash: receipt.hash,
      contractAddress: newContractAddress,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      contractType,
      name,
      symbol,
      metadataUri,
      imageUri: imageUri || null,
      soulbound
    };

    console.log('NFT creation successful:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('Error creating NFT:', error);
    
    let errorMessage = 'Failed to create NFT';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    res.status(500).json({ 
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}