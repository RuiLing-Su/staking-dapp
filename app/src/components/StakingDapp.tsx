"use client";
import React, { useState, useEffect } from 'react';
import { Users, Award, TrendingUp, Wallet, Share2, Clock, AlertCircle, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WalletConnectSection from "@/components/WalletConnectSection";
import ReferralSystem from '@/components/ReferralSystem';
import ReferralPanel from "@/components/ReferralPanel";
import RewardsPanel from "@/components/RewardsPanel";
import StatsCard from "@/components/StatsCard";
import StakingPackage from "@/components/StakingPackage";
import LevelGuide from "@/components/LevelGuide";
import Notifications from "@/components/Notification";
import { useWallet } from "@/lib/useWallet"
import { useStaking } from '@/lib/useStaking';
import { PublicKey} from "@solana/web3.js";
import '@/app/globals.css';

const StakingDapp = () => {
    // 从钱包上下文中获取状态和连接方法
    const { client, connected, connecting: walletConnecting, connect } = useWallet();
    // 从质押 Hook 中获取相关操作和状态
    const { initializeStaking, refreshUserInfo, loading: stakingLoading, error: stakingError, userInfo, packages } = useStaking();

    // 本地状态：loading、通知信息、输入的质押金额
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [stakeAmount, setStakeAmount] = useState('');

    // 显示通知函数，3秒后自动关闭通知
    const showNotification = (message: string, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /**
     * 获取用户信息地址
     */
    const getUserInfoAddress = async () => {
        if (!client) return null;

        const [userInfoAddress] = await PublicKey.findProgramAddress(
            [Buffer.from('user_info'), client.wallet.publicKey.toBuffer()],
            client.program.programId
        );

        return userInfoAddress;
    };

    /**
     * 处理钱包连接逻辑
     */
    const handleConnectWallet = async () => {
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

            // 3. 调用 useWallet 的 connect 方法初始化
            await connect(phantomWallet);

            // 4. 获取用户信息
            if (client) {
                const userInfoAddress = await getUserInfoAddress();
                if (userInfoAddress) {
                    try {
                        // 刷新用户信息
                        await refreshUserInfo(userInfoAddress);
                    } catch (error) {
                        // 如果用户信息不存在，则初始化质押（这里传入默认推荐人地址）
                        console.log('未找到用户信息，正在初始化质押...');
                        const defaultReferrer = new PublicKey('11111111111111111111111111111111');
                        await initializeStaking(defaultReferrer);
                    }
                }
            }

            showNotification('钱包连接成功');
        } catch (error) {
            console.error('连接钱包失败:', error);
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };


    const handleStake = async () => {
        if (!client) {
            showNotification('请先连接钱包', 'error');
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

            // 如果是首次质押，需要初始化
            if (!userInfo) {
                // 这里使用一个默认的推荐人地址，实际应该从URL参数或其他地方获取
                const defaultReferrer = new PublicKey('11111111111111111111111111111111');
                await initializeStaking(defaultReferrer);
            } else {
                // 获取质押池地址
                const poolAddress = await client.getPoolAddress();

                // 创建新的质押包
                const userInfoAddress = await getUserInfoAddress();
                if (!userInfoAddress) throw new Error('无法获取用户信息地址');

                await client.createPackage(
                    poolAddress,
                    userInfoAddress,
                    amountWithDecimals
                );

                // 进行质押
                await client.stake(
                    poolAddress,
                    userInfoAddress,
                    amountWithDecimals
                );

                // 刷新用户信息
                await refreshUserInfo(userInfoAddress);
            }

            setStakeAmount('');
            showNotification(`成功质押 ${amount} USDC`);
        } catch (error) {
            console.error('质押失败:', error);
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExit = async (packageId: string) => {
        if (!client) return;

        try {
            setLoading(true);
            const poolAddress = await client.getPoolAddress();
            const userInfoAddress = await getUserInfoAddress();

            if (!userInfoAddress) throw new Error('无法获取用户信息地址');

            await client.exitPackage(
                poolAddress,
                userInfoAddress,
                new PublicKey(packageId),
                client.program.programId // 这里需要正确的admin地址
            );

            // 刷新用户信息
            await refreshUserInfo(userInfoAddress);

            showNotification('成功退出质押包并领取奖励');
        } catch (error) {
            console.error('退出失败:', error);
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // 监听钱包连接状态变化，自动刷新用户信息
    useEffect(() => {
        if (connected && client) {
            getUserInfoAddress().then(address => {
                if (address) {
                    refreshUserInfo(address);
                }
            });
        }
    }, [connected, client]);

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
                    <WalletConnectSection
                        onConnect={handleConnectWallet}
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
                            <StatsCard
                                icon={<Wallet className="text-blue-600" />}
                                label="质押金额"
                                value={`${userInfo?.stakedAmount.toFixed(2) ?? '0'} USDC`}
                            />
                            <StatsCard
                                icon={<Award className="text-green-600" />}
                                label="用户等级"
                                value={`V${userInfo?.level ?? 0}`}
                                tooltip={`团队加速 ${(userInfo?.level ?? 0) * 5}%`}
                            />
                            <StatsCard
                                icon={<Users className="text-purple-600" />}
                                label="推荐人数"
                                value={`${userInfo?.directReferrals ?? 0}/${userInfo?.indirectReferrals ?? 0}`}
                                tooltip="直推/间推人数"
                            />
                            <StatsCard
                                icon={<TrendingUp className="text-orange-600" />}
                                label="团队业绩"
                                value={`${userInfo?.teamPerformance?.toFixed(2) ?? '0'} USDC`}
                            />
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
                                onClaim={handleExit}
                            />
                        </div>

                        {/* 活跃质押包列表 */}
                        {packages.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">我的质押包</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {packages.map((pkg) => (
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