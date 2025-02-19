"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { connectToPhantomWallet } from "@/utils/wallet";
import { authApi } from "@/api/auth";
import useAuth from "@/lib/hooks/useAuth";

export default function LoginPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // context中定义的登录方法

  // 连接钱包
  const handleConnectWallet = async () => {
    try {
      const address = await connectToPhantomWallet();
      setWalletAddress(address);
    } catch (error) {
      console.error("连接钱包失败:", error);
    }
  };

  // 登录操作：仅传入钱包地址，昵称传空字符串
  const handleLogin = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const credentials = { wallet_address: walletAddress, nickname: "" };
      const response = await authApi.login(credentials);
      login(response.account);
      router.push("/");
    } catch (error: any) {
      console.error("登录失败:", error);
      alert("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">登录</h2>
        <button
          type="button"
          onClick={handleConnectWallet}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center space-x-2 
                      ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} transition-colors duration-200`}
        >
          <span>{walletAddress ? "已连接钱包" : "连接钱包"}</span>
        </button>
        {walletAddress && (
          <div className="text-sm text-gray-500 break-all mt-4">
            钱包地址: {walletAddress}
          </div>
        )}
        {walletAddress && (
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium mt-6 ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } transition-colors duration-200`}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        )}
      </div>
    </div>
  );
} 