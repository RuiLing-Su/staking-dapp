import { BN, Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { StakingClient } from "@/lib/staking-client";

/** 质押包状态枚举，对应 IDL 中 PackageStatus */
export enum PackageStatus {
    Active = 'Active',
    Completed = 'Completed',
    Withdrawn = 'Withdrawn'
}

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
