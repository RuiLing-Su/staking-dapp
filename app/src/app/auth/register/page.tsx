"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Wallet } from "lucide-react";
import { connectToPhantomWallet } from "@/utils/wallet";
import { authApi } from "@/api/auth";
import { RegisterCredentials } from "@/types/authTypes";
import useAuth from "@/lib/hooks/useAuth";

export default function RegisterPage() {
  const [nickname, setNickname] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isInviteCodeReadOnly, setIsInviteCodeReadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();
  const defaultAvatar = "/human.png";

  // 从URL参数中获取邀请码（如果有）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setInviteCode(code);
      setIsInviteCodeReadOnly(true);
    }
  }, []);

  // 连接钱包
  const handleConnectWallet = async () => {
    try {
      const address = await connectToPhantomWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error("连接钱包失败:", error);
    }
  };

  // 注册操作，要求昵称和钱包地址都存在
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !nickname) return;
    setLoading(true);
    try {
      const credentials: RegisterCredentials = {
        nickname,
        wallet_address: walletAddress,
        invite_code: inviteCode,
        avatar: defaultAvatar,
      };
      await register(credentials);
      const valid = await authApi.validateToken();
      if (valid) {
        router.push("/");
      } else {
        alert("注册成功，但登录失败，请重试");
      }
    } catch (error) {
      console.error("注册失败:", error);
      alert("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">注册</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                昵称
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入昵称"
                  required
                />
              </div>
            </div>

            {!isInviteCodeReadOnly ? (
              <div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入邀请码（可选）"
                />
              </div>
            ) : (
              <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700">
                邀请码: {inviteCode}
              </div>
            )}

            <button
              type="button"
              onClick={handleConnectWallet}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center space-x-2
                      ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} transition-colors duration-200`}
            >
              <Wallet className="w-5 h-5" />
              <span>{walletAddress ? "已连接钱包" : "连接钱包"}</span>
            </button>
            {walletAddress && (
              <div className="text-sm text-gray-500 break-all px-4">
                钱包地址: {walletAddress}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !walletAddress || !nickname}
              className={`w-full py-2 rounded-lg text-white font-medium 
                      ${
                        loading || !walletAddress || !nickname
                          ? "bg-gray-400"
                          : "bg-green-600 hover:bg-green-700"
                      } transition-colors duration-200`}
            >
              {loading ? "注册中..." : "完成注册"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 