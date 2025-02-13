"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';
import { useStaking } from '@/lib/hooks/useStaking';
import LevelGuide from '@/components/LevelGuide';

const LevelPage = () => {
  const { connected } = useWallet();
  const { userInfo } = useStaking();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {connected ? (
        <>
          <h2 className="text-2xl font-bold mb-4">等级指南</h2>
          <LevelGuide userInfo={userInfo} />
        </>
      ) : (
        <p>请先连接钱包</p>
      )}
    </motion.div>
  );
};

export default LevelPage; 