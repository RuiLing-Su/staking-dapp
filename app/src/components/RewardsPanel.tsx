import React from 'react';

interface Reward {
  sol: number;
  meme: number;
}

interface RewardsUserInfo {
  pendingRewards?: Reward;
  total_earnings?: Reward;
  // 可根据需要添加其他字段
}

interface RewardsPanelProps {
  userInfo?: RewardsUserInfo;
  loading: boolean;
  onClaim: () => void;
}

/**
 * 奖励信息面板组件
 * @param userInfo 用户的信息对象
 * @param loading 是否加载中
 * @param onClaim 领取奖励的回调函数
 * @constructor
 */
const RewardsPanel: React.FC<RewardsPanelProps> = ({ userInfo, loading, onClaim }) => {
    // 添加默认值处理
    const pendingRewards: Reward = userInfo?.pendingRewards || { sol: 0, meme: 0 };
    const totalRewards: Reward = userInfo?.total_earnings || { sol: 0, meme: 0 };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">奖励信息</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">待领取SOL</span>
                        <span className="font-medium">{pendingRewards.sol.toFixed(3)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">待领取MEME币</span>
                        <span className="font-medium">{pendingRewards.meme.toFixed(3)} MEME</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">累计获得SOL</span>
                        <span className="font-medium">{totalRewards.sol.toFixed(3)} SOL</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">累计获得MEME币</span>
                        <span className="font-medium">{totalRewards.meme.toFixed(3)} MEME</span>
                    </div>
                </div>
                <button
                    onClick={onClaim}
                    disabled={loading || !userInfo || (pendingRewards.sol <= 0 && pendingRewards.meme <= 0)}
                    className={`w-full py-2 rounded-lg transition-colors duration-200 ${
                        loading || !userInfo || (pendingRewards.sol <= 0 && pendingRewards.meme <= 0)
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