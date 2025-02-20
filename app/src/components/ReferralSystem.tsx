"use client";

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp } from 'lucide-react';
import { authApi } from '@/api/auth'; // 确保引入正确的 API

interface ReferralUserProps {
  user: {
    address: string;
    stakingAmount: number;
  };
  level: number;
  isIndirect: boolean;
}

interface Referral {
  address: string;
  stakingAmount: number;
  joinTime: Date;
  level: number;
  performance: number;
  referredBy?: string;
}

interface UserReferrals {
  directReferrals: Referral[];
  indirectReferrals: Referral[];
  teamPerformance: number;
}

const ReferralUser: React.FC<ReferralUserProps> = ({ user, level, isIndirect }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Users className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{user.address.slice(0, 6)}...{user.address.slice(-4)}</p>
          <p className="text-sm text-gray-500">质押: {user.stakingAmount} USDC</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`px-2 py-1 rounded-full text-xs ${isIndirect ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
          {isIndirect ? '间推' : '直推'}
        </span>
        <span className="text-sm text-gray-500 mt-1">V{level}</span>
      </div>
    </div>
  </div>
);

// 推荐系统主组件
const ReferralSystem = () => {
  const [userReferrals, setUserReferrals] = useState<UserReferrals>({
    directReferrals: [],
    indirectReferrals: [],
    teamPerformance: 0,
  });

  // 从接口获取推荐数据
  const fetchReferralData = async () => {
    try {
      const response = await authApi.getInvitations();
      
      const directReferrals = response["direct invites"].map(invite => ({
        address: invite.inviteeNickname, // 根据接口数据适配
        stakingAmount: 0, // 或者根据需要设置
        joinTime: new Date(invite.invitationTime),
        level: 1, // 根据需要设置
        performance: 0, // 根据需要设置
      }));

      const indirectReferrals = response["indirect invites"].map(invite => ({
        address: invite.inviteeNickname, // 根据接口数据适配
        stakingAmount: 0, // 或者根据需要设置
        joinTime: new Date(invite.invitationTime),
        level: 1, // 根据需要设置
        performance: 0, // 根据需要设置
        referredBy: invite.inviterNickname, // 引导者昵称
      }));

      // 计算团队业绩
      const totalPerformance = directReferrals.reduce((sum, user) => sum + user.performance, 0) +
                               indirectReferrals.reduce((sum, user) => sum + user.performance, 0);

      setUserReferrals({
        directReferrals,
        indirectReferrals,
        teamPerformance: totalPerformance,
      });
    } catch (error) {
      console.error('获取推荐数据失败：', error);
      // 处理错误
    }
  };

  // 首次加载时获取数据
  useEffect(() => {
    fetchReferralData();
  }, []);

  // 计算推荐统计数据
  const stats = {
    totalDirects: userReferrals.directReferrals.length,
    totalIndirects: userReferrals.indirectReferrals.length,
    avgStaking: Math.round(
      (
        [...userReferrals.directReferrals, ...userReferrals.indirectReferrals]
          .reduce((sum, user) => sum + user.stakingAmount, 0) || 0
      ) / (userReferrals.directReferrals.length + userReferrals.indirectReferrals.length || 1) // 防止除以零
    ),
  };

  return (
    <div className="space-y-6">
      {/* 推荐统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>总推荐人数</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats.totalDirects + stats.totalIndirects}人
          </p>
          <p className="text-sm opacity-75">
            直推: {stats.totalDirects} | 间推: {stats.totalIndirects}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>团队业绩</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {userReferrals.teamPerformance.toLocaleString()} USDC
          </p>
          <p className="text-sm opacity-75">
            平均质押: {stats.avgStaking.toLocaleString()} USDC
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>推荐收益</span>
          </div>
          <p className="text-2xl font-bold mt-2">
            {(userReferrals.teamPerformance * 0.003).toFixed(2)} SOL
          </p>
          <p className="text-sm opacity-75">
            直推30% | 间推10%加速
          </p>
        </div>
      </div>

      {/* 推荐列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 直推列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <span>直推用户</span>
            <span className="text-sm text-gray-500">({userReferrals.directReferrals.length})</span>
          </h3>
          <div className="space-y-3">
            {userReferrals.directReferrals.map((user) => (
              <ReferralUser
                key={user.address}
                user={user}
                level={user.level}
                isIndirect={false}
              />
            ))}
          </div>
        </div>

        {/* 间推列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <span>间推用户</span>
            <span className="text-sm text-gray-500">({userReferrals.indirectReferrals.length})</span>
          </h3>
          <div className="space-y-3">
            {userReferrals.indirectReferrals.map((user) => (
              <ReferralUser
                key={user.address}
                user={user}
                level={user.level}
                isIndirect={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;