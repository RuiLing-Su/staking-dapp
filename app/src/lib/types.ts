import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface StakingPackage {
    owner: PublicKey;
    amount: BN;
    baseRelease: BN;
    acceleratedRelease: BN;
    currentTotal: BN;
    maxTotal: BN;
    createdAt: BN;
    isActive: boolean;
}

export interface UserInfo {
    user: PublicKey;
    referrer: PublicKey;
    stakedAmount: BN;
    rewardsClaimed: BN;
    lastClaimTime: BN;
    directReferrals: number;
    indirectReferrals: number;
    level: number;
    teamPerformance: BN;
    isActive: boolean;
    packagesCount: BN;
}