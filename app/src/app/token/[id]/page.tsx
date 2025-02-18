"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { Connection, PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/navigation';
import { tokenApi, MemeToken } from '@/api/token';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// GMGN API endpoints
const GMGN_API = {
  getSwapRoute: 'https://gmgn.ai/defi/router/v1/sol/tx/get_swap_route',  // 获取交易路由
  submitSwap: 'https://gmgn.ai/defi/router/v1/sol/tx/submit_signed_transaction',  // 提交交易
  getSwapStatus: 'https://gmgn.ai/defi/router/v1/sol/tx/get_transaction_status' // 查询交易状态
};

// SOL token address
const SOL_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112';

export default function TokenDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [memeToken, setMemeToken] = useState<MemeToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const data = await tokenApi.getTokenDetail(Number(params.id));
        setMemeToken(data);
      } catch (err) {
        setError('获取代币详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchToken();
  }, [params.id]);

  const getSwapRoute = async (inAmount: string) => {
    if (!memeToken?.contract_address || !user?.wallet_address) return null;

    const params = new URLSearchParams({
      token_in_address: SOL_TOKEN_ADDRESS,        // 输入代币地址
      token_out_address: memeToken.contract_address,   // 输出代币地址
      in_amount: inAmount,                        // 输入代币数量
      from_address: user.wallet_address,          // 用户钱包地址
      slippage: '0.5'                             // 滑点容忍度
    });

    const response = await fetch(`${GMGN_API.getSwapRoute}?${params}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || '获取交易路由失败');
    }

    return data.data;
  };

  const submitSwap = async (route: any) => {
    if (!memeToken?.contract_address || !user?.wallet_address) return null;

    const response = await fetch(GMGN_API.submitSwap, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_address: user.wallet_address,        // 用户钱包地址
        to_address: user.wallet_address,          // 接收代币地址
        token_in_address: SOL_TOKEN_ADDRESS,      // 输入代币地址
        token_out_address: memeToken.contract_address, // 输出代币地址
        in_amount: amount,                        // 输入代币数量
        slippage: '0.5',                          // 滑点容忍度
        route
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || '提交交易失败');
    }

    return data.data;
  };

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSwapLoading(true);
    setSwapError(null);
    setSwapSuccess(false);

    try {
      // 1. Get swap route
      const route = await getSwapRoute(amount);
      if (!route) throw new Error('无法获取交易路由');

      // 2. Submit swap
      const swapResult = await submitSwap(route);
      if (!swapResult) throw new Error('提交交易失败');

      // 3. Check swap status
      const statusParams = new URLSearchParams({
        hash: swapResult.txHash
      });

      const statusResponse = await fetch(`${GMGN_API.getSwapStatus}?${statusParams}`);
      const statusData = await statusResponse.json();

      if (statusData.success) {
        setSwapSuccess(true);
      } else {
        throw new Error('交易失败');
      }
    } catch (err) {
      setSwapError(err instanceof Error ? err.message : '交易失败');
    } finally {
      setSwapLoading(false);
    }
  };

  const memeDetail = () => {
    const { contract_address } = memeToken || {};
    if (contract_address) {
      window.open(`https://www.gmgn.cc/kline/sol/${contract_address}`, '_blank');
    } else {
      console.error('代币地址未定义');
    }
  };

  if (loading) {
    return (
        <div className="p-4 flex justify-center items-center">
          加载中...
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-4 text-red-500 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>错误: {error}</span>
        </div>
    );
  }

  if (!memeToken) {
    return (
        <div className="p-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>代币不存在</span>
        </div>
    );
  }

  return (
      <div className="max-w-2xl mx-auto my-4 p-4 border rounded-lg shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{memeToken.name}</h1>
          <div className="text-gray-600 mb-1">符号: {memeToken.symbol}</div>
          <div className="text-gray-600">描述: {memeToken.description}</div>
        </div>

        {/* Buy Form */}
        <form onSubmit={handleBuy} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              购买数量 (SOL)
            </label>
            <input
                type="number"
                step="0.000000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={swapLoading}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {swapError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
                <AlertCircle size={16} />
                <span>{swapError}</span>
              </div>
          )}

          {swapSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600">
                交易成功!
              </div>
          )}

          <div className="flex gap-4">
            <button
                type="submit"
                disabled={swapLoading || !amount}
                className={`flex-1 p-2 rounded text-white ${
                    swapLoading || !amount
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              {swapLoading ? '处理中...' : '购买'}
            </button>

            <button
                type="button"
                onClick={memeDetail}
                className="flex-1 p-2 border rounded hover:bg-gray-50"
            >
              代币详情
            </button>
          </div>
        </form>

        {/* Back Button */}
        <button
            onClick={() => router.back()}
            className="mt-6 w-full p-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 rounded"
        >
          <ArrowLeft size={16} />
          <span>返回列表</span>
        </button>
      </div>
  );
}