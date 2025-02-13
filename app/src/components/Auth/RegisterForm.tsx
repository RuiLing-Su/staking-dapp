import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {User, Wallet} from 'lucide-react';
import {connectToPhantomWallet} from '@/utils/wallet';

interface RegisterFormProps {
    onSubmit: (nickname: string, walletAddress: string, inviteCode?: string, avatar?: string) => void;
    loading?: boolean;
}

const RegisterForm = ({ onSubmit, loading }: RegisterFormProps) => {
    const [nickname, setNickname] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isInviteCodeReadOnly, setIsInviteCodeReadOnly] = useState(false);
    const defaultAvatar = '/human.png';

    // 如果 URL 中存在推荐人参数，注册时传入
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            setInviteCode(code);  // 设置邀请码
            setIsInviteCodeReadOnly(true);  // 禁用邀请码输入框
        }
    }, []);

    // 连接Phantom钱包
    const handleConnectWallet = async () => {
        try {
            const address = await connectToPhantomWallet();
            setWalletAddress(address);
        } catch (error) {
            console.error('连接钱包失败:', error);
            throw error;
        }
    };

    // 表单的提交处理函数
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!walletAddress) {
            return;
        }
        onSubmit(nickname, walletAddress, inviteCode, defaultAvatar);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mx-auto"
        >
            <h2 className="text-2xl font-bold text-center mb-6">登录/注册</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
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

                { !isInviteCodeReadOnly && (
                    <div>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="请输入邀请码"
                        />
                    </div>
                )}

                { isInviteCodeReadOnly && (
                    <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700">
                        邀请码: {inviteCode}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center space-x-2
                        ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                        transition-colors duration-200`}
                >
                    <Wallet className="w-5 h-5" />
                    <span>{walletAddress ? '已连接钱包' : '连接钱包'}</span>
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
                        ${loading || !walletAddress || !nickname ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
                        transition-colors duration-200`}
                >
                    {loading ? '登录中...' : '完成登录'}
                </button>
            </form>
        </motion.div>
    );
};

export default RegisterForm;