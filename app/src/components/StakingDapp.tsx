"use client";
import React, { useState, useEffect } from 'react';
import { Users, Award, TrendingUp, Wallet, Share2, Clock, AlertCircle, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReferralSystem from '@/components/ReferralSystem';
import ReferralPanel from "@/components/ReferralPanel";
import RewardsPanel from "@/components/RewardsPanel";
import StatsCard from "@/components/StatsCard";
import StakingPackage from "@/components/StakingPackage";
import LevelGuide from "@/components/LevelGuide";
import Notifications from "@/components/Notification";
import '@/app/globals.css';
import WalletConnectSection from "@/components/WalletConnectSection";


/**
 * 主组件
 * @constructor
 */
const StakingDapp = () => {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [stakeAmount, setStakeAmount] = useState('');
    const [activePackages, setActivePackages] = useState([]);
    const [userInfo, setUserInfo] = useState({
        level: 0,
        directReferrals: [], // 存储直推用户信息
        indirectReferrals: [], // 存储间推用户信息
        teamV1Count: 0,
        teamV2Count: 0,
        teamV3Count: 0,
        teamV4Count: 0,
        teamPerformance: 0,
        referralCode: 'SOL123',
        stakingBalance: 0,
        pendingRewards: {
            sol: 0,
            meme: 0
        },
        totalRewards: {
            sol: 0,
            meme: 0
        },
        lastClaimTime: null,
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const connectWallet = async () => {
        try {
            setLoading(true);
            // 1. 获取 Phantom 钱包对象
            const phantomWallet = window.solana;
            if (!phantomWallet) {
                throw new Error('请先安装 Phantom 钱包');
            }

            // 2. 确保钱包处于已连接状态
            if (!phantomWallet.isConnected) {
                await phantomWallet.connect();
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            setConnected(true);
            showNotification('钱包连接成功');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };
    const calculateReferralBonus = (directReferrals, indirectReferrals, baseRelease) => {
        const directBonus = directReferrals.length * (baseRelease * 0.3); // 直推30%加速
        const indirectBonus = indirectReferrals.length * (baseRelease * 0.1); // 间推10%加速
        return directBonus + indirectBonus;
    };

    const calculateTeamBonus = (level, baseRelease) => {
        const LEVEL_REQUIREMENTS = {
            1: { bonus: 5 },
            2: { bonus: 10 },
            3: { bonus: 15 },
            4: { bonus: 20 },
            5: { bonus: 25, globalBonus: 1 }
        };
        const levelBonus = LEVEL_REQUIREMENTS[level]?.bonus || 0;
        return baseRelease * (levelBonus / 100);
    };

    const handleStake = async () => {
        try {
            setLoading(true);
            const amount = Number(stakeAmount);
            if (amount < 100) {
                throw new Error('最低质押金额为 100 USDC');
            }

            const baseRelease = amount * 0.3; // 3‰基础释放
            const maxTotal = amount * 1.5; // 1.5倍出局

            const referralBonus = calculateReferralBonus(
                userInfo.directReferrals,
                userInfo.indirectReferrals,
                baseRelease
            );

            const teamBonus = calculateTeamBonus(userInfo.level, baseRelease);

            const newPackage = {
                id: Date.now(),
                amount,
                baseRelease,
                acceleratedRelease: referralBonus + teamBonus,
                currentTotal: 0,
                maxTotal,
            };

            setActivePackages(prev => [...prev, newPackage]);
            setUserInfo(prev => ({
                ...prev,
                stakingBalance: prev.stakingBalance + amount,
            }));

            setStakeAmount('');
            showNotification(`成功质押 ${amount} USDC`);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {setLoading(false);
        }
    };

    const handleExit = async (packageId) => {
        try {
            setLoading(true);
            const exitedPackage = activePackages.find(pkg => pkg.id === packageId);

            if (exitedPackage) {
                // 50%兑换成SOL，50%兑换成MEME币
                const solReward = exitedPackage.currentTotal * 0.5;
                const memeReward = exitedPackage.currentTotal * 0.5;

                setUserInfo(prev => ({
                    ...prev,
                    pendingRewards: {
                        sol: prev.pendingRewards.sol + solReward,
                        meme: prev.pendingRewards.meme + memeReward
                    },
                }));

                setActivePackages(prev =>
                    prev.filter(pkg => pkg.id !== packageId)
                );

                showNotification('成功退出质押包并领取奖励');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        try {
            setLoading(true);
            if (userInfo.pendingRewards.sol <= 0 && userInfo.pendingRewards.meme <= 0) {
                throw new Error('暂无可领取奖励');
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            const { sol, meme } = userInfo.pendingRewards;
            setUserInfo(prev => ({
                ...prev,
                totalRewards: {
                    sol: userInfo.totalRewards.sol + sol,
                    meme: userInfo.totalRewards.meme + meme,
                },
                pendingRewards: { sol: 0, meme: 0 },
                lastClaimTime: new Date(),
            }));

            showNotification(`成功领取 ${sol.toFixed(3)} SOL 和 ${meme.toFixed(3)} MEME 代币奖励`);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setActivePackages(prev =>
                prev.map(pkg => {
                    if (pkg.currentTotal >= pkg.maxTotal) return pkg;

                    const totalRelease = pkg.baseRelease + pkg.acceleratedRelease;
                    const newTotal = Math.min(pkg.currentTotal + totalRelease, pkg.maxTotal);

                    return {
                        ...pkg,
                        currentTotal: newTotal
                    };
                })
            );
        }, 10000); // 为演示加快更新频率，实际应为24小时

        return () => clearInterval(interval);
    }, []);

    // 检查用户等级提升
    useEffect(() => {
        const checkLevelUpgrade = () => {
            const { directReferrals, teamV1Count, teamV2Count, teamV3Count, teamV4Count } = userInfo;
            let newLevel = 0;

            if (directReferrals.length >= 10) newLevel = 1;
            if (teamV1Count >= 3) newLevel = 2;
            if (teamV2Count >= 3) newLevel = 3;
            if (teamV3Count >= 3) newLevel = 4;
            if (teamV4Count >= 3) newLevel = 5;

            if (newLevel > userInfo.level) {
                setUserInfo(prev => ({
                    ...prev,
                    level: newLevel
                }));
                showNotification(`恭喜！您已升级到 V${newLevel}`);
            }
        };

        checkLevelUpgrade();
    }, [userInfo.directReferrals, userInfo.teamV1Count, userInfo.teamV2Count, userInfo.teamV3Count, userInfo.teamV4Count]);

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
                    <div className="text-center py-10">
                        <WalletConnectSection onConnect={connectWallet} loading={loading} />
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* 顶部统计卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <StatsCard
                                icon={<Wallet className="text-blue-600" />}
                                label="质押金额"
                                value={`${userInfo.stakingBalance.toFixed(2)} USDC`}
                            />
                            <StatsCard
                                icon={<Award className="text-green-600" />}
                                label="用户等级"
                                value={`V${userInfo.level}`}
                                tooltip={`团队加速 ${userInfo.level * 5}%`}
                            />
                            <StatsCard
                                icon={<Users className="text-purple-600" />}
                                label="推荐人数"
                                value={`${userInfo.directReferrals.length}/${userInfo.indirectReferrals.length}`}
                                tooltip="直推/间推人数"
                            />
                            <StatsCard
                                icon={<TrendingUp className="text-orange-600" />}
                                label="团队业绩"
                                value={`${userInfo.teamPerformance.toFixed(2)} USDC`}
                            />
                        </div>

                        {/* 质押和奖励面板 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* 质押面板 */}
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
                                onClaim={handleClaim}
                            />
                        </div>

                        {/* 活跃质押包列表 */}
                        {activePackages.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">我的质押包</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {activePackages.map((pkg) => (
                                        <StakingPackage
                                            key={pkg.id}
                                            pkg={pkg}
                                            onExit={handleExit}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 推荐面板 */}
                        <ReferralPanel userInfo={userInfo} />
                        <ReferralSystem />
                        {/* 等级指南 */}
                        <LevelGuide userInfo={userInfo} />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StakingDapp;