"use client";
import { useContext } from 'react';
import { AuthContext } from '@/lib/context/AuthContext';
import { authApi } from '@/api/auth';
import { LoginCredentials, RegisterCredentials } from '@/types/authTypes';

const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { state, login, logout, setLoading, setError } = context;

    const handleRegister = async (credentials: RegisterCredentials) => {
        try {
            setLoading(true);
            const response = await authApi.register(credentials);
            login(response.account);
            return response.account;
        } catch (error) {
            setError(error instanceof Error ? error.message : '注册失败');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const validateAuth = async () => {
        try {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('access');
                if (token) {
                    return await authApi.validateToken();
                }
            }
            return false;
        } catch (error) {
            console.error('认证检查失败:', error);
            return false;
        }
    };

    return {
        ...state,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        login,
        logout,
        register: handleRegister,
        validateAuth,
    };
};

export default useAuth;