import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthSectionProps {
    onConnectWallet: () => Promise<void>;
    loading: boolean;
}

const AuthSection = ({ onConnectWallet, loading: externalLoading }: AuthSectionProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleLogin = async (walletAddress: string) => {
        setLoading(true);
        try {
            await login({ wallet_address: walletAddress });
            await onConnectWallet();
        } catch (error: any) {
            if (error?.response?.status === 404) {
                setIsLogin(false); // 用户不存在，切换到注册页面
            } else {
                throw error;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (nickname: string, walletAddress: string, inviteCode?: string) => {
        setLoading(true);
        try {
            await register({
                nickname,
                wallet_address: walletAddress,
                invite_code: inviteCode
            });
            await onConnectWallet();
        } catch (error) {
            console.error('注册失败:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center py-12 px-4">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    欢迎来到StakingDapp
                </h2>
                <p className="text-gray-600">
                    {isLogin ? '请连接钱包登录' : '您尚未完成注册'}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {isLogin ? (
                    <LoginForm
                        key="login"
                        onSubmit={handleLogin}
                        onSwitchToRegister={() => setIsLogin(false)}
                        loading={loading || externalLoading}
                    />
                ) : (
                    <RegisterForm
                        key="register"
                        onSubmit={handleRegister}
                        onSwitchToLogin={() => setIsLogin(true)}
                        loading={loading || externalLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthSection;