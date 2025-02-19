import { Connection } from '@solana/web3.js';

export interface WalletState {
    walletAddress: string | null;
    connected: boolean;
    connecting: boolean;
    error: Error | null;
}

export interface WalletContextState extends WalletState {
    connect: (onlyIfTrusted?: boolean) => Promise<void>;
    disconnect: () => Promise<void>;
    handleAccountChanged: (publicKey: any) => Promise<void>;
}
