import axios from 'axios';
import { LoginCredentials, RegisterCredentials, LoginResponse } from '@/types';

// 创建axios实例
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/login', credentials);
        // 保存token到localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // 设置后续请求的认证header
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
        const response = await api.post('/register', credentials);
        // 如果注册后直接返回token，也保存它
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        await api.post('/logout');
    },

    // 获取当前用户信息
    getCurrentUser: async (): Promise<LoginResponse> => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        const response = await api.get('/me');
        return response.data;
    },
};