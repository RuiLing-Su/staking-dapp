"use client";

import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { WalletState, WalletContextState } from '@/types/walletTypes';

const initialState: WalletState = {
    walletAddress: null,
    connected: false,
    connecting: false,
    error: null,
};

const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<WalletState>(initialState);

    const connect = useCallback(async (onlyIfTrusted = false) => {
        if (state.connecting || state.connected) return;

        try {
            setState(prev => ({ ...prev, connecting: true, error: null }));
            console.log('正在连接钱包...');

            const provider = (window as any).solana;
            if (!provider) {
                window.open('https://phantom.app/', '_blank');
                throw new Error('Phantom 钱包未安装');
            }

            let resp;
            try {
                resp = await provider.connect({ onlyIfTrusted });
            } catch (err) {
                // 如果 Eager Connection 失败，尝试普通连接
                if (onlyIfTrusted) {
                    console.warn('Eager Connection 失败，尝试普通连接...');
                    resp = await provider.connect();
                } else {
                    throw err;
                }
            }

            const walletAddress = resp.publicKey.toString();
            console.log('钱包地址:', walletAddress);

            setState({
                walletAddress,
                connected: true,
                connecting: false,
                error: null
            });
            console.log('钱包连接成功');

        } catch (error) {
            if (error instanceof Error && error.message.includes("rate limited")) {
                alert("操作过于频繁，请稍后再试");
            }
            console.error('钱包连接失败:', error);
            setState(prev => ({
                ...initialState,
                error: error instanceof Error ? error : new Error('钱包连接失败')
            }));
        }
    }, [state.connecting, state.connected]);

    const disconnect = useCallback(async () => {
        console.log('断开钱包连接...');
        const provider = (window as any).solana;
        if (provider && provider.isConnected) {
            await provider.disconnect();
        }
        setState(initialState);
    }, []);

    const handleAccountChanged = useCallback(async (publicKey: any) => {
        if (publicKey) {
            setState(prev => ({
                ...prev,
                walletAddress: publicKey.toString(),
                connected: true
            }));
            alert(`切换到账户 ${publicKey.toBase58()}`);
        } else {
            // 提示用户选择账户或重新连接
            alert('未选择账户，请选择一个账户或重新连接钱包');
            setState(initialState);
        }
    }, []);

    useEffect(() => {
        const provider = (window as any).solana;
        if (provider) {
            provider.on("connect", () => {
                setState(prev => ({
                    ...prev,
                    walletAddress: provider.publicKey.toString(),
                    connected: true
                }));
            });

            provider.on("disconnect", () => {
                setState(initialState);
            });

            provider.on("accountChanged", handleAccountChanged);
        }
    }, [handleAccountChanged]);

    return (
        <WalletContext.Provider value={{ ...state, connect, disconnect, handleAccountChanged }}>
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
