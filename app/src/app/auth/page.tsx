"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/components/Auth/RegisterForm";
import { useUser } from "@/lib/context/UserContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { authApi } from "@/api/auth";

/**
 * AuthPage：登录/注册页面  
 * - 挂载时检查 localStorage 中的 token 是否存在且有效，有效时跳转到主页面  
 * - 注册成功后跳转到主页面  
 */
export default function AuthPage() {
  const { user, setUser } = useUser();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 页面挂载时检查 token 是否有效
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("access");
      if (token) {
        try {
          const valid = await authApi.validateToken();
          if (valid) {
            router.push("/");
          }
        } catch (error) {
          console.error("token 校验失败", error);
        }
      }
    };
    checkToken();
  }, [router]);

  // 注册（或登录）接口（登录和注册使用同一接口）
  const handleRegister = async (
    nickname: string,
    walletAddress: string,
    inviteCode?: string,
    avatar?: string
  ) => {
    setLoading(true);
    try {
      const response = await register({
        nickname,
        wallet_address: walletAddress,
        invite_code: inviteCode,
        avatar,
      });
      setUser(response.account);
      router.push("/");
    } catch (error) {
      console.error("注册失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 min-h-screen">
      {user ? (
        <div className="text-2xl font-bold">您已登录</div>
      ) : (
        <>
          <h2 className="text-2xl font-bold">欢迎登录/注册</h2>
          <RegisterForm onSubmit={handleRegister} loading={loading} onSwitchToLogin={() => {}} />
        </>
      )}
    </div>
  );
}