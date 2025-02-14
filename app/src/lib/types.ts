import { BN, Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { StakingClient } from "@/lib/staking-client";

/** 质押包状态枚举，对应 IDL 中 PackageStatus */
export enum PackageStatus {
    Active = 'Active',
    Completed = 'Completed',
    Withdrawn = 'Withdrawn'
}

/** 质押包接口，对应 IDL 中 StakingPackage 结构体 */
export interface StakingPackage {
    id: number;
    product_name: string;
    purchase_amount: string;
    total_released: string;
    max_release_amount: string;
    progress_percent: number;
    status: number;
    created_at: string;
}

/** 用户角色枚举，对应 IDL 中 UserRole */
export enum UserRole {
    User = 'User',
    ReferralMaster = 'ReferralMaster',
    TeamLeader = 'TeamLeader',
    Admin = 'Admin'
}

/** 用户信息接口，对应 IDL 中 UserInfo 结构体 */
export interface UserInfo {
    user: PublicKey;
    referrer: PublicKey;
    stakedAmount: BN;
    rewardsClaimed: BN;
    lastClaimTime: BN;
    directReferrals: number; // u32 类型
    indirectReferrals: number; // u32 类型
    level: number; // u8 类型
    teamPerformance: BN;
    isActive: boolean;
    packagesCount: BN; // u64 类型
    role: UserRole;
}

export interface WalletState {
    wallet: any;
    connection: Connection | null;
    program: Program | null;
    client: StakingClient | null;
    connected: boolean;
    connecting: boolean;
    error: Error | null;
}

export interface WalletContextState extends WalletState {
    connect: (phantomWallet: any) => Promise<void>;
    disconnect: () => void;
}
