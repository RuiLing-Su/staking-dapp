import { createApiClient } from './baseApi';

const api = createApiClient();

export const getSystemWallet = async () => {
    const response = await api.get('/wallets');
    return response.data;
};
