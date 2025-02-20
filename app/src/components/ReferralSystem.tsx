"use client";

import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { authApi } from '@/api/auth'; // 确保引入 authApi

interface ReferralUserProps {
  user: {
    nickname: string;
    invitationTime: Date;
  };
  isIndirect: boolean;
}

interface Referral {
  nickname: string;
  invitationTime: Date;
}

interface UserReferrals {
  directReferrals: Referral[];
  indirectReferrals: Referral[];
}

/**
 * 推荐用户展示组件
 */
const ReferralUser: React.FC<ReferralUserProps> = ({ user, isIndirect }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Users className="text-blue-600 w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{user.nickname}</p>
          <p className="text-sm text-gray-500">
            邀请时间: {user.invitationTime.toLocaleString()}
          </p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs ${isIndirect ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
        {isIndirect ? '间推' : '直推'}
      </span>
    </div>
  </div>
);

// 推荐系统主组件
const ReferralSystem = () => {
  const [userReferrals, setUserReferrals] = useState<UserReferrals>({
    directReferrals: [],
    indirectReferrals: [],
  });

  // 获取推荐数据
  const fetchReferralData = async () => {
    try {
      const response = await authApi.getinvitations();
      
      const directReferrals = response["direct_invites"].map(invite => ({
        nickname: invite["invitee_nickname"],
        invitationTime: new Date(invite["invitation_time"]),
      }));

      const indirectReferrals = response["indirect_invites"].map(invite => ({
        nickname: invite["invitee_nickname"],
        invitationTime: new Date(invite["invitation_time"]),
      }));

      setUserReferrals({
        directReferrals,
        indirectReferrals,
      });
    } catch (error) {
      console.error("获取推荐数据失败：", error);
    }
  };

  // 首次加载时获取数据
  useEffect(() => {
    fetchReferralData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 推荐列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 直推列表 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <span>直推用户</span>
            <span className="text-sm text-gray-500">({userReferrals.directReferrals.length})</span>
          </h3>
          <div className="space-y-3">
            {userReferrals.directReferrals.map((user, index) => (
              <ReferralUser
                key={index} // 使用 index 作为 key，或考虑使用唯一的地址
                user={user}
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
            {userReferrals.indirectReferrals.map((user, index) => (
              <ReferralUser
                key={index} // 使用 index 作为 key，或考虑使用唯一的地址
                user={user}
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