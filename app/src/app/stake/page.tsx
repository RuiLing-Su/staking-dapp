"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';
import { useStaking } from '@/lib/hooks/useStaking';
import StakingPackage from '@/components/StakingPackage';

const StakePage = () => {
  const { client, connected } = useWallet();
  const { loading: stakingLoading, createStake, packages } = useStaking();
  const [stakeAmount, setStakeAmount] = useState('');

  const handleStake = async () => {
    if (!client || !stakeAmount) return;
    try {
      const amount = Number(stakeAmount);
      if (amount < 100) {
        alert('最低质押金额为 100 USDC');
        return;
      }
      // 将 USDC 金额转换为 6 位小数（例如 1_000_000）
      const amountWithDecimals = amount * 1_000_000;
      await createStake(amountWithDecimals);
      setStakeAmount('');
      alert(`成功质押 ${amount} USDC`);
    } catch (error) {
      console.error('质押失败:', error);
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
        <>
          <section>
            <h2 className="text-2xl font-bold text-center mb-6">创建质押包</h2>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入质押金额（USDC）
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="最低质押 100 USDC"
                className="w-full px-4 py-2 mb-4 rounded-lg border focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleStake}
                disabled={stakingLoading || !stakeAmount || Number(stakeAmount) < 100}
                className={`w-full py-2 rounded-lg text-white font-semibold transition-colors duration-200 ${
                  stakingLoading || !stakeAmount || Number(stakeAmount) < 100
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {stakingLoading ? '创建中...' : '创建质押包'}
              </button>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-4">我的质押包</h3>
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <StakingPackage key={pkg.owner} pkg={pkg} onExit={() => {}} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">暂无质押包</p>
            )}
          </section>
        </>
      ) : (
        <p className="text-center text-xl text-gray-700">请先连接钱包</p>
      )}
    </motion.div>
  );
};

export default StakePage; 