
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from './useWallet';
import { StakingPackage, UserInfo } from './types';

export const useStaking = () => {
    const { client } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [packages, setPackages] = useState<StakingPackage[]>([]);

    /**
     * 初始化质押
     * @param referrerPubkey
     */
    const initializeStaking = async (referrerPubkey: PublicKey) => {
        if (!client) throw new Error('Client not initialized');

        try {
            setLoading(true);
            setError(null);

            // 获取质押池地址
            const poolAddress = await client.getPoolAddress();

            // 检查用户账户是否已存在
            const userInfoAddress = await client.getUserInfoAddress();
            let userInfo = await client.getUserInfo(userInfoAddress);

            // 如果用户账户不存在，则创建
            if (!userInfo) {
                await client.createUser(referrerPubkey);
                userInfo = await client.getUserInfo(userInfoAddress);
            }

            // 创建质押包
            const packageAddress = await client.createPackage(
                poolAddress,
                userInfoAddress,
                1000_000_000 // 1000 USDC (6位小数)
            );

            // 质押代币
            await client.stake(poolAddress, userInfoAddress, 1000_000_000);

            // 获取最新用户信息并更新状态
            const updatedUserInfo = await client.getUserInfo(userInfoAddress);
            setUserInfo(updatedUserInfo);

            return { userInfoAddress, packageAddress };
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * 刷新用户信息
     * @param userInfoAddress
     */
    const refreshUserInfo = async (userInfoAddress: PublicKey) => {
        if (!client) return;

        try {
            const info = await client.getUserInfo(userInfoAddress);
            setUserInfo(info);
        } catch (err) {
            console.error('Failed to refresh user info:', err);
        }
    };

    return {
        initializeStaking,
        refreshUserInfo,
        loading,
        error,
        userInfo,
        packages,
    };
};