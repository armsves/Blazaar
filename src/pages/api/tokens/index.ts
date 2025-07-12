import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { getTokenContract } from '../../../utils/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const tokenContract = getTokenContract();
        const totalSupply = await tokenContract.totalSupply();
        const tokens = await tokenContract.getAllTokens(); // Assuming this function exists

        res.status(200).json({ totalSupply: totalSupply.toString(), tokens });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tokens' });
      }
      break;

    case 'POST':
      try {
        const { name, symbol, initialSupply } = req.body;
        const tokenContract = getTokenContract();
        const tx = await tokenContract.createToken(name, symbol, initialSupply); // Assuming this function exists
        await tx.wait();

        res.status(201).json({ message: 'Token created successfully', transaction: tx });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create token' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}