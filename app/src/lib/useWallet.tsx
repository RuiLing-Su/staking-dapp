
import { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { StakingClient } from './staking-client';
import { CONFIG } from './config';
import idl from './idl'

interface WalletContextState {
    wallet: any;
    connection: Connection | null;
    program: Program | null;
    client: StakingClient | null;
    connected: boolean;
    connecting: boolean;
    error: Error | null;
}

const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<WalletContextState>({
        wallet: null,
        connection: null,
        program: null,
        client: null,
        connected: false,
        connecting: false,
        error: null,
    });

    useEffect(() => {
        const connection = new Connection(CONFIG.RPC_ENDPOINT, CONFIG.COMMITMENT);
        console.log('创建连接：',connection)
        setState(prev => ({ ...prev, connection }));
    }, []);

    const initializeClient = async (wallet: any) => {
        try {
            console.log('开始创建钱包...',wallet)
            setState(prev => ({ ...prev, connecting: true, error: null }));

            const connection = new Connection(CONFIG.RPC_ENDPOINT, CONFIG.COMMITMENT);
            const provider = new AnchorProvider(connection, wallet, {
                commitment: CONFIG.COMMITMENT,
            });

            const programId = new PublicKey(CONFIG.PROGRAM_ID);
            console.log('创建钱包：',programId)
            const program = new Program(idl, programId, provider);
            const client = new StakingClient(program, connection, wallet);

            console.log('客户端初始化完成！');

            setState({
                wallet,
                connection,
                program,
                client,
                connected: true,
                connecting: false,
                error: null,
            });
        } catch (error) {
            console.error('连接或初始化失败：', error);
            setState(prev => ({
                ...prev,
                connecting: false,
                error: error as Error,
            }));
        }
    };

    return (
        <WalletContext.Provider value={state}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    console.log('使用钱包上下文...');
    return useContext(WalletContext);
}