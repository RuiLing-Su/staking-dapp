"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';
import { useStaking } from '@/lib/hooks/useStaking';
import ReferralPanel from '@/components/ReferralPanel';
import ReferralSystem from '@/components/ReferralSystem';

const ReferralPage = () => {
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
          <h2 className="text-2xl font-bold mb-4">推荐信息</h2>
          <ReferralPanel userInfo={userInfo} />
          <ReferralSystem />
        </>
      ) : (
        <p>请先连接钱包</p>
      )}
    </motion.div>
  );
};

export default ReferralPage; 