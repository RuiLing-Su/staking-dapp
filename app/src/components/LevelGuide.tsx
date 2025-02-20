import React from 'react';

interface LevelUpgradeInfo {
    from_level: string;
    to_level: string;
    required_count: number;
    required_referral_level: string;
    team_acceleration: string;
    shareholder_dividend: string;
}

interface LevelGuideProps {
    userInfo: {
        level: string;
    } | null;
    levels: LevelUpgradeInfo[];
}

/**
 * 升级指南组件
 * @param {Object} props
 * @param {Object} props.userInfo - 用户信息对象
 * @param {Array} props.levels - 等级升级信息数组
 */
const LevelGuide: React.FC<LevelGuideProps> = ({ userInfo, levels }) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-6">等级说明</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
                {levels.map((level, index) => (
                    <div
                        key={index}
                        className={`min-w-[280px] p-6 rounded-xl border transition-all ${
                            userInfo?.level === level.from_level
                                ? 'border-blue-300 bg-blue-50 shadow-lg scale-[1.02]'
                                : 'border-gray-200 bg-white hover:shadow-md'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-blue-600">
                                    {level.from_level} → {level.to_level}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">等级要求</p>
                            </div>
                            {userInfo?.level === level.from_level && (
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    当前等级
                                </span>
                            )}
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">直推要求:</span>
                                <span>{level.required_count}人</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-pink-600">下级要求:</span>
                                <span>{level.required_referral_level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-600">团队加速:</span>
                                <span className="font-medium">{level.team_acceleration}%</span>
                            </div>
                            {level.shareholder_dividend && level.shareholder_dividend !== "0.00" && (
                                <div className="flex justify-between">
                                    <span className="text-green-600">全球分红:</span>
                                    <span className="font-medium">{level.shareholder_dividend}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LevelGuide;