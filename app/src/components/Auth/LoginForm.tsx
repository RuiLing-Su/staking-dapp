import React from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { connectToPhantomWallet } from "@/utils/wallet";
import { LoginCredentials } from "@/types/authTypes";

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  onSwitchToRegister: () => void;
  loading?: boolean;
}

const LoginForm = ({ onSubmit, onSwitchToRegister, loading }: LoginFormProps) => {
  // 连接钱包后调用登录接口
  const handleConnectWallet = async () => {
    try {
      const walletAddress = await connectToPhantomWallet();
      onSubmit({ wallet_address: walletAddress });
    } catch (error) {
      console.error("连接钱包失败:", error);
      throw error;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="space-y-4">
        <button
          onClick={handleConnectWallet}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center space-x-2 ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors duration-200`}
        >
          <Wallet className="w-5 h-5" />
          <span>{loading ? "连接中..." : "连接钱包登录"}</span>
        </button>

        <p className="text-center text-sm text-gray-600">
          还没有账号？
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 ml-1"
          >
            立即注册
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;