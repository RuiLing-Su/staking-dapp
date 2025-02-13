import React, { useState } from 'react';
import { useUser } from '@/lib/context/UserContext';
import UserInfoCard from '@/components/UserInfoCard';
import RegisterForm from './RegisterForm';
import { authApi } from '@/api/auth';

const AuthSection = ({ onConnectWallet, loading: externalLoading }) => {
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useUser();

    const handleSubmit = async (nickname, walletAddress, inviteCode, avatar) => {
        setLoading(true);
        try {
            const response = await authApi.register({
                nickname,
                wallet_address: walletAddress,
                invite_code: inviteCode,
                avatar,
            });
            setUser(response.account);
        } catch (error) {
            console.error('注册/登录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProceed = async () => {
        if (user) {
            await onConnectWallet(user);
            setUser(null);
        }
    };

    return (
        <div className="text-center py-12 px-4">
            {user ? (
                <div>
                    <UserInfoCard userInfo={user} />
                    <button
                        onClick={handleProceed}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                        进入主页面
                    </button>
                </div>
            ) : (
                <div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            欢迎来到StakingDapp
                        </h2>
                        <p className="text-gray-600">
                            您尚未完成注册/登录
                        </p>
                    </div>
                    <RegisterForm
                        onSubmit={handleSubmit}
                        loading={loading || externalLoading}
                    />
                </div>
            )}
        </div>
    );
};

export default AuthSection;