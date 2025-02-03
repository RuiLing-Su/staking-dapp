"use client";

import React from 'react';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { WalletProvider } from "@/lib/useWallet";
import './globals.css';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider } from '@solana/wallet-adapter-react';

import { CONFIG } from '@/lib/config';

const wallets = [new PhantomWalletAdapter()];
// 动态导入 StakingDapp 组件
const StakingDapp = dynamic(
    () => import('../components/StakingDapp'),
    { ssr: false });

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
                </header>

                <ConnectionProvider endpoint={CONFIG.RPC_ENDPOINT}>
                    <WalletProvider>
                        <StakingDapp />
                    </WalletProvider>
                </ConnectionProvider>

                {/* 页脚 */}
                <footer className="mt-16 text-center text-gray-500 text-sm">
                    <p>© 2025 Solana Staking DApp. All rights reserved.</p>
                </footer>
            </div>
        </main>
    )
}
