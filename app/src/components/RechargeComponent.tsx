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
        <div>
            <h2>SOL 充值操作</h2>
            <input
                type="number"
                placeholder="输入充值金额 (SOL)"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
            />
            <button onClick={handleRecharge} disabled={txLoading}>
                {txLoading ? "处理中..." : "发起 SOL 充值"}
            </button>
            {notification && <div>{notification.message}</div>}
        </div>
    );
};

export default RechargeComponent;