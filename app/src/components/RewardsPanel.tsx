import React from 'react';

/**
 * 奖励信息面板组件
 * @param userInfo
 * @param loading
 * @param onClaim
 * @constructor
 */
const RewardsPanel = ({ userInfo, loading, onClaim }) => (
    <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">奖励信息</h3>
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">待领取SOL</span>
                    <span className="font-medium">{userInfo.pendingRewards.sol.toFixed(3)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">待领取MEME币</span>
                    <span className="font-medium">{userInfo.pendingRewards.meme.toFixed(3)} MEME</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">累计获得SOL</span>
                    <span className="font-medium">{userInfo.totalRewards.sol.toFixed(3)} SOL</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">累计获得MEME币</span>
                    <span className="font-medium">{userInfo.totalRewards.meme.toFixed(3)} MEME</span>
                </div>
            </div>
            <button
                onClick={onClaim}
                disabled={loading || (userInfo.pendingRewards.sol <= 0 && userInfo.pendingRewards.meme <= 0)}
                className={`w-full py-2 rounded-lg transition-colors duration-200 ${
                    loading || (userInfo.pendingRewards.sol <= 0 && userInfo.pendingRewards.meme <= 0)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                {loading ? '处理中...' : '领取奖励'}
            </button>
        </div>
    </div>
);

export default RewardsPanel;
