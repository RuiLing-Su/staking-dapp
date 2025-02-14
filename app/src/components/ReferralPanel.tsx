import React, { useState } from 'react';
import { Share2 } from "lucide-react";

/**
 * 推荐面板组件
 * @param {Object} props
 * @param {Object} props.user - 登录成功后返回的用户信息对象，需包含 invite_code 属性
 */
const ReferralPanel = ({ user }: { user: { invite_code: string } | null }) => {
    const [copied, setCopied] = useState(false);
    console.log(user?.invite_code);

    if (!user || !user.invite_code) {
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

    // 使用返回的 invite_code 字段生成推荐链接
    const referralLink = `https://stakingdapp.com/?code=${user.invite_code}`;

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