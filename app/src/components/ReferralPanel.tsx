import React, { useState } from 'react';
import { Share2 } from "lucide-react";

/**
 * 推荐面板组件
 * @param {Object} props
 * @param {Object} props.userInfo - 用户信息对象
 */
const ReferralPanel = ({ userInfo }) => {
    const [copied, setCopied] = useState(false);

    // 如果 userInfo 为空，显示加载状态
    if (!userInfo) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <div className="flex items-center space-x-2 mb-4">
                    <Share2 className="text-gray-400" />
                    <h3 className="text-lg font-semibold">推荐链接</h3>
                </div>
                <div className="text-gray-500">正在加载用户信息...</div>
            </div>
        );
    }

    const referralLink = `https://solana.com/ref/${userInfo.referralCode}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="flex items-center space-x-2 mb-4">
                <Share2 className="text-blue-600" />
                <h3 className="text-lg font-semibold">推荐链接</h3>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 px-4 py-2 rounded-lg border bg-white focus:outline-none"
                />
                <button
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        copied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                >
                    {copied ? '已复制' : '复制'}
                </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">直推加速</p>
                    <p className="text-lg font-semibold text-blue-600">30%</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">间推加速</p>
                    <p className="text-lg font-semibold text-blue-600">10%</p>
                </div>
            </div>
        </div>
    );
};

export default ReferralPanel;