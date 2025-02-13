"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';
import Image from 'next/image';
import memeImg from '/public/meme.png';
import WalletNotConnected from '@/components/WalletNotConnected';

const MemePage = () => {
  const { connected } = useWallet();

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {connected ? (
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-extrabold mb-4">MEME 代币</h2>
          <div className="mx-auto mb-4 w-32 h-32 relative">
            <Image src={memeImg} alt="Meme Token" fill className="object-contain" />
          </div>
          <p className="mb-6 text-lg">
            这是一款全新的 MEME 代币，社区驱动的数字经济体验在此展开！
          </p>
          <button className="px-6 py-2 rounded-full bg-white text-purple-600 font-semibold hover:bg-opacity-90 transition">
            了解更多
          </button>
        </div>
      ) : (
        <WalletNotConnected />
      )}
    </motion.div>
  );
};

export default MemePage; 