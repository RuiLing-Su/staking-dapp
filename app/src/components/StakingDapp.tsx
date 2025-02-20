"use client";
import React, { useState, useEffect } from 'react';
import { Users, Award, TrendingUp, Wallet } from 'lucide-react';
import { motion, AnimatePresence as RawAnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStaking } from '@/lib/hooks/useStaking';
import ReferralPanel from "@/components/ReferralPanel";
import RewardsPanel from "@/components/RewardsPanel";
import StatsCard from "@/components/StatsCard";
import StakingPackage from "@/components/StakingPackage";
import LevelGuide from "@/components/LevelGuide";
import Notifications from "@/components/Notification";
import { useUser } from '@/lib/context/UserContext';
import { authApi } from '@/api/auth';
import '@/app/globals.css';
import Link from 'next/link';
import { stakingApi } from '@/api/staking';
import TokenList from '@/components/TokenList';
import ReferralSystem from '@/components/ReferralSystem';

interface Notification {
    message: string;
    type: 'success' | 'error';
}

const AnimatePresence = RawAnimatePresence as unknown as React.FC<{ children?: React.ReactNode }>;

const StakingDapp = () => {
    const {
        loading: stakingLoading,
        error: stakingError,
        packages,
        createStake,
        exitPackage,
        refreshPackages
    } = useStaking();
    const { user, setUser } = useUser();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [stakeAmount, setStakeAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [levelUpgrade, setLevelUpgrade] = useState<any[]>([]);
    const [teamEarnings, setTeamEarnings] = useState<number | null>(null);
    const [referralData, setReferralData] = useState<{ direct: any[], indirect: any[] }>({ direct: [], indirect: [] });
    const router = useRouter();

    // 刷新用户信息
    const refreshUser = async () => {
        try {
            const res = await authApi.getCurrentUser();
            setUser(res.account);
        } catch (error) {
            console.error("刷新用户信息失败:", error);
        }
    };

    // 页面挂载时校验 token
    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            router.push("/auth");
            return;
        }
        authApi.validateToken().then((valid) => {
            if (!valid) {
                router.push("/auth");
            } else {
                refreshUser();
            }
        }).catch((err) => {
            console.error("token校验错误: ", err);
            router.push("/auth");
        });
    }, [router]);

    // 获取等级升级信息
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

    // 获取团队业绩
    useEffect(() => {
        const fetchTeamEarnings = async () => {
            if (user) {
                try {
                    const earnings = await authApi.getTeamEarnings();
                    setTeamEarnings(earnings.team_earnings);
                } catch (error) {
                    console.error("获取团队业绩失败", error);
                }
            }
        };
        fetchTeamEarnings();
    }, [user]);

    // 获取推荐数据

    // 显示通知
    const showNotification = (message: string, type: "success" | "error" = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // 质押逻辑
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
            await createStake(amount);
            setStakeAmount("");
            showNotification(`成功质押 ${amount} USDC`);
            await refreshUser();
        } catch (error: any) {
            console.error("质押失败:", error);
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 退出质押包逻辑
    const handleExitPackage = async (packageId: string) => {
        if (!user) return;
        try {
            setLoading(true);
            await exitPackage(packageId);
            showNotification("成功退出质押包并领取奖励");
            await refreshUser();
        } catch (error: any) {
            console.error("退出失败:", error);
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 提现逻辑
    const handleClaimRewards = async (amount: number) => {
        if (!user) return;
        try {
            setLoading(true);
            await stakingApi.requestWithdraw(amount);
            showNotification("提现申请已提交");
            await refreshUser();
        } catch (error: any) {
            console.error("提现失败:", error);
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 统计卡片数据
    const statsCards = [
        {
            icon: <Wallet className="text-blue-600" />,
            label: "质押金额",
            value: `${user?.total_principal ?? '0'} USDC`
        },
        {
            icon: <Award className="text-green-600" />,
            label: "用户等级",
            value: `${user?.level ?? ''}`,
            tooltip: levelUpgrade.length > 0
                ? `从 ${levelUpgrade[0].from_level} 升至 ${levelUpgrade[0].to_level}，需 ${levelUpgrade[0].required_count} 个 ${levelUpgrade[0].required_referral_level}；团队加速 ${levelUpgrade[0].team_acceleration}% ，全球分红 ${levelUpgrade[0].shareholder_dividend}%`
                : ''
        },
        {
            icon: <Users className="text-purple-600" />,
            label: "推荐人数",
            value: `${user?.direct_invite_total ?? 0}/${user?.indirect_invite_total ?? 0}`,
            tooltip: "直推/间推人数"
        },
        {
            icon: <TrendingUp className="text-orange-600" />,
            label: "团队业绩",
            value: `${teamEarnings ?? '0'} USDC`
        }
    ];

    // 用户未登录时显示提示
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="mb-4 text-lg font-bold">您尚未登录</p>
                    <Link
                        href="/auth"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        前往登录/注册
                    </Link>
                </div>
            </div>
        );
    }

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

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* 顶部统计卡片 */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {statsCards.map((card, index) => (
                            <StatsCard key={index} {...card} />
                        ))}
                    </div>
                </div>

                {/* 质押面板 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white shadow rounded-lg p-6">
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
                    <div className="bg-white shadow rounded-lg p-6">
                        <RewardsPanel loading={loading} onClaim={handleClaimRewards} />
                    </div>
                </div>

                {/* 代币列表组件 */}
                <TokenList />
                {/* 活跃质押包列表 */}
                {packages.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">我的质押包</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {packages.map((pkg) => (
                                <StakingPackage
                                    key={pkg.id}
                                    pkg={pkg}
                                    onExit={() => handleExitPackage(pkg.id.toString())}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 推荐系统 */}
                <ReferralSystem referralData={referralData} /> {/* 将数据传递给ReferralSystem */}

                {/* 等级指南 */}
                <LevelGuide userInfo={user} levels={levelUpgrade || []} />
            </motion.div>
        </div>
    );
};

export default StakingDapp;