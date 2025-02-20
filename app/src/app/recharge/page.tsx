"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Clipboard, Check } from 'lucide-react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';

export default function RechargePage() {
  // 固定钱包地址
  const ourWalletAddress = "EgKGYMCqfSfm4zHHRv2qNcHFg5tQizSmKTkLK1shN83"; // 我方钱包（用于付款）
  const systemWalletAddress = "5gW28wXcW3Ff75xAaMVWu43U3ZopQECfMjccLAk2m9TT"; // 系统钱包（收款方）
  
  // SOL 充值相关状态
  const [copiedOur, setCopiedOur] = useState(false);
  const [copiedSystem, setCopiedSystem] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // 代币充值相关状态（SPL Token 操作）
  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenTxLoading, setTokenTxLoading] = useState(false);
  const [tokenNotification, setTokenNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // 固定代币 Mint 地址 (示例使用 Devnet 上的测试代币，代币采用 9 位小数)
  const tokenMintAddress = "3rQBaAAfLxUXddEhqa1dj2gKS53ZdcNKcwYP3Qz3gs7D";
  const tokenDecimals = 9;
  
  // 复制地址到剪贴板（两钱包均用此方法）
  const copyToClipboard = (text: string, type: "our" | "system") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "our") {
        setCopiedOur(true);
        setTimeout(() => setCopiedOur(false), 2000);
      } else {
        setCopiedSystem(true);
        setTimeout(() => setCopiedSystem(false), 2000);
      }
    }).catch(err => {
      console.error("复制失败", err);
    });
  };
  
  // 发起 SOL 充值（转账）操作
  const handleRecharge = async () => {
    if (!window.solana) {
      alert("请先安装 Phantom 钱包");
      return;
    }
  
    if (!rechargeAmount || isNaN(Number(rechargeAmount)) || Number(rechargeAmount) <= 0) {
      setNotification({ message: "请输入有效的充值金额", type: "error" });
      return;
    }
  
    try {
      setTxLoading(true);
      // 连接 Phantom 钱包
      await window.solana.connect();
      const fromPubkey = window.solana.publicKey;
      if (!fromPubkey) {
        setNotification({ message: "无法获取钱包地址", type: "error" });
        return;
      }
  
      // 使用 Solana Devnet（如有需要，可换成主网地址）
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
      // 构造转账交易：从用户付款钱包向系统钱包转账 SOL
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
  
      // 请求用户使用 Phantom 钱包签名交易
      const signed = await window.solana.signTransaction(transaction);
      // 发送交易到网络并确认
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
  
  // 发起 SPL Token（代币）充值操作
  const handleTokenRecharge = async () => {
    if (!window.solana) {
      alert("请先安装 Phantom 钱包");
      return;
    }
    if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
      setTokenNotification({ message: "请输入有效的代币充值数量", type: "error" });
      return;
    }
  
    try {
      setTokenTxLoading(true);
      await window.solana.connect();
      const fromPubkey = window.solana.publicKey;
      if (!fromPubkey) {
        setTokenNotification({ message: "无法获取钱包地址", type: "error" });
        return;
      }
  
      // 使用 Devnet 连接（可替换为其他网络）
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const tokenMint = new PublicKey(tokenMintAddress);
      const systemPubkey = new PublicKey(systemWalletAddress);
  
      // 准备手续费：由用户钱包支付
  
      // 计算发送方（用户）的关联代币账户地址（ATA）
      const senderTokenAddress = await splToken.getAssociatedTokenAddress(tokenMint, fromPubkey);
      const senderAccountInfo = await connection.getAccountInfo(senderTokenAddress);
      // 如果用户的关联代币账户不存在，则添加创建 ATA 指令
      const instructions = [];
      if (!senderAccountInfo) {
        instructions.push(
            splToken.createAssociatedTokenAccountInstruction(
                fromPubkey,         // payer（费用支付方）
                senderTokenAddress, // 关联账户地址
                fromPubkey,         // 账户所有者
                tokenMint
            )
        );
      }
  
      // 对于接收方（系统钱包）的关联代币账户
      const receiverTokenAddress = await splToken.getAssociatedTokenAddress(tokenMint, systemPubkey);
      const receiverAccountInfo = await connection.getAccountInfo(receiverTokenAddress);
      if (!receiverAccountInfo) {
        instructions.push(
            splToken.createAssociatedTokenAccountInstruction(
                fromPubkey,             // 由用户支付手续费创建
                receiverTokenAddress,   // 系统关联账户地址
                systemPubkey,           // 系统钱包为账户所有者
                tokenMint
            )
        );
      }
  
      // 添加代币转账的指令
      const amountNumber = Math.floor(parseFloat(tokenAmount) * Math.pow(10, tokenDecimals));
      const transferIx = splToken.createTransferInstruction(
          senderTokenAddress,    // 发送方 ATA
          receiverTokenAddress,  // 接收方 ATA
          fromPubkey,            // 发送者的钱包公钥
          amountNumber,          // 转账数量（注意换算为整数）
          [],
          splToken.TOKEN_PROGRAM_ID
      );
      instructions.push(transferIx);
  
      // 构造交易并添加指令
      const transaction = new Transaction();
      instructions.forEach(ix => transaction.add(ix));
      transaction.feePayer = fromPubkey;
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
  
      // 请求钱包签名并发送交易
      const signed = await window.solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid, "confirmed");
  
      setTokenNotification({ message: `代币充值成功，交易ID: ${txid}`, type: "success" });
    } catch (err: any) {
      console.error("代币充值失败:", err);
      setTokenNotification({ message: `代币充值失败: ${err?.message || err}`, type: "error" });
    } finally {
      setTokenTxLoading(false);
    }
  };
  
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-8">
        <h1 className="text-3xl font-bold">钱包充值页面</h1>
  
        {/* 固定钱包地址及复制功能 */}
        <div className="space-y-4">
          <div className="bg-white shadow rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">我方钱包 (负责付款)</h2>
            <p className="break-all text-gray-700 mb-2">{ourWalletAddress}</p>
            <button
                onClick={() => copyToClipboard(ourWalletAddress, "our")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              {copiedOur ? <Check size={16} /> : <Clipboard size={16} />}
              <span>{copiedOur ? "已复制" : "复制地址"}</span>
            </button>
          </div>
  
          <div className="bg-white shadow rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">系统钱包 (负责收款)</h2>
            <p className="break-all text-gray-700 mb-2">{systemWalletAddress}</p>
            <button
                onClick={() => copyToClipboard(systemWalletAddress, "system")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              {copiedSystem ? <Check size={16} /> : <Clipboard size={16} />}
              <span>{copiedSystem ? "已复制" : "复制地址"}</span>
            </button>
          </div>
        </div>
  
        {/* SOL 充值操作区域 */}
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4">
          <h2 className="text-xl font-semibold">SOL 充值操作</h2>
          <input
              type="number"
              placeholder="输入充值金额 (SOL)"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
              onClick={handleRecharge}
              disabled={txLoading}
              className={`w-full py-2 rounded-lg text-white ${txLoading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
          >
            {txLoading ? "处理中..." : "发起 SOL 充值"}
          </button>
          {notification && (
              <div className={`p-4 rounded-lg ${notification.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {notification.message}
              </div>
          )}
        </div>
  
        {/* SPL Token 充值操作区域 */}
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4">
          <h2 className="text-xl font-semibold">代币充值操作</h2>
          <p className="text-sm text-gray-600">
            代币 Mint 地址: {tokenMintAddress}
          </p>
          <input
              type="number"
              placeholder="输入代币充值数量"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
              onClick={handleTokenRecharge}
              disabled={tokenTxLoading}
              className={`w-full py-2 rounded-lg text-white ${tokenTxLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {tokenTxLoading ? "处理中..." : "发起代币充值"}
          </button>
          {tokenNotification && (
              <div className={`p-4 rounded-lg ${tokenNotification.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {tokenNotification.message}
              </div>
          )}
        </div>
  
        <Link href="/" className="mt-4 text-blue-600 hover:underline">
          返回主页
        </Link>
      </div>
  );
}