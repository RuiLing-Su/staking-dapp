import axios from 'axios';
import { LoginCredentials, RegisterCredentials, LoginResponse } from '@/types/authTypes';

// 创建axios实例
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 从 localStorage 中获取 token 并设置默认 header
const token = localStorage.getItem('access');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/login', credentials);
        // 保存 access token 到 localStorage
        if (response.data.tokens.access) {
            localStorage.setItem('access', response.data.tokens.access);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;
        }
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
        const response = await api.post('/register', credentials);
        // 保存 access token 到 localStorage
        if (response.data.tokens.access) {
            localStorage.setItem('access', response.data.tokens.access);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;
        }
        return response.data;
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('access');
        delete api.defaults.headers.common['Authorization'];
        await api.post('/logout');
    },

    // 获取当前用户信息
    getCurrentUser: async (): Promise<LoginResponse> => {
        const response = await api.get('/me');
        return response.data;
    },

    // 修改后的：验证 token 是否有效
    validateToken: async (): Promise<boolean> => {
        try {
            const response = await api.get('/validate-token');
            // 根据返回的 message 字段判断 token 是否有效
            return response.data.message === "Token 有效";
        } catch (error) {
            console.error('Token 校验错误:', error);
            return false;
        }
    },

    // 新增：获取等级升级接口信息，返回数据格式如下：
    // {
    //   "from_level": "V1",
    //   "to_level": "V2",
    //   "required_count": 3,
    //   "required_referral_level": "V1",
    //   "team_acceleration": "10.00",
    //   "shareholder_dividend": "0.00"
    // }
    getLevelUpgradeInfo: async (): Promise<any> => {
        const response = await api.get('/levelinfo');
        return response.data;
    },
};

// 在请求失败时刷新 token 的逻辑
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
                const response = await api.post('/refresh', { token: refreshToken });
                if (response.data.tokens.access) {
                    localStorage.setItem('access', response.data.tokens.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.tokens.access}`;
                    return api(originalRequest);
                }
            }
        }
        return Promise.reject(error);
    }
);