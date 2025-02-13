"use client";

import { useWallet } from '@/lib/hooks/useWallet';
import { motion } from 'framer-motion';

export function WalletButton() {
  const { connected, connecting, connect, disconnect } = useWallet();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-2 rounded-full font-medium transition-colors ${
        connected
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-white hover:bg-gray-100 text-blue-600'
      }`}
      onClick={connected ? disconnect : connect}
      disabled={connecting}
    >
      {connecting ? '连接中...' : connected ? '已连接' : '连接钱包'}
    </motion.button>
  );
} 