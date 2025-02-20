"use client";

import React, { useEffect } from 'react';
import useAuth from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

// 无需认证的路由白名单，新增 '/recharge' 以绕过登录注册
const PUBLIC_ROUTES = ['/auth', '/token', '/recharge'];

const AuthRouteGuard = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();



    return <>{children}</>;
};

export default AuthRouteGuard; 