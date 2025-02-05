import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { StakingClient } from './staking-client';
import { WalletState, WalletContextState } from './types';
import { CONFIG } from './config';
import Idl from './idl.json';

// 检查钱包网络
const checkWalletNetwork = async (phantomWallet: any) => {
    try {
        if (!phantomWallet.publicKey) {
            throw new Error('Wallet not connected');
        }

        // 使用配置的 RPC 端点创建连接
        const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');

        console.log('=== Wallet Connection Info ===');
        console.log('RPC Endpoint:', CONFIG.RPC_ENDPOINT);
        console.log('Wallet public key:', phantomWallet.publicKey.toString());

        // 尝试获取账户信息来验证连接
        const balance = await connection.getBalance(phantomWallet.publicKey);
        console.log('Wallet balance:', balance / web3.LAMPORTS_PER_SOL, 'SOL');
        console.log('============================');

        return true;
    } catch (error) {
        console.error('Failed to check wallet network:', error);
        return false;
    }
};

// 验证钱包账户
const validateWalletAccount = async (connection: Connection, publicKey: PublicKey) => {
    try {
        const accountInfo = await connection.getAccountInfo(publicKey);
        const balance = await connection.getBalance(publicKey);

        console.log('=== Wallet Account Check ===');
        console.log('Account address:', publicKey.toString());
        console.log('Account exists:', accountInfo !== null);
        console.log('Account balance:', balance / web3.LAMPORTS_PER_SOL, 'SOL');

        // 检查是否有最小余额要求
        if (balance < web3.LAMPORTS_PER_SOL * 0.01) { // 0.01 SOL as minimum
            console.warn('Warning: Low account balance');
        }

        console.log('==========================');

        return accountInfo !== null;
    } catch (error) {
        console.error('Failed to validate wallet account:', error);
        return false;
    }
};

const WalletContext = createContext<WalletContextState>({} as WalletContextState);

const initialState: WalletState = {
    wallet: null,
    connection: null,
    program: null,
    client: null,
    connected: false,
    connecting: false,
    error: null,
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<WalletState>(initialState);

    const connect = useCallback(async (phantomWallet: any) => {
        if (state.connecting) return;

        try {
            setState(prev => ({ ...prev, connecting: true, error: null }));
            console.log('Initiating wallet connection...');

            // 检查钱包是否已经连接
            if (!phantomWallet.isConnected) {
                throw new Error('Wallet is not connected');
            }

            // 检查钱包连接状态
            const isWalletReady = await checkWalletNetwork(phantomWallet);
            if (!isWalletReady) {
                throw new Error('Failed to connect to wallet network');
            }

            // 创建 Solana 连接实例
            const connection = new Connection(CONFIG.RPC_ENDPOINT, 'confirmed');
            console.log('Created Solana connection');

            // 验证钱包账户
            if (phantomWallet.publicKey) {
                const isValidAccount = await validateWalletAccount(connection, phantomWallet.publicKey);
                if (!isValidAccount) {
                    throw new Error('Invalid wallet account');
                }
            } else {
                throw new Error('No wallet public key found');
            }

            // 创建 Anchor Provider
            const provider = new AnchorProvider(
                connection,
                phantomWallet,
                { commitment: 'confirmed' }
            );
            console.log('Created Anchor Provider');

            // 验证程序账户
            const programId = new PublicKey(CONFIG.PROGRAM_ID);
            const programInfo = await connection.getAccountInfo(programId);

            console.log('=== Program Check ===');
            console.log('Program ID:', CONFIG.PROGRAM_ID);
            console.log('Program exists:', programInfo !== null);
            if (!programInfo) {
                throw new Error('Program not found on network');
            }

            // 加载质押程序
            const program = new Program(
                Idl,
                programId,
                provider
            );
            console.log('Program loaded successfully');

            // 创建 StakingClient 实例
            const client = new StakingClient(
                program,
                connection,
                phantomWallet
            );
            console.log('Staking client created');

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
            console.log('Wallet connection completed successfully');

        } catch (error) {
            console.error('Failed to connect wallet:', error);
            setState(prev => ({
                ...initialState,
                error: error instanceof Error ? error : new Error('Failed to connect wallet')
            }));
        }
    }, [state.connecting]);

    const disconnect = useCallback(() => {
        console.log('Disconnecting wallet...');
        setState(initialState);
    }, []);

    return (
        <WalletContext.Provider value={{ ...state, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextState => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
