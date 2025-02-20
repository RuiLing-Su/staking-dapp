import React, { useState } from 'react';
import * as splToken from '@solana/spl-token';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

interface TokenComponentProps {
    userWalletAddress: string;
    tokenContractAddress: string;
}

const TokenComponent: React.FC<TokenComponentProps> = ({ userWalletAddress, tokenContractAddress }) => {
    const [tokenAmount, setTokenAmount] = useState("");
    const [txLoading, setTxLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleTokenTransfer = async () => {
        if (!((window as any) as any).solana) {
            alert("请先安装 Phantom 钱包");
            return;
        }
        if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
            setNotification({ message: "请输入有效的代币数量", type: "error" });
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
            const tokenMint = new PublicKey(tokenContractAddress);

            const senderTokenAddress = await splToken.getAssociatedTokenAddress(tokenMint, fromPubkey);
            const receiverTokenAddress = await splToken.getAssociatedTokenAddress(tokenMint, new PublicKey(userWalletAddress));

            const amountNumber = Math.floor(parseFloat(tokenAmount) * Math.pow(10, 9)); // 假设代币有9位小数
            const transferIx = splToken.createTransferInstruction(
                senderTokenAddress,
                receiverTokenAddress,
                fromPubkey,
                amountNumber,
                [],
                splToken.TOKEN_PROGRAM_ID
            );

            const transaction = new Transaction().add(transferIx);
            transaction.feePayer = fromPubkey;
            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;

            const signed = await (window as any).solana.signTransaction(transaction);
            const txid = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(txid, "confirmed");

            setNotification({ message: `代币转账成功，交易ID: ${txid}`, type: "success" });
        } catch (err: any) {
            console.error("代币转账失败:", err);
            setNotification({ message: `代币转账失败: ${err?.message || err}`, type: "error" });
        } finally {
            setTxLoading(false);
        }
    };

    return (
<div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto mt-8">
    <h2 className="text-2xl font-semibold mb-4 text-center">代币交易操作</h2>
    <input
        type="number"
        placeholder="输入代币数量"
        value={tokenAmount}
        onChange={(e) => setTokenAmount(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
        onClick={handleTokenTransfer}
        disabled={txLoading}
        className={`w-full py-2 rounded-lg text-white ${txLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} transition duration-200`}
    >
        {txLoading ? "处理中..." : "发起代币交易"}
    </button>
    {notification && (
        <div className={`mt-4 p-2 rounded-lg ${notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {notification.message}
        </div>
    )}
</div>
    );
};

export default TokenComponent;