import { createApiClient } from './baseApi';

export interface MemeToken {
    id: number;
    name: string;
    symbol: string;
    description: string;
    image: string;
    contract_address: string;
}

const api = createApiClient();

export const tokenApi = {
    getTokenList: async (): Promise<MemeToken[]> => {
        const response = await api.get('/tokens');
        return response.data;
    },

    getTokenDetail: async (id: number): Promise<MemeToken> => {
        const response = await api.get(`/tokens/${id}`);
        return response.data;
    },
}; 