import React from 'react';

/**
 * 质押包组件
 * @param pkg
 * @param onExit
 * @constructor
 */
const StakingPackage = ({ pkg, onExit }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-gray-600">质押金额</span>
                <span className="font-medium">{pkg.amount} USDC</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">基础释放</span>
                <span className="font-medium">{pkg.baseRelease.toFixed(3)} SOL</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">加速释放</span>
                <span className="font-medium">{pkg.acceleratedRelease.toFixed(3)} SOL</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">当前收益</span>
                <span className="font-medium">{pkg.currentTotal.toFixed(3)} SOL</span>
            </div>
            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <div>
            <span className="text-xs font-semibold inline-block text-blue-600">
              进度: {((pkg.currentTotal / pkg.maxTotal) * 100).toFixed(1)}%
            </span>
                    </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                        style={{ width: `${(pkg.currentTotal / pkg.maxTotal) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                </div>
            </div>
            {pkg.currentTotal >= pkg.maxTotal && (
                <button
                    onClick={() => onExit(pkg.id)}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    出局领取
                </button>
            )}
        </div>
    </div>
);

export default StakingPackage;