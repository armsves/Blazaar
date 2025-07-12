import { create } from 'ipfs-http-client';

// Initialize IPFS client
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.INFURA_IPFS_PROJECT_ID}:${process.env.INFURA_IPFS_API_SECRET}`
    ).toString('base64')}`,
  },
});

export async function uploadToIPFS(buffer: Buffer, filename: string): Promise<string> {
  // Mock implementation for testing
  console.log(`Mock IPFS upload: ${filename}, size: ${buffer.length} bytes`);
  return `ipfs://QmMockHashFor${filename.replace(/[^a-zA-Z0-9]/g, '')}`;
}

export async function uploadJSONToIPFS(metadata: object): Promise<string> {
  // Mock implementation for testing
  console.log('Mock IPFS JSON upload:', metadata);
  return `ipfs://QmMockHashFor${JSON.stringify(metadata).length}`;
}