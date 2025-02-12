// 格式化数字为带千分位的字符串
export const formatNumber = (num: number | string): string => {
    return Number(num).toLocaleString('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    });
};

// 格式化钱包地址，显示前6位和后4位
export const formatWalletAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 格式化时间戳
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};