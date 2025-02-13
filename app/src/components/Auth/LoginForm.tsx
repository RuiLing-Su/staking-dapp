import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { connectToPhantomWallet } from '@/utils/wallet';
import { User } from '@/types'

interface LoginFormProps {
    onSubmit: (walletAddress: string) => void;
    onSwitchToRegister: () => void;
    loading?: boolean;
    userInfo?: User;
}

const LoginForm = ({ onSubmit, onSwitchToRegister, loading, userInfo }: LoginFormProps) => {
    // 连接钱包
    const handleConnectWallet = async () => {
        try {
            const walletAddress = await connectToPhantomWallet();
            onSubmit(walletAddress);
        } catch (error) {
            console.error('连接钱包失败:', error);
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

            {userInfo ? (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h3 className="font-medium mb-4">当前用户信息</h3>
                    <div className="space-y-2 text-sm">
                        <p>昵称：{userInfo.nickname}</p>
                        <p>头像：{userInfo.avatar}</p>
                        <p>钱包地址：{userInfo.wallet_address}</p>
                        <p>总本金：{userInfo.total_principal || '0'} USDC</p>
                        <p>可提取收益：{userInfo.withdrawable_earnings || '0'} USDC</p>
                        <p>仅限购币收益：{userInfo.purchase_only_earnings} USDC</p>
                        <p>邀请码：{userInfo.invite_code}</p>
                        <p>总收益：{userInfo.total_earnings || '0'} USDC</p>
                        <p>状态：{userInfo.status_display || '正常'}</p>
                    </div>
                </div>
            ) : null}

            <div className="space-y-4">
                <button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center space-x-2
                        ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                        transition-colors duration-200`}
                >
                    <Wallet className="w-5 h-5" />
                    <span>{loading ? '连接中...' : '连接钱包登录'}</span>
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