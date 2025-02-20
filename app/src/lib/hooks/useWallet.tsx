"use client";

import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { WalletState, WalletContextState } from '@/types/walletTypes';
import { authApi } from '@/api/auth';
import { RegisterCredentials } from '@/types/authTypes';

const initialState: WalletState = {
    walletAddress: null,
    connected: false,
    connecting: false,
    error: null,
};

const WalletContext = createContext<WalletContextState>({} as WalletContextState);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<WalletState>(initialState);
    const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);

    useEffect(() => {
        // 从 URL 中获取邀请码
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if (code) {
            setInviteCode(code);
        }
    }, []);

    const connect = useCallback(async () => {
        if (state.connecting || state.connected) return;

        try {
            setState(prev => ({ ...prev, connecting: true, error: null }));
            console.log('正在连接钱包...');

            const provider = (window as any).solana;
            if (!provider) {
                window.open('https://phantom.app/', '_blank');
                throw new Error('Phantom 钱包未安装');
            }

            const resp = await provider.connect();
            const walletAddress = resp.publicKey.toString();
            console.log('钱包地址:', walletAddress);

            // 随机生成昵称
            const nickname = `user_${Math.floor(Math.random() * 10000)}`;
            const defaultAvatar = "/human.png";

            const credentials: RegisterCredentials = {
                nickname,
                wallet_address: walletAddress,
                invite_code: inviteCode,
                avatar: defaultAvatar,
            };

            await authApi.register(credentials);

            setState({
                walletAddress,
                connected: true,
                connecting: false,
                error: null
            });
            console.log('钱包连接成功并用户注册/登录成功');

        } catch (error) {
            console.error('钱包连接或用户注册/登录失败:', error);
            setState(prev => ({
                ...initialState,
                error: error instanceof Error ? error : new Error('钱包连接或用户注册/登录失败')
            }));
        }
    }, [state.connecting, state.connected, inviteCode]);

    const disconnect = useCallback(async () => {
        console.log('断开钱包连接...');
        const provider = (window as any).solana;
        if (provider && provider.isConnected) {
            await provider.disconnect();
        }
        await authApi.logout();
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

