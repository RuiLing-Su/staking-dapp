"use client";

import React, { useState } from "react";
import RegisterForm from "@/components/Auth/RegisterForm";
import UserInfoCard from "@/components/UserInfoCard";
import { useUser } from "@/lib/context/UserContext";
import { User } from "@/types/authTypes";

export default function AuthPage() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    nickname: string,
    walletAddress: string,
    inviteCode?: string,
    avatar?: string
  ) => {
    setLoading(true);
    // 模拟异步请求（实际项目中请调用后端接口进行注册）
    setTimeout(() => {
      // 模拟返回后端返回的用户信息数据
      const newUser: User = {
        nickname,
        wallet_address: walletAddress,
        total_principal: 1000, // 示例值
        withdrawable_earnings: 50,
        purchase_only_earnings: 10,
        total_earnings: 60,
        status_display: "正常",
        invite_code: inviteCode || "无",
        direct_invite_total: 5,
        indirect_invite_total: 3,
      };
      setUser(newUser);
      setLoading(false);
      alert("注册成功！");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {user ? (
        // 登录成功后渲染UserInfoCard，并填入返回的用户数据
        <UserInfoCard userInfo={user} />
      ) : (
        <>
          <h2 className="text-2xl font-bold">欢迎注册</h2>
          <RegisterForm onSubmit={handleRegister} loading={loading} />
        </>
      )}
    </div>
  );
}