"use client";

import React from 'react';
import { motion } from 'framer-motion';

const WalletNotConnected: React.FC = () => {
  return (
    <motion.div
      className="max-w-sm mx-auto p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-xl border border-gray-300 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-gray-700">请先连接钱包</p>
    </motion.div>
  );
};

export default WalletNotConnected; 