"use client";

import React, { useEffect, useState } from 'react';
import RechargeComponent from '@/components/RechargeComponent';
import WithdrawComponent from '@/components/WithdrawComponent';
import TokenComponent from '@/components/TokenComponent';
import { useUser } from '@/lib/context/UserContext';
import { useSystemWallet } from '@/lib/hooks/useSystemWallet';
import { authApi } from '@/api/auth'; // 导入 authApi

export default function RechargePage() {
    const { user, setUser } = useUser(); // 解构 setUser
    const { systemWallet } = useSystemWallet();
    const [loading, setLoading] = useState(true); // 添加加载状态

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authApi.getCurrentUser();
                setUser(response.account); // 更新用户信息
            } catch (error) {
                console.error('获取用户信息失败:', error);
            } finally {
                setLoading(false); // 完成加载
            }
        };

        fetchUser();
    }, [setUser]); // 注意依赖项

    if (loading || !systemWallet) {
        return <div>加载中...</div>;
    }

    return (
<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-8">
    <h1 className="text-3xl font-bold">钱包充值页面</h1>

    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <RechargeComponent
            userWalletAddress={user?.wallet_address} // 使用可选链
            systemWalletAddress={systemWallet.wallet_address}
        />

        <WithdrawComponent
            userWalletAddress={user?.wallet_address} // 使用可选链
            systemWalletAddress={systemWallet.wallet_address}
        />

        <TokenComponent
            userWalletAddress={user?.wallet_address} // 使用可选链
            tokenContractAddress="3rQBaAAfLxUXddEhqa1dj2gKS53ZdcNKcwYP3Qz3gs7D" // 示例代币地址
        />
    </div>
</div>
    );
}