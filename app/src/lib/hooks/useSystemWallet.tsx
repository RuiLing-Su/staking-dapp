import { useState, useEffect } from 'react';
import { getSystemWallet } from '@/api/wallet';

export const useSystemWallet = () => {
    const [systemWallet, setSystemWallet] = useState<any>(null);

    useEffect(() => {
        const fetchSystemWallet = async () => {
            try {
                const wallet = await getSystemWallet();
                setSystemWallet(wallet);
            } catch (error) {
                console.error("获取系统钱包失败:", error);
            }
        };

        fetchSystemWallet();
    }, []);

    return { systemWallet };
};