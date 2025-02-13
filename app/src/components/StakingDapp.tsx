"use client";
import React, { useState, useEffect } from 'react';
import { Users, Award, TrendingUp, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@/lib/hooks/useWallet";
import { useStaking } from '@/lib/hooks/useStaking';
import AuthSection from "@/components/Auth/AuthSection";
import ReferralPanel from "@/components/ReferralPanel";
import RewardsPanel from "@/components/RewardsPanel";
import StatsCard from "@/components/StatsCard";
import StakingPackage from "@/components/StakingPackage";
import LevelGuide from "@/components/LevelGuide";
import Notifications from "@/components/Notification";
import '@/app/globals.css';
import ReferralSystem from "@/components/ReferralSystem";
import { connectToPhantomWallet } from '@/utils/wallet';

interface Notification {
    message: string;
    type: 'success' | 'error';
}
const StakingDapp = () => {
    // 从钱包上下文中获取状态和连接方法
    const { client, connected, connecting: walletConnecting, connect } = useWallet();
    // 从质押 Hook 中获取相关操作和状态
    const {
        loading: stakingLoading,
        error: stakingError,
        userInfo,
        packages,
        initializeStaking,
        createStake,
        exitPackage,
        refreshUserInfo
    } = useStaking();
    // 本地状态：loading、通知信息、输入的质押金额
    const [notification, setNotification] = useState<Notification | null>(null);
    const [stakeAmount, setStakeAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // 显示通知函数，3秒后自动关闭通知
    const showNotification = (message: string, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /**
     * 处理钱包连接逻辑
     */
    const handleConnectWallet = async (userInfo?: User) => {
        try {
            setLoading(true);
            await connectToPhantomWallet();
            await connect((window as any).solana);

            const urlParams = new URLSearchParams(window.location.search);
            const referrer = urlParams.get('ref');
            const referrerPubkey = referrer ? new PublicKey(referrer) : undefined;

            if (client) {
                await initializeStaking(referrerPubkey, userInfo);
                showNotification('用户信息初始化成功');
            }

            showNotification('钱包连接成功');
        } catch (error) {
            console.error('连接钱包失败:', error);
            showNotification((error as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * 处理质押逻辑
     */
    const handleStake = async () => {
        if (!client || !stakeAmount) {
            showNotification('请先连接钱包并输入质押金额', 'error');
            return;
        }

        try {
            setLoading(true);
            const amount = Number(stakeAmount);
            if (amount < 100) {
                throw new Error('最低质押金额为 100 USDC');
            }

            // 将 USDC 金额转换为正确的精度 (6位小数)
            const amountWithDecimals = amount * 1_000_000;
            await createStake(amountWithDecimals);

            setStakeAmount('');
            showNotification(`成功质押 ${amount} USDC`);
        } catch (error) {
            console.error('质押失败:', error);
            showNotification((error as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };

    /**
     * 处理退出质押包逻辑
     * @param packageId
     */
    const handleExitPackage = async (packageId: string) => {
        if (!client) return;

        try {
            setLoading(true);
            await exitPackage(new PublicKey(packageId));
            showNotification('成功退出质押包并领取奖励');
        } catch (error) {
            console.error('退出失败:', error);
            showNotification((error as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // 监听钱包连接状态变化，自动刷新用户信息
    useEffect(() => {
        if (connected && client) {
            refreshUserInfo();
        }
    }, [connected, client]);

    /**
     * 统计卡片数据
     */
    const statsCards = [
        {
            icon: <Wallet className="text-blue-600" />,
            label: "质押金额",
            value: `${userInfo?.stakedAmount.toFixed(2) ?? '0'} USDC`
        },
        {
            icon: <Award className="text-green-600" />,
            label: "用户等级",
            value: `V${userInfo?.level ?? 0}`,
            tooltip: `团队加速 ${(userInfo?.level ?? 0) * 5}%`
        },
        {
            icon: <Users className="text-purple-600" />,
            label: "推荐人数",
            value: `${userInfo?.directReferrals ?? 0}/${userInfo?.indirectReferrals ?? 0}`,
            tooltip: "直推/间推人数"
        },
        {
            icon: <TrendingUp className="text-orange-600" />,
            label: "团队业绩",
            value: `${userInfo?.teamPerformance?.toFixed(2) ?? '0'} USDC`
        }
    ];

    return (
        <div className="container mx-auto p-4">
            <AnimatePresence>
                {notification && (
                    <Notifications
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>

            <div className="bg-white rounded-lg shadow-xl p-6">
                {!connected ? (
                    <AuthSection
                        onConnectWallet={handleConnectWallet}
                        loading={loading || walletConnecting}
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* 顶部统计卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            {statsCards.map((card, index) => (
                                <StatsCard key={index} {...card} />
                            ))}
                        </div>

                        {/* 质押面板 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">创建质押包</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            输入质押金额
                                        </label>
                                        <input
                                            type="number"
                                            min="100"
                                            step="100"
                                            value={stakeAmount}
                                            onChange={(e) => setStakeAmount(e.target.value)}
                                            placeholder="最低质押 100 USDC"
                                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            每日收益率: 3‰, 1.5倍出局
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleStake}
                                        disabled={loading || !stakeAmount || Number(stakeAmount) < 100}
                                        className={`w-full py-2 rounded-lg transition-colors duration-200 ${
                                            loading || !stakeAmount || Number(stakeAmount) < 100
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        {loading ? '创建中...' : '创建质押包'}
                                    </button>
                                </div>
                            </div>

                            {/* 奖励面板 */}
                            <RewardsPanel
                                userInfo={userInfo}
                                loading={loading}
                                onClaim={handleExitPackage}
                            />
                        </div>

                        {/* 活跃质押包列表 */}
                        {packages.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">我的质押包</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {packages.map((pkg) => (
                                        <StakingPackage
                                            key={pkg.owner}
                                            pkg={pkg}
                                            onExit={handleExitPackage}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 推荐面板 */}
                        <ReferralPanel userInfo={userInfo} />

                        {/* 等级指南 */}
                        <LevelGuide userInfo={userInfo} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StakingDapp;