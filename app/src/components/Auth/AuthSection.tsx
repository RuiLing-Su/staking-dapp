import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useUser } from '@/lib/context/UserContext';
import { authApi } from '@/api/auth';

interface AuthSectionProps {
    onConnectWallet: () => Promise<void>;
    loading: boolean;
}

const AuthSection = ({ onConnectWallet, loading: externalLoading }: AuthSectionProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const { setUser } = useUser();

    const handleLogin = async (walletAddress: string) => {
        setLoading(true);
        try {
            const response = await authApi.login({ wallet_address: walletAddress });
            setUser(response.account);
            await onConnectWallet();
        } catch (error: any) {
            if (error?.response?.status === 404) {
                setIsLogin(false); // 用户不存在则切换到注册
            } else {
                console.error('登录失败:', error);
                throw error;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (nickname: string, walletAddress: string, inviteCode?: string) => {
        setLoading(true);
        try {
            const response = await authApi.register({
                nickname,
                wallet_address: walletAddress,
                invite_code: inviteCode
            });
            setUser(response.account);
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