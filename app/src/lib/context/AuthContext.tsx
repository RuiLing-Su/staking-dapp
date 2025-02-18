"use client";

import { createContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '@/types/authTypes';
import { authApi } from '@/api/auth';

// 管理用户认证状态
interface AuthContext {
    state: AuthState;
    login: (user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);

type AuthAction =
    | { type: 'LOGIN'; payload: User }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_AUTH_STATUS'; payload: boolean };

/**
 * 一个 reducer 函数，用于处理不同的认证操作
 * @param state 当前状态（AuthState类型）
 * @param action 包含 type 和 payload 的对象，表示要执行的操作
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state, // 对象浅拷贝
                user: action.payload,
                isAuthenticated: true,
                error: null,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                error: null,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };
        case 'SET_AUTH_STATUS':
            return {
                ...state,
                isAuthenticated: action.payload,
                loading: false,
            };
        default:
            return state;
    }
};

/**
 * 一个Context Provider，将认证状态和操作暴露给所有子组件
 * @param children
 * @constructor
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('access');
                    if (token) {
                        const isValid = await authApi.validateToken();
                        dispatch({ type: 'SET_AUTH_STATUS', payload: isValid });
                    } else {
                        dispatch({ type: 'SET_AUTH_STATUS', payload: false });
                    }
                }
            } catch (error) {
                console.error('认证检查失败:', error);
                dispatch({ type: 'SET_AUTH_STATUS', payload: false });
            }
        };

        checkAuth();
    }, []);

    const login = (user: User) => dispatch({ type: 'LOGIN', payload: user });
    const logout = () => {
        localStorage.removeItem('access');
        dispatch({ type: 'LOGOUT' });
    };
    const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
    const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });

    return (
        <AuthContext.Provider value={{ state, login, logout, setLoading, setError }}>
            {children}
        </AuthContext.Provider>
    );
};