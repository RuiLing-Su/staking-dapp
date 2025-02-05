import { useState, useCallback, createContext, useContext } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { StakingClient } from './staking-client';
import { WalletState, WalletContextState } from './types';
import { CONFIG } from './config';

// 创建钱包上下文
const WalletContext = createContext<WalletContextState>({} as WalletContextState);

// 初始钱包状态
const initialState: WalletState = {
    wallet: null,
    connection: null,
    program: null,
    client: null,
    connected: false,
    connecting: false,
    error: null,
};

/**
 * 钱包Provider组件，为应用提供钱包相关状态和方法
 */
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 钱包状态管理
    const [state, setState] = useState<WalletState>(initialState);

    /**
     * 连接钱包方法
     * @param phantomWallet Phantom钱包实例
     */
    const connect = useCallback(async (phantomWallet: any) => {
        if (state.connecting) return;

        try {
            setState(prev => ({ ...prev, connecting: true, error: null }));

            // 创建 Solana 连接实例
            const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');

            // 创建 Anchor Provider
            const provider = new Provider(
                connection,
                phantomWallet,
                { commitment: 'confirmed' }
            );

            // 加载质押程序
            const program = new Program(
                CONFIG.IDL,
                new PublicKey(CONFIG.PROGRAM_ID),
                provider
            );

            // 创建 StakingClient 实例
            const client = new StakingClient(
                program,
                connection,
                phantomWallet
            );

            // 更新状态
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
            console.error('Failed to connect wallet:', error);
            setState(prev => ({
                ...initialState,
                error: error instanceof Error ? error : new Error('Failed to connect wallet')
            }));
        }
    }, [state.connecting]);

    /**
     * 断开钱包连接方法
     */
    const disconnect = useCallback(() => {
        // 重置所有状态
        setState(initialState);
    }, []);

    // 提供钱包上下文
    return (
        <WalletContext.Provider value={{ ...state, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    );
};

/**
 * 使用钱包Hook
 * @returns WalletContextState 钱包状态和方法
 */
export const useWallet = (): WalletContextState => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};