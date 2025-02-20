"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { tokenApi, MemeToken } from '@/api/token';
import Notification from '@/components/Notification';
import { AnimatePresence } from 'framer-motion';
import { ArrowRightCircle } from 'lucide-react';

interface TokenListProps {
    onTokenClick: (tokenId: number) => void;
}

const TokenList: React.FC<TokenListProps> = ({ onTokenClick }) => {
    const [memeTokens, setMemeTokens] = useState<MemeToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchTokens = async () => {
            setLoading(true);
            try {
                const data = await tokenApi.getTokenList();
                setMemeTokens(data);
            } catch (err) {
                console.error('获取代币列表失败', err);
                setNotification({ type: 'error', message: '获取代币列表失败' });
                
                // 如果失败且重试次数小于3次，则5秒后重试
                if (retryCount < 3) {
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        fetchTokens(); // 重新调用
                    }, 5000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
    }, [retryCount]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
    }

    // 如果没有代币数据，则不渲染代币列表
    if (memeTokens.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">代币列表</h3>
            <ul className="space-y-4">
                {memeTokens.map((token) => (
                    <li key={token.id} className="flex items-center space-x-4 p-4 bg-white shadow rounded-lg">
                        <img src={token.image} alt={token.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <Link href={`https://www.gmgn.cc/kline/sol/${token.contract_address}`} className="text-lg font-medium text-blue-600 hover:underline">
                                {token.name}
                            </Link>
                            <p className="text-gray-500">{token.symbol}</p>
                        </div>
                        <button
                            onClick={() => onTokenClick(token.id)}
                            className="ml-auto text-blue-500 hover:text-blue-600"
                        >
                            <ArrowRightCircle size={24} />
                        </button>
                    </li>
                ))}
            </ul>


            {/* 通知 */}
            <AnimatePresence>
                {notification ? (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                ) : null}
            </AnimatePresence>
        </div>
    );
};

export default TokenList;