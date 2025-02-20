import React, { useState } from 'react';

interface WithdrawComponentProps {
    userWalletAddress: string;
    systemWalletAddress: string;
}

const WithdrawComponent: React.FC<WithdrawComponentProps> = ({ userWalletAddress, systemWalletAddress }) => {
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [txLoading, setTxLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleWithdraw = async () => {
        // 提现逻辑实现
        // 这里可以调用相应的 API 进行提现操作
    };

    return (
<div className="bg-white shadow-md rounded-lg p-10 max-w-lg mx-auto mt-8">
    <h2 className="text-2xl font-semibold mb-4 text-center">提现操作</h2>
    <input
        type="number"
        placeholder="输入提现金额"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
        onClick={handleWithdraw}
        disabled={txLoading}
        className={`w-full py-2 rounded-lg text-white ${txLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition duration-200`}
    >
        {txLoading ? "处理中..." : "发起提现"}
    </button>
    {notification && (
        <div className={`mt-4 p-2 rounded-lg ${notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {notification.message}
        </div>
    )}
</div>
    );
};

export default WithdrawComponent;
