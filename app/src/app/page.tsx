"use client";

import React from 'react';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import './globals.css';
import { WalletProvider } from '@/lib/hooks/useWallet';
import { UserProvider } from '@/lib/context/UserContext';
import { redirect } from 'next/navigation';

// 动态导入 StakingDapp 组件
const StakingDapp = dynamic(
    () => import('../components/StakingDapp'),
    { ssr: false });

export default function Home() {
    // 根路由重定向到认证页面（仅保留一个登录/注册入口）
    redirect('/auth');
}
