import axios from 'axios';

export interface MemeToken {
    id: number;
    name: string;
    symbol: string;
    description: string;
    image: string;
    contract_address: string;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加请求拦截器，在客户端环境下添加 token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const tokenApi = {
    getTokenList: async (): Promise<MemeToken[]> => {
        const response = await api.get('/tokens');
        return response.data;
    },

    getTokenDetail: async (id: number): Promise<MemeToken> => {
        const response = await api.get(`/tokens/${id}`);
        return response.data;
    }
}; 