"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';
import { useStaking } from '@/lib/hooks/useStaking';
import RewardsPanel from '@/components/RewardsPanel';
import { PublicKey } from '@solana/web3.js';

const RewardPage = () => {
  const { client, connected } = useWallet();
  const { loading, userInfo, exitPackage } = useStaking();

  const handleClaim = async (packageId: string) => {
    if (!client) return;
    try {
      await exitPackage(new PublicKey(packageId));
      alert('成功退出质押包并领取奖励');
    } catch (error) {
      console.error('领取奖励失败:', error);
      alert((error as Error).message);
    }
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {connected ? (
        <section>
          <h2 className="text-2xl font-bold text-center mb-6">奖励信息</h2>
          <RewardsPanel
            userInfo={userInfo}
            loading={loading}
            onClaim={() => handleClaim('PACKAGE_ID_PLACEHOLDER')}
          />
        </section>
      ) : (
        <p className="text-center text-xl text-gray-700">请先连接钱包</p>
      )}
    </motion.div>
  );
};

export default RewardPage; 