import type { NextApiRequest, NextApiResponse } from 'next';
import { getNFTs, createNFT, stakeNFT, claimSoulboundNFT } from '../../../utils/nftUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const nfts = await getNFTs();
        res.status(200).json(nfts);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch NFTs' });
      }
      break;

    case 'POST':
      try {
        const newNFT = await createNFT(req.body);
        res.status(201).json(newNFT);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create NFT' });
      }
      break;

    case 'PUT':
      try {
        const { nftId } = req.body;
        const result = await stakeNFT(nftId);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to stake NFT' });
      }
      break;

    case 'DELETE':
      try {
        const { nftId } = req.body;
        const result = await claimSoulboundNFT(nftId);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to claim soulbound NFT' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}