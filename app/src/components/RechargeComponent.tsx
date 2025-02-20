import React, { useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface RechargeComponentProps {
    userWalletAddress: string;
    systemWalletAddress: string;
}

const RechargeComponent: React.FC<RechargeComponentProps> = ({ userWalletAddress, systemWalletAddress }) => {
    const [rechargeAmount, setRechargeAmount] = useState("");
    const [txLoading, setTxLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleRecharge = async () => {
        if (!((window as any).solana)) {
            alert("请先安装 Phantom 钱包");
            return;
        }

        if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
            setNotification({ message: "请输入有效的充值金额", type: "error" });
            return;
        }

        try {
            setTxLoading(true);
            await (window as any).solana.connect();
            const fromPubkey = (window as any).solana.publicKey;
            if (!fromPubkey) {
                setNotification({ message: "无法获取钱包地址", type: "error" });
                return;
            }

            const connection = new Connection("https://api.devnet.solana.com", "confirmed");

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: fromPubkey,
                    toPubkey: new PublicKey(systemWalletAddress),
                    lamports: Math.floor(parseFloat(rechargeAmount) * LAMPORTS_PER_SOL),
                })
            );

            transaction.feePayer = fromPubkey;
            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;

            const signed = await (window as any).solana.signTransaction(transaction);
            const txid = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(txid, "confirmed");

            setNotification({ message: `充值成功，交易ID: ${txid}`, type: "success" });
        } catch (err: any) {
            console.error("充值失败:", err);
            setNotification({ message: `充值失败: ${err?.message || err}`, type: "error" });
        } finally {
            setTxLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4">
    <h2 className="text-2xl font-semibold mb-4 text-center">SOL 充值操作</h2>
    <input
        type="number"
        placeholder="输入充值金额 (SOL)"
        value={rechargeAmount}
        onChange={(e) => setRechargeAmount(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
        onClick={handleRecharge}
        disabled={txLoading}
        className={`w-full py-2 rounded-lg text-white ${txLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition duration-200`}
    >
        {txLoading ? "处理中..." : "发起 SOL 充值"}
    </button>
    {notification && (
        <div className={`mt-4 p-2 rounded-lg ${notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {notification.message}
        </div>
    )}
</div>
    );
};

export default RechargeComponent;