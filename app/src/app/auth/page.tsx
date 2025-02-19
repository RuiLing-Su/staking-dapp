"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/context/UserContext";
import useAuth from "@/lib/hooks/useAuth";
import { authApi } from "@/api/auth";
import { RegisterCredentials } from "@/types/authTypes";
import { motion } from "framer-motion";
import { User, Wallet } from "lucide-react";
import { connectToPhantomWallet } from "@/utils/wallet";

/**
 * AuthPage：登录/注册页面  
 * - 页面挂载时检查 localStorage 中的 token 是否存在且有效，若有效直接跳转到主页面  
 * - 注册成功后先校验 token，再跳转到主页面  
 */
export default function AuthPage() {
  const { user } = useUser();
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [avatar, setAvatar] = useState("/human.png");

  // 页面挂载时检测token是否有效
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("access");
      if (token) {
        try {
          const valid = await authApi.validateToken();
          if (valid) {
            router.push("/");
          }
        } catch (error) {
          console.error("token 校验失败", error);
        }
      }
    };
    checkToken();
  }, [router]);

  // 登录/注册接口处理函数
  const handleRegister = async (nickname: string, walletAddress: string, inviteCode: string, avatar: string) => {
    try {
      setLoading(true);
      const credentials: RegisterCredentials = {
        nickname,
        wallet_address: walletAddress,
        invite_code: inviteCode,
        avatar,
      };
      await register(credentials);
      
      // 注册成功后校验 token 有效性
      const isValid = await authApi.validateToken();
      if (isValid) {
        router.push("/");
      } else {
        alert("注册成功，但登录失败，请重新登录");
      }
    } catch (error) {
      console.error("注册失败:", error);
      alert("注册失败,请重试");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  // 内置注册表单组件
  const InternalRegisterForm: React.FC<{
    onSubmit: (nickname: string, walletAddress: string, inviteCode: string, avatar: string) => void;
    loading: boolean;
  }> = ({ onSubmit, loading }) => {
    const [nickname, setNickname] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [isInviteCodeReadOnly, setIsInviteCodeReadOnly] = useState(false);

    // 解析 URL 中的邀请码
    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        setInviteCode(code);
        setIsInviteCodeReadOnly(true);
      }
    }, []);

    // 连接 Phantom 钱包
    const handleConnectWallet = async () => {
      try {
        const address = await connectToPhantomWallet();
        setWalletAddress(address);
      } catch (error) {
        console.error("连接钱包失败:", error);
      }
    };

    // 表单提交
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!walletAddress) {
        return;
      }
      onSubmit(nickname, walletAddress, inviteCode, avatar);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md mx-auto"
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
                placeholder="请输入邀请码"
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
            onClick={() => {
              if (walletAddress) {
                handleLogin(); // 调用登录逻辑
              }
            }}
            disabled={loading || !walletAddress || !nickname}
            className={`w-full py-2 rounded-lg text-white font-medium
                      ${
                        loading || !walletAddress || !nickname
                          ? "bg-gray-400"
                          : "bg-green-600 hover:bg-green-700"
                      } transition-colors duration-200`}
          >
            {loading ? "登录中..." : "登录"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)} // 打开弹框
            className="w-full py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            注册
          </button>
        </form>
      </motion.div>
    );
  };
  const handleLogin = async () => {
    try {
      setLoading(true);
      // 注册成功后校验 token 有效性
      const isValid = await authApi.validateToken();
      if (isValid) {
        router.push("/");
      } else {
        alert("注册成功，但登录失败，请重新登录");
      }
    } catch (error) {
      console.error("注册失败:", error);
      alert("注册失败,请重试");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };
  // 注册对话框组件
  const RegisterModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [nickname, setNickname] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [avatar, setAvatar] = useState("/human.png"); // 默认头像

    // 连接钱包处理函数
    const handleConnectWallet = async () => {
      try {
        const address = await connectToPhantomWallet();
        setWalletAddress(address); // 更新钱包地址状态
      } catch (error) {
        console.error("连接钱包失败:", error);
      }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleRegister(nickname, walletAddress, inviteCode, avatar); // 传递所有参数
    };

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={(e) => {
          // 点击弹出框外部时关闭对话框
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold mb-4">注册</h2>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                昵称
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入昵称"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                头像
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="请输入头像 URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邀请码
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="请输入邀请码"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                钱包地址
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="请输入钱包地址"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleConnectWallet}
              className={`w-full py-2 rounded-lg text-white font-medium
                        ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} transition-colors duration-200`}
              disabled={loading}
            >
              <span>{walletAddress ? "已连接钱包" : "连接钱包"}</span>
            </button>
            <div className="flex justify-end">
              <button
                type="button"
                className="mr-2 text-gray-500"
                onClick={onClose}
              >
                取消
              </button>
              <button
                type="submit"
                className={`py-2 px-4 rounded-lg text-white font-medium ${
                  loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={loading}
              >
                {loading ? "注册中..." : "注册"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {user ? (
          <div className="text-center text-2xl font-bold">您已登录</div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              欢迎登录/注册
            </h2>
            <InternalRegisterForm onSubmit={handleRegister} loading={loading} />
          </>
        )}
      </div>
      {isModalOpen && <RegisterModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}