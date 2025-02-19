"use client";

import React, { useEffect, useState } from 'react';
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import fs from 'fs';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

function loadWalletKey(filename: string): Keypair {
    const secretKey = JSON.parse(fs.readFileSync(filename, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
}

const DemoPage: React.FC = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

    useEffect(() => {
        const runDemo = async () => {
            const walletFile = 'id.json';
            const sender = loadWalletKey(walletFile);
            console.log("已加载现有账户:", sender.publicKey.toBase58());

            // 获取账户余额
            let balance = await connection.getBalance(sender.publicKey);
            setBalance(balance / LAMPORTS_PER_SOL);
            console.log("当前余额:", balance / LAMPORTS_PER_SOL, "SOL");

            // 请求空投
            const airdropSignature = await connection.requestAirdrop(
                sender.publicKey,
                5 * LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(airdropSignature, "confirmed");

            // 再次检查余额
            balance = await connection.getBalance(sender.publicKey);
            setBalance(balance / LAMPORTS_PER_SOL);
            console.log("空投后余额:", balance / LAMPORTS_PER_SOL, "SOL");

            // 创建收款账户
            const recipient = Keypair.generate();
            console.log("收款账户地址:", recipient.publicKey.toBase58());

            // 构建交易
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: sender.publicKey,
                    toPubkey: recipient.publicKey,
                    lamports: LAMPORTS_PER_SOL / 1000, // 0.001 SOL
                })
            );

            // 发送交易
            const signature = await connection.sendAndConfirmTransaction(transaction, [sender]);
            setTransactionSignature(signature);
            console.log("交易成功！交易签名:", signature);
        };

        runDemo().catch(console.error);
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Solana Demo Page</h1>
            <div>
                <h2>账户信息</h2>
                <p>当前余额: {balance !== null ? `${balance} SOL` : '加载中...'}</p>
                <p>最近交易签名: {transactionSignature || '无'}</p>
            </div>
        </div>
    );
};

export default DemoPage;
