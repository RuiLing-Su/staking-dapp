import React from 'react';

/**
 * 统计卡片组件
 * @param icon
 * @param label
 * @param value
 * @param tooltip
 * @constructor
 */
const StatsCard = ({ icon, label, value, tooltip }) => (
    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-2">
            {icon}
            <span className="text-gray-600 group relative">
        {label}
                {tooltip && (
                    <span className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            {tooltip}
          </span>
                )}
      </span>
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
);

export default StatsCard;