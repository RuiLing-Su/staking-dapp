import React from 'react';

/**
 * 等级指南组件
 * @param userInfo
 * @constructor
 */
const LevelGuide = ({ userInfo }) => {
    const LEVEL_REQUIREMENTS = {
        1: { directReferrals: 10, v1Count: 0, bonus: 5 },
        2: { directReferrals: 0, v1Count: 3, bonus: 10 },
        3: { directReferrals: 0, v2Count: 3, bonus: 15 },
        4: { directReferrals: 0, v3Count: 3, bonus: 20 },
        5: { directReferrals: 0, v4Count: 3, bonus: 25, globalBonus: 1 }
    };
    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-6">等级说明</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
                {Object.entries(LEVEL_REQUIREMENTS).map(([level, requirements]) => (
                    <div
                        key={level}
                        className={`min-w-[280px] p-6 rounded-xl border transition-all ${
                            Number(level) === userInfo.level
                                ? 'border-blue-300 bg-blue-50 shadow-lg scale-[1.02]'
                                : 'border-gray-200 bg-white hover:shadow-md'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-blue-600">V{level}</h4>
                                <p className="text-sm text-gray-500 mt-1">等级要求</p>
                            </div>
                            {Number(level) === userInfo.level && (
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                当前等级
              </span>
                            )}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">直推要求:</span>
                                <span>{requirements.directReferrals}人</span>
                            </div>
                            {level !== '1' && (
                                <div className="flex justify-between">
                                    <span className="text-pink-600">下级要求:</span>
                                    <span>V{Number(level)-1} × {requirements[`v${Number(level)-1}Count`]}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-blue-600">团队加速:</span>
                                <span className="font-medium">{requirements.bonus}%</span>
                            </div>
                            {requirements.globalBonus && (
                                <div className="flex justify-between">
                                    <span className="text-green-600">全球分红:</span>
                                    <span className="font-medium">{requirements.globalBonus}%</span>
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