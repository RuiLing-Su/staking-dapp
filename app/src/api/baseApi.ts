import axios, { AxiosInstance } from 'axios';

export const createApiClient = (): AxiosInstance => {
    const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // 统一的请求拦截器
    api.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    });

    return api;
}; 