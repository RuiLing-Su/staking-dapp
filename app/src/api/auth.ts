import { LoginCredentials, RegisterCredentials, LoginResponse } from '@/types/authTypes';
import { createApiClient } from './baseApi';

const api = createApiClient();

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post('/login', credentials);
        if (response.data.tokens.access && typeof window !== 'undefined') {
            localStorage.setItem('access', response.data.tokens.access);
        }
        return response.data;
    },

    register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
        const response = await api.post('/register', credentials);
        if (response.data.tokens.access && typeof window !== 'undefined') {
            localStorage.setItem('access', response.data.tokens.access);
        }
        return response.data;
    },

    logout: async (): Promise<void> => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access');
        }
    },

    getCurrentUser: async (): Promise<LoginResponse> => {
        const response = await api.get('/userinfo');
        return response.data;
    },

    validateToken: async (): Promise<boolean> => {
        try {
            const response = await api.get('/validate-token');
            return response.data.message === "Token 有效";
        } catch (error) {
            console.error('Token 校验错误:', error);
            return false;
        }
    },

    getLevelUpgradeInfo: async (): Promise<any[]> => {
        const response = await api.get('/levelinfo');
        return response.data;
    },
    getTeamEarnings: async (): Promise<any[]> => {
        const response = await api.get('/team-earnings');
        return response.data;
    },
    getinvitations: async (): Promise<any> => {
        const response = await api.get('/invitations');
        return response.data;
    }
};