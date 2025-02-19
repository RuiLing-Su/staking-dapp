"use client";

import React, { useState, useCallback, createContext, useContext } from 'react';
import { WalletState, WalletContextState } from '@/types/walletTypes';
import { connectToPhantomWallet } from '@/utils/wallet';

const initialState: WalletState = {
    walletAddress: null,
    connected: false,
    connecting: false,
    error: null,
};

const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<WalletState>(initialState);

    const connect = useCallback(async () => {
        if (state.connecting) return;

        try {
            setState(prev => ({ ...prev, connecting: true, error: null }));
            console.log('正在连接钱包...');

            const walletAddress = await connectToPhantomWallet();
            console.log('钱包地址:', walletAddress);

            setState({
                walletAddress,
                connected: true,
                connecting: false,
                error: null
            });
            console.log('钱包连接成功');

        } catch (error) {
            console.error('钱包连接失败:', error);
            setState(prev => ({
                ...initialState,
                error: error instanceof Error ? error : new Error('钱包连接失败')
            }));
        }
    }, [state.connecting]);

    const disconnect = useCallback(() => {
        console.log('断开钱包连接...');
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
