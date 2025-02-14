"use client";
import React, { useState, useEffect } from 'react';
import { Users, Award, TrendingUp, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicKey } from "@solana/web3.js";
import { useRouter } from 'next/navigation';
import { useWallet } from "@/lib/hooks/useWallet";
import { useStaking } from '@/lib/hooks/useStaking';
import AuthSection from "@/components/Auth/AuthSection";
import ReferralPanel from "@/components/ReferralPanel";
import RewardsPanel from "@/components/RewardsPanel";
import StatsCard from "@/components/StatsCard";
import StakingPackage from "@/components/StakingPackage";
import LevelGuide from "@/components/LevelGuide";
import Notifications from "@/components/Notification";
import ReferralSystem from "@/components/ReferralSystem";
import UserInfoCard from '@/components/UserInfoCard';
import { useUser } from '@/lib/context/UserContext';
import { authApi } from '@/api/auth';
import '@/app/globals.css';
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
    // 从用户上下文中获取登录成功后的用户信息
    const { user, login } = useUser();
    // 本地状态：loading、通知信息、输入的质押金额、等级升级信息
    const [notification, setNotification] = useState<Notification | null>(null);
    const [stakeAmount, setStakeAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [levelUpgrade, setLevelUpgrade] = useState<any[]>([]);
    const router = useRouter();

    // 页面挂载时校验 token 是否存在且有效
    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            router.push("/auth");
            return;
        }
        authApi
            .validateToken()
            .then((valid) => {
                if (!valid) {
                    router.push("/auth");
                }
            })
            .catch((err) => {
                console.error("token校验错误: ", err);
                router.push("/auth");
            });
    }, [router]);

    // 获取等级升级信息（接口返回数组）
    useEffect(() => {
        async function fetchLevelInfo() {
            try {
                const data = await authApi.getLevelUpgradeInfo();
                setLevelUpgrade(data);
            } catch (error) {
                console.error("获取等级信息失败", error);
            }
        }
        if (user) {
            fetchLevelInfo();
        }
    }, [user]);

    // 显示通知函数，3秒后自动关闭通知
    const showNotification = (message: string, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /**
     * 连接钱包逻辑（改为链下逻辑，不再调用原链上钱包连接接口）
     */
    const handleConnectWallet = async () => {
        if (!user) {
            router.push("/auth");
            return;
        }
        try {
            setLoading(true);
            // 如后续需要调用初始化操作，可在此处调用链下对应接口（已带 token）
            // 此处示意直接认为钱包已连接
            showNotification("钱包连接成功");
        } catch (error: any) {
            console.error("连接钱包失败:", error);
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    /**
     * 处理质押逻辑
     */
    const handleStake = async () => {
        if (!user || !stakeAmount) {
            showNotification("请先登录并输入质押金额", "error");
            return;
        }
        try {
            setLoading(true);
            const amount = Number(stakeAmount);
            if (amount < 100) {
                throw new Error("最低质押金额为 100 USDC");
            }
            // 将 USDC 金额转换为正确精度（6位小数），转换后直接作为数字传给后端
            const amountWithDecimals = amount
            await createStake(amountWithDecimals);
            setStakeAmount("");
            showNotification(`成功质押 ${amount} USDC`);
        } catch (error: any) {
            console.error("质押失败:", error);
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    /**
     * 处理退出质押包逻辑
     * @param packageId
     */
    const handleExitPackage = async (packageId: string) => {
        if (!user) return;
        try {
            setLoading(true);
            await exitPackage(packageId);
            showNotification("成功退出质押包并领取奖励");
        } catch (error: any) {
            console.error("退出失败:", error);
            showNotification(error.message, "error");
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
     * 统计卡片数据，其中第二个卡片展示用户等级及升级详情（通过等级接口获取）
     */
    const statsCards = [
        {
            icon: <Wallet className="text-blue-600" />,
            label: "质押金额",
            value: `${userInfo?.stakedAmount?.toFixed(2) ?? '0'} USDC`
        },
        {
            icon: <Award className="text-green-600" />,
            label: "用户等级",
            value: `V${userInfo?.level ?? 0}`,
            tooltip: levelUpgrade.length > 0
                ? `从 ${levelUpgrade[0].from_level} 升至 ${levelUpgrade[0].to_level}，需 ${levelUpgrade[0].required_count} 个 ${levelUpgrade[0].required_referral_level}；团队加速 ${levelUpgrade[0].team_acceleration}% ，全球分红 ${levelUpgrade[0].shareholder_dividend}%`
                : ''
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

            {/* 顶部用户信息与钱包连接 */}
            {user ? (
                <div className="mb-6">
                    <UserInfoCard userInfo={user} />
                    <button
                        onClick={handleConnectWallet}
                        disabled={loading}
                        className={`mt-4 py-2 px-4 rounded ${
                            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        {loading ? "处理中..." : "连接钱包"}
                    </button>
                </div>
            ) : (
                // 如果无用户信息，则显示登录/注册组件
                <AuthSection onConnectWallet={handleConnectWallet} loading={loading} />
            )}

            {/* 主内容部分：仅当已登录时展示 */}
            {user && (
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

                    {/* 推荐面板，传入登录成功返回的用户信息 */}
                    <ReferralPanel user={user} />

                    {/* 等级指南，新传入接口返回的数组数据 */}
                    <LevelGuide userInfo={user} levels={levelUpgrade || []} />
                </motion.div>
            )}
        </div>
    );
};

export default StakingDapp;