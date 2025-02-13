"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { connectToPhantomWallet } from "@/utils/wallet";

interface RegisterFormProps {
  onSubmit: (
    nickname: string,
    walletAddress: string,
    inviteCode?: string,
    avatar?: string
  ) => void;
  loading?: boolean;
}

const RegisterForm = ({ onSubmit, loading }: RegisterFormProps) => {
  const [nickname, setNickname] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isInviteCodeReadOnly, setIsInviteCodeReadOnly] = useState(false);
  const defaultAvatar = "/human.png";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setInviteCode(code);
      setIsInviteCodeReadOnly(true);
    }
  }, []);

  const handleConnectWallet = async () => {
    try {
      const address = await connectToPhantomWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error("连接钱包失败:", error);
      alert(error instanceof Error ? error.message : "连接钱包失败");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      alert("请先连接钱包");
      return;
    }
    onSubmit(nickname, walletAddress, inviteCode, defaultAvatar);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="请输入昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        {!isInviteCodeReadOnly && (
          <input
            type="text"
            placeholder="请输入邀请码 (选填)"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        )}
        {isInviteCodeReadOnly && (
          <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700">
            邀请码: {inviteCode}
          </div>
        )}
        <button
          type="button"
          onClick={handleConnectWallet}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors duration-200`}
        >
          {walletAddress ? "已连接钱包" : "连接钱包"}
        </button>
        {walletAddress && (
          <div className="text-sm text-gray-500 break-all">
            钱包地址: {walletAddress}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !walletAddress || !nickname}
          className={`w-full py-2 rounded-lg text-white font-medium ${
            loading || !walletAddress || !nickname
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          } transition-colors duration-200`}
        >
          {loading ? "注册中..." : "完成注册"}
        </button>
      </form>
    </motion.div>
  );
};

export default RegisterForm;