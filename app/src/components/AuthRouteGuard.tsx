"use client";

import React, { useEffect } from 'react';
import useAuth from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

// 无需认证的路由白名单
const PUBLIC_ROUTES = ['/auth', '/token'];

const AuthRouteGuard = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 检查当前路由是否在白名单中
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
        
        if (!isAuthenticated && !loading && !isPublicRoute) {
            router.push('/auth');
        }
    }, [isAuthenticated, loading, router, pathname]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
    }

    return <>{children}</>;
};

export default AuthRouteGuard; 