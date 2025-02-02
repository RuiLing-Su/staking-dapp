"use client";

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp } from 'lucide-react';

/**
 * 推荐用户数据（模拟）
 * @param user
 * @param level
 * @param isIndirect
 * @constructor
 */
const ReferralUser = ({ user, level, isIndirect }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Users className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{user.address.slice(0, 6)}...{user.address.slice(-4)}</p>
          <p className="text-sm text-gray-500">
            质押: {user.stakingAmount} USDC
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className={`px-2 py-1 rounded-full text-xs ${
          isIndirect ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {isIndirect ? '间推' : '直推'}
        </span>
        <span className="text-sm text-gray-500 mt-1">V{level}</span>
      </div>
    </div>
  </div>
);

// 推荐系统主组件
const ReferralSystem = () => {
  const [userReferrals, setUserReferrals] = useState({
    directReferrals: [],
    indirectReferrals: [],
    teamPerformance: 0,
  });

  // 模拟获取推荐数据
  const fetchReferralData = async () => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟直推用户数据
    const mockDirectReferrals = [
      {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        stakingAmount: 1000,
        joinTime: new Date('2024-01-01'),
        level: 1,
        performance: 1000,
      },
      {
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        stakingAmount: 2000,
        joinTime: new Date('2024-01-15'),
        level: 2,
        performance: 2000,
      }
    ];

    // 模拟间推用户数据
    const mockIndirectReferrals = [
      {
        address: '0x9876543210fedcba9876543210fedcba98765432',
        stakingAmount: 500,
        joinTime: new Date('2024-01-05'),
        level: 1,
        performance: 500,
        referredBy: mockDirectReferrals[0].address,
      },
      {
        address: '0xfedcba9876543210fedcba9876543210fedcba98',
        stakingAmount: 1500,
        joinTime: new Date('2024-01-20'),
        level: 1,
        performance: 1500,
        referredBy: mockDirectReferrals[1].address,
      }
    ];

    // 计算团队业绩
    const totalPerformance = [
      ...mockDirectReferrals,
      ...mockIndirectReferrals
    ].reduce((sum, user) => sum + user.performance, 0);

    setUserReferrals({
      directReferrals: mockDirectReferrals,
      indirectReferrals: mockIndirectReferrals,
      teamPerformance: totalPerformance,
    });
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
      [...userReferrals.directReferrals, ...userReferrals.indirectReferrals]
        .reduce((sum, user) => sum + user.stakingAmount, 0) /
      (userReferrals.directReferrals.length + userReferrals.indirectReferrals.length) || 0
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