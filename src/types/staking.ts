export interface StakingPool {
  id: string;
  tokenAddress: string;
  totalStaked: number;
  rewardRate: number;
  startTime: number;
  endTime: number;
}

export interface StakingReward {
  userId: string;
  poolId: string;
  amount: number;
  claimed: boolean;
}

export interface SoulboundNFT {
  id: string;
  ownerId: string;
  metadata: string;
}