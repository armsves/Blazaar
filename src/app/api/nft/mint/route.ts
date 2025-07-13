import { NextResponse, type NextRequest } from "next/server";
import { ethers } from "ethers";

const MARKETPLACE_NFT_ABI = [
  "function mint(address to, string memory _tokenURI) external",
  "event Minted(uint256 indexed tokenId, address indexed owner, string tokenURI)"
];

export async function POST(request: NextRequest) {
  try {
    const { contractAddress, recipientAddress, metadataUri } = await request.json();

    // Create provider and signer using owner's private key
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const ownerWallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);

    // Connect to the NFT contract as owner
    const nftContract = new ethers.Contract(contractAddress, MARKETPLACE_NFT_ABI, ownerWallet);

    // Mint the NFT
    const tx = await nftContract.mint(recipientAddress, metadataUri, {
      maxFeePerGas: ethers.parseUnits("2501", "gwei"),
      maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"),
      //gasLimit: 300000
    });

    const receipt = await tx.wait();

    // Get token ID from events
    const mintEvent = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id("Transfer(address,address,uint256)")
    );

    if (!mintEvent) {
      throw new Error('Mint event not found');
    }

    const tokenId = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], mintEvent.topics[3])[0];

    return NextResponse.json({
      success: true,
      tokenId: tokenId.toString(),
      transactionHash: tx.hash
    });

  } catch (error) {
    console.error('Minting error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Minting failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}