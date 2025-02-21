"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import './globals.css';
import WalletContextProvider from '../lib/context/WalletContextProvider';
import { AppBar } from '@/components/AppBar';

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
                            <WalletContextProvider>
                                <AppBar />
                            </WalletContextProvider>
                        </nav>
                    </header>

                    {/* 直接渲染主页面内容，避免重复重定向 */}
                    <StakingDapp />

                    {/* 页脚 */}
                    <footer className="mt-16 text-center text-gray-500 text-sm">
                        <p>© 2025 SolEdge. All rights reserved.</p>
                    </footer>
                </div>
        </main>
    )
}
