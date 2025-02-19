"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import './globals.css';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import Link from 'next/link';
import useAuth from '@/lib/hooks/useAuth';

// 动态导入 StakingDapp 组件
const StakingDapp = dynamic(
    () => import('../components/StakingDapp'),
    { 
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-screen">
                加载中...
            </div>
        )
    }
);

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [mounted, setMounted] = useState(false);

    // 只在客户端初始化钱包适配器
    useEffect(() => {
        if (typeof window !== 'undefined') {
            new PhantomWalletAdapter();
            setMounted(true);
        }
    }, []);

    // 如果尚未挂载或认证尚未完成，则只显示加载状态
    if (!mounted || !isAuthenticated) {
        return <div>加载中...</div>;
    }

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* 头部导航 */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={48}
                            height={48}
                            className="rounded-full hover:scale-105 transition-transform duration-300"
                        />
                        <h1 className="text-2xl font-bold text-gray-800">Solana Staking DApp</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <a
                            href="https://solana.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline transition"
                        >
                            Solana Explorer
                        </a>
                        <a
                            href="https://docs.solana.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline transition"
                        >
                            Documentation
                        </a>
                    </nav>
                    <nav className="flex items-center gap-4">
                        <Link 
                            href="/recharge" 
                            className="text-blue-600 hover:text-blue-700 hover:underline transition"
                        >
                            充值
                        </Link>
                        <Link 
                            href="/token" 
                            className="text-blue-600 hover:text-blue-700 hover:underline transition"
                        >
                            代币购买
                        </Link>
                    </nav>
                </header>

                {/* 直接渲染主页面内容，避免重复重定向 */}
                <StakingDapp />

                {/* 页脚 */}
                <footer className="mt-16 text-center text-gray-500 text-sm">
                    <p>© 2025 Solana Staking DApp. All rights reserved.</p>
                </footer>
            </div>
        </main>
    )
}
