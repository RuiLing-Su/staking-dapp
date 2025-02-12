"use client";
import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { useWallet } from './useWallet';
import { StakingPackage, UserInfo } from '../types';

export const useStaking = () => {
    const { client, connected } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [packages, setPackages] = useState<StakingPackage[]>([]);

    /**
     * 初始化用户账户方法
     */
    const initializeStaking = useCallback(async (referrerPubkey?: PublicKey) => {
        if (!client) throw new Error('StakingClient is not initialized');

        setLoading(true);
        setError(null);

        try {
            // 调用 StakingClient 的 initializeUserAccount 方法
            const userInfo = await client.initializeUserAccount(referrerPubkey);
            setUserInfo(userInfo);

            // 获取用户质押包
            const activePackages = await client.getUserPackages();
            setPackages(activePackages);

            return userInfo;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Initialization failed'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [client]);

    /**
     * 刷新用户信息和质押包
     */
    const refreshUserInfo = useCallback(async () => {
        if (!client) return;

        try {
            const userInfo = await client.getUserInfo();
            const activePackages = await client.getUserPackages();

            setUserInfo(userInfo);
            setPackages(activePackages);
        } catch (err) {
            console.error('Failed to refresh user info', err);
        }
    }, [client]);

    /**
     * 创建质押
     */
    const createStake = useCallback(async (amount: BN) => {
        if (!client) throw new Error('Client not initialized');

        setLoading(true);
        setError(null);

        try {
            // 创建质押包
            const newPackage = await client.createAndStakePackage(amount);

            // Refresh user info and packages
            await refreshUserInfo();

            return newPackage;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Staking failed'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [client, refreshUserInfo]);

    /**
     * 退出质押
     * @param packageAddress
     */
    const exitPackage = useCallback(async (packageId: PublicKey) => {
        if (!client) throw new Error('Client not initialized');

        setLoading(true);
        setError(null);

        try {
            // Exit the specified package
            await client.exitPackage(packageId);

            // Refresh user info and packages
            await refreshUserInfo();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Package exit failed'));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [client, refreshUserInfo]);

    useEffect(() => {
        if (connected && client) {
            (async () => {
                try {
                    console.log("🔄 Checking if UserInfo exists...");
                    await initializeStaking();
                    console.log("✅ UserInfo initialized!");
                } catch (error) {
                    console.error("❌ Failed to initialize UserInfo:", error);
                }
            })();
        }
    }, [connected, client, initializeStaking]);


    return {
        loading,
        error,
        userInfo,
        packages,
        initializeStaking,
        createStake,
        exitPackage,
        refreshUserInfo
    };
};