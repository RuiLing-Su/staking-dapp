import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { StakingClient } from './staking-client';
import { CONFIG } from './config';
import Idl from './idl.json';
import { WalletState, WalletContextState } from './types';
import { WalletContext } from '@solana/wallet-adapter-react';

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<WalletState>({
        wallet: null,
        connection: null,
        program: null,
        client: null,
        connected: false,
        connecting: false,
        error: null
    });

    const createConnection = useCallback(() =>
            new Connection(CONFIG.RPC_ENDPOINT, CONFIG.COMMITMENT),
        []);

    const connect = useCallback(async (phantomWallet: any) => {
        if (!phantomWallet) {
            throw new Error('无效的钱包对象');
        }

        try {
            setState(prev => ({ ...prev, connecting: true, error: null }));

            const connection = createConnection();
            const provider = new AnchorProvider(
                connection,
                phantomWallet,
                { commitment: CONFIG.COMMITMENT }
            );

            const programId = new PublicKey(CONFIG.PROGRAM_ID);
            const program = new Program(Idl, programId, provider);
            const client = new StakingClient(program, connection, phantomWallet);

            setState({
                wallet: phantomWallet,
                connection,
                program,
                client,
                connected: true,
                connecting: false,
                error: null
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                connecting: false,
                error: error instanceof Error ? error : new Error(String(error))
            }));
            throw error;
        }
    }, [createConnection]);

    const disconnect = useCallback(() => {
        setState({
            wallet: null,
            connection: null,
            program: null,
            client: null,
            connected: false,
            connecting: false,
            error: null
        });
    }, []);

    useEffect(() => {
        const connection = createConnection();
        setState(prev => ({ ...prev, connection }));
    }, [createConnection]);

    // Auto-disconnect listener
    useEffect(() => {
        const wallet = state.wallet;
        if (!wallet) return;

        const handleDisconnect = () => disconnect();
        wallet.on('disconnect', handleDisconnect);

        return () => {
            wallet.off('disconnect', handleDisconnect);
        };
    }, [state.wallet, disconnect]);

    return (
        <WalletContext.Provider value={{
            ...state,
            connect,
            disconnect
        }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet 必须在 WalletProvider 内部使用');
    }
    return context;
};