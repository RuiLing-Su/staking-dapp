"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';

const MemePage = () => {
  const { connected } = useWallet();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {connected ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">MEME代币</h2>
          <p>这里展示有关 MEME 代币的信息和操作。</p>
        </div>
      ) : (
        <p>请先连接钱包</p>
      )}
    </motion.div>
  );
};

export default MemePage; 