import React from 'react';

interface StakingPackageProps {
  pkg: {
    id: number | string;
    product_name: string;
    purchase_amount: string;
    total_released: string;
    max_release_amount: string;
    progress_percent: number | string;
    status: number;
    created_at: string;
  };
  onExit: (packageId: number | string) => void;
}

/**
 * 质押包组件
 * @param pkg
 * @param onExit
 * @constructor
 */
const StakingPackage = ({ pkg, onExit }: StakingPackageProps) => {
  // 转换数值，确保 toFixed 调用安全
  const purchaseAmount = pkg.purchase_amount; // 质押金额（USDC），保持字符串格式即可
  const totalReleased = Number(pkg.total_released);
  const maxReleaseAmount = Number(pkg.max_release_amount);
  const progressPercent = Number(pkg.progress_percent);

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">质押金额</span>
          <span className="font-medium">{purchaseAmount} USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">已释放</span>
          <span className="font-medium">{totalReleased.toFixed(3)} SOL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">目标释放</span>
          <span className="font-medium">{maxReleaseAmount.toFixed(3)} SOL</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">进度</span>
          <span className="font-medium">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${progressPercent}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            ></div>
          </div>
        </div>
        {progressPercent >= 100 && (
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
};

export default StakingPackage;