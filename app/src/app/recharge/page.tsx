"use client";

import React from 'react';
import RechargeComponent from '@/components/RechargeComponent';
import WithdrawComponent from '@/components/WithdrawComponent';
import TokenComponent from '@/components/TokenComponent';
import { useUser } from '@/lib/context/UserContext';
import { useSystemWallet } from '@/lib/hooks/useSystemWallet';

export default function RechargePage() {
    const { user } = useUser();
    const { systemWallet } = useSystemWallet();

    if (!user || !systemWallet) {
        return <div>加载中...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-8">
            <h1 className="text-3xl font-bold">钱包充值页面</h1>

            <RechargeComponent
                userWalletAddress={user.wallet_address}
                systemWalletAddress={systemWallet.wallet_address}
            />

            <WithdrawComponent
                userWalletAddress={user.wallet_address}
                systemWalletAddress={systemWallet.wallet_address}
            />

            <TokenComponent
                userWalletAddress={user.wallet_address}
                tokenContractAddress="3rQBaAAfLxUXddEhqa1dj2gKS53ZdcNKcwYP3Qz3gs7D" // 示例代币地址
            />
        </div>
    );
}