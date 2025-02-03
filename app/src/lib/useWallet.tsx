import { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { StakingClient } from './staking-client';
import { CONFIG } from './config';
import Idl from './idl.json';

interface WalletContextState {
    wallet: any;
    connection: Connection | null;
    program: Program | null;
    client: StakingClient | null;
    connected: boolean;
    connecting: boolean;
    error: Error | null;
    connect: (phantomWallet: any) => Promise<void>;
    disconnect: () => void;
}

/**
 * 创建 WalletContext，上下文默认值为空对象
 */
const WalletContext = createContext<WalletContextState>({} as WalletContextState);

/**
 * WalletProvider 组件
 * 负责初始化钱包连接，并将状态通过上下文提供给子组件
 * @param children
 * @constructor
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<WalletContextState>({
        wallet: null,
        connection: null,
        program: null,
        client: null,
        connected: false,
        connecting: false,
        error: null,
        connect: async () => {},
        disconnect: () => {},
    });

    useEffect(() => {
        // 创建 Solana 连接
        const connection = new Connection(CONFIG.RPC_ENDPOINT, CONFIG.COMMITMENT);
        console.log('连接成功')

        // 定义连接方法
        const connect = async (phantomWallet: any) => {
            if (!phantomWallet) {
                throw new Error('未提供有效的钱包对象');
            }

            try {
                setState(prev => ({ ...prev, connecting: true, error: null }));

                // 创建 Provider
                const provider = new AnchorProvider(
                    connection,
                    phantomWallet,
                    { commitment: CONFIG.COMMITMENT }
                );

                // 创建 Program 实例
                const programId = new PublicKey(CONFIG.PROGRAM_ID);
                console.log('programId:', programId.toString())
                const program = new Program(Idl, programId, provider);
                console.log('program:', program)

                // 创建 StakingClient 实例
                const client = new StakingClient(program, connection, phantomWallet);

                // 更新状态
                setState(prev => ({
                    ...prev,
                    wallet: phantomWallet,
                    program,
                    client,
                    connected: true,
                    connecting: false,
                    error: null,
                }));

            } catch (error) {
                console.error('钱包初始化失败:', error);
                setState(prev => ({
                    ...prev,
                    connecting: false,
                    error: error as Error,
                }));
                throw error;
            }
        };

        // 定义断开连接方法
        const disconnect = () => {
            setState(prev => ({
                ...prev,
                wallet: null,
                program: null,
                client: null,
                connected: false,
                error: null,
            }));
        };

        // 更新状态，包含连接和连接对象
        setState(prev => ({
            ...prev,
            connection,
            connect,
            disconnect,
        }));

    }, []);

    // 监听钱包连接状态变化
    useEffect(() => {
        if (!state.wallet) return;

        const onDisconnect = () => {
            state.disconnect();
        };

        state.wallet.on('disconnect', onDisconnect);
        return () => {
            state.wallet.off('disconnect', onDisconnect);
        };
    }, [state.wallet]);

    return (
        <WalletContext.Provider value={state}>
            {children}
        </WalletContext.Provider>
    );
}

/**
 * 自定义hook，用于获取钱包上下文
 */
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet 必须在 WalletProvider 内部使用');
    }
    return context;
};