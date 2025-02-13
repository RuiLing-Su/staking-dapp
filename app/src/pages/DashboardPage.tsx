import React from 'react';
import StatsCard from '@/components/StatsCard';

const DashboardPage = () => {
    // 这里可以放置仪表盘相关的逻辑和组件
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">仪表盘</h1>
            {/* 这里可以放置仪表盘的统计卡片等 */}
            <StatsCard icon={<div />} label="示例" value="123" />
        </div>
    );
};

export default DashboardPage; 