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
        <div>
            <h2>提现操作</h2>
            <input
                type="number"
                placeholder="输入提现金额"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button onClick={handleWithdraw} disabled={txLoading}>
                {txLoading ? "处理中..." : "发起提现"}
            </button>
            {notification && <div>{notification.message}</div>}
        </div>
    );
};

export default WithdrawComponent;
