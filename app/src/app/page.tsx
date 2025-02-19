"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import './globals.css';
import Link from 'next/link';
import useAuth from '@/lib/hooks/useAuth';
import { useWallet } from '@/lib/hooks/useWallet';

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
    const { connected, walletAddress, connect, disconnect, handleAccountChanged } = useWallet();
    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // 只在客户端初始化钱包适配器
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMounted(true);
            // // 尝试自动连接钱包
            // connect(true).catch((error) => {
            //     console.error("自动连接钱包失败:", error);
            // });
        }
    }, [connect]);

    const handleConnect = async () => {
        try {
            if (!connected) {
                await connect();
            }
            setMenuOpen(true); 
        } catch (error) {
            console.error("连接钱包失败:", error);
            alert("连接钱包失败，请检查是否安装了 Phantom 钱包");
        }
    };

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
                        <h1 className="text-2xl font-bold text-gray-800">SolEdge</h1>
                    </div>
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
                        <div className="relative">
                            <button
                                onClick={handleConnect}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-full"
                            >
                                {connected ? (
                                    <>
                                        <Image 
                                            src="/phantomIcon.png"
                                            alt="phantomIcon"
                                            width={24} 
                                            height={24} 
                                        />
                                        <span>{walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '连接钱包'}</span>
                                    </>
                                ) : (
                                    '连接钱包'
                                )}
                            </button>
                            
                            {connected && menuOpen && (
                                <div className="absolute right-0 mt-2 w-39 bg-black text-white rounded-md shadow-lg py-1">
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(walletAddress || '');
                                        alert("钱包地址已复制");
                                        setMenuOpen(false);
                                    }} className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left">
                                        Copy address
                                    </button>
                                    <button onClick={async () => {
                                        await handleAccountChanged(null);
                                        setMenuOpen(false);
                                    }} className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left">
                                        Change wallet
                                    </button>
                                    <button onClick={async () => {
                                        await disconnect();
                                        setMenuOpen(false);
                                    }} className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left">
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </div>
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
