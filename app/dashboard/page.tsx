"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AuthSection from '@/components/Auth/AuthSection';
import StatsCard from '@/components/StatsCard';
import ReferralPanel from '@/components/ReferralPanel';
import LevelGuide from '@/components/LevelGuide';
import { useWallet } from '@/lib/hooks/useWallet';
import { useStaking } from '@/lib/hooks/useStaking';

const Dashboard = () => {
  const { client, connected, connecting: walletConnecting } = useWallet();
  const { userInfo, refreshUserInfo } = useStaking();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && client) {
      refreshUserInfo();
    }
  }, [connected, client]);

  const statsCards = [
    {
      icon: <span>💰</span>,
      label: '质押金额',
      value: `${userInfo?.stakedAmount?.toFixed(2) ?? '0'} USDC`,
    },
    {
      icon: <span>⭐</span>,
      label: '用户等级',
      value: `V${userInfo?.level ?? 0}`,
      tooltip: `团队加速 ${(userInfo?.level ?? 0) * 5}%`,
    },
    {
      icon: <span>👥</span>,
      label: '推荐人数',
      value: `${userInfo?.directReferrals ?? 0}/${userInfo?.indirectReferrals ?? 0}`,
      tooltip: '直推/间推人数',
    },
    {
      icon: <span>📊</span>,
      label: '团队业绩',
      value: `${userInfo?.teamPerformance?.toFixed(2) ?? '0'} USDC`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 若未完成注册或未连接钱包则显示注册/登录区域 */}
      <AuthSection onConnectWallet={() => {}} loading={loading || walletConnecting} />
      {connected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
            {statsCards.map((card, index) => (
              <StatsCard key={index} {...card} />
            ))}
          </div>
          <ReferralPanel userInfo={userInfo} />
          <LevelGuide userInfo={userInfo} />
        </>
      )}
    </motion.div>
  );
};

export default Dashboard; 