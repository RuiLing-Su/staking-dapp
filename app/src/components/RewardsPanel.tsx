import React, { useState, useEffect } from 'react';
import { WithdrawRecord } from '@/types/stakingTypes';
import { stakingApi } from '@/api/staking';
import { authApi } from '@/api/auth';
import { set } from '@project-serum/anchor/dist/cjs/utils/features';

interface RewardsPanelProps {
  loading: boolean;
  onClaim: (amount: number) => Promise<void>;
}

/**
 * 奖励信息面板组件
 * @param loading 是否加载中
 * @param onClaim 领取奖励的回调函数
 * @constructor
 */
const RewardsPanel: React.FC<RewardsPanelProps> = ({ loading, onClaim }) => {
  const [records, setRecords] = useState<WithdrawRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [withdrawnEarnings, setWithdrawnEarnings] = useState(0);
  useEffect(() => {
    const fetchRecords = async () => {
      setLoadingRecords(true);
      try {
        const data = await stakingApi.getWithdrawRecords();
        setRecords(data);
      } catch (error) {
        console.error('获取提现记录失败:', error);
      } finally {
        setLoadingRecords(false);
      }
    };

    const fetchUserEarnings = async () => {
      try {
        const res = await authApi.getCurrentUser();
        setTotalEarnings(Number(res.account.total_earnings));
        setWithdrawnEarnings(Number(res.account.withdrawn_earnings));
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchRecords();
    fetchUserEarnings();
  }, []);

  // 计算待领取收益（所有状态为pending的记录actual_amount总和）
  const pendingRewards = totalEarnings - withdrawnEarnings;

  // 使用从用户信息中获取的总收益
  const totalRewards = totalEarnings;

  const handleClaim = async () => {
    if (window.confirm(`确认提现 ${pendingRewards.toFixed(3)} USDC?`)) {
      await onClaim(pendingRewards);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">奖励信息</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">待领取收益</span>
            <span className="font-medium">{pendingRewards.toFixed(3)} USDC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">累计收益</span>
            <span className="font-medium">{totalRewards.toFixed(3)} USDC</span>
          </div>
        </div>
        <button
          onClick={handleClaim}
          disabled={loading || loadingRecords || pendingRewards <= 0}
          className={`w-full py-2 rounded-lg transition-colors duration-200 ${
            loading || loadingRecords || pendingRewards <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? '处理中...' : '领取奖励'}
        </button>
      </div>
    </div>
  );
};

export default RewardsPanel;