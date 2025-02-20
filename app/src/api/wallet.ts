import axios from 'axios';

export const getSystemWallet = async () => {
    const response = await axios.get('/wallets');
    return response.data;
};
