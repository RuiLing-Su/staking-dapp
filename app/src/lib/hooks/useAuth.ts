import { useContext } from 'react';
import { AuthContext } from '@/lib/context/AuthContext.tsx';
import { authApi } from '../../api/auth';
import { LoginCredentials, RegisterCredentials } from '@/types/authTypes';

export const useAuth = () => {
    // 使用 React 的 useContext 钩子来获取 AuthContext 中存储的状态和方法。
    // AuthContext 是在应用中提供认证相关状态的上下文。
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { state, login, logout, setLoading, setError } = context;
    //
    // const handleLogin = async (credentials: LoginCredentials) => {
    //     try {
    //         setLoading(true);
    //         const user = await authApi.login(credentials);
    //         login(user);
    //         return user;
    //     } catch (error) {
    //         setError(error instanceof Error ? error.message : '登录失败');
    //         throw error;
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleRegister = async (credentials: RegisterCredentials) => {
        try {
            setLoading(true);
            const user = await authApi.register(credentials);
            login(user);
            return user;
        } catch (error) {
            setError(error instanceof Error ? error.message : '注册失败');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await authApi.logout();
            logout();
        } catch (error) {
            setError(error instanceof Error ? error.message : '退出失败');
        } finally {
            setLoading(false);
        }
    };

    return {
        ...state,
        // login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
    };
};