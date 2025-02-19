"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { tokenApi, MemeToken } from '@/api/token';
import Notification from '@/components/Notification';
import { AnimatePresence } from 'framer-motion';

export default function TokenListPage() {
  const [memeTokens, setMemeTokens] = useState<MemeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchTokens = async () => {
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
            setLoading(true);
          }, 5000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined' && loading) {
    fetchTokens();
    }
  }, [loading, retryCount]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-lg w-full px-4 py-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">代币列表</h1>
        <ul className="space-y-4">
          {memeTokens.map((token) => (
            <li key={token.id} className="flex items-center space-x-4 p-4 bg-white shadow rounded-lg">
              <img src={token.image} alt={token.name} className="w-12 h-12 rounded-full" />
    <div>
                <Link href={`/token/${token.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                  {token.name}
                </Link>
                <p className="text-gray-500">{token.symbol}</p>
              </div>
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
        
        {/* 新增：返回主页链接 */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            返回主页
          </Link>
        </div>
      </div>
    </div>
  );
} 