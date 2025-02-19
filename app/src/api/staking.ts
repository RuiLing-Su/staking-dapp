

import { StakingPackage, WithdrawRecord } from '@/types/stakingTypes';
import { createApiClient } from './baseApi';

const api = createApiClient();

/**
 * stakingApi 类封装链下接口调用，
 * 包括获取当前用户所有质押包、购买质押包（调用 /purchase 接口）、以及退出质押包。
 * 注意：构造时传入的 token 或从 localStorage 中获取的 token 会附加到所有请求的 header 中。
 */
export const stakingApi = {
  /**
   * 获取当前用户所有质押包
   */
  getUserPackages: async (): Promise<StakingPackage[]> => {
    const response = await api.get('/my-orders');
    return response.data;
  },

  /**
   * 用户购买质押包  
   * 请求体为 { "purchase_amount": 数字 }，例如：
   * { "purchase_amount": 200000000 }
   */
  purchaseStakingPackage: async (purchase_amount: number): Promise<StakingPackage> => {
    const response = await api.post('/purchase/', { purchase_amount });
    return response.data;
  },

  /**
   * 退出指定质押包  
   * 参数 packageId 为质押包 ID（字符串格式）
   */
  exitPackage: async (packageId: string): Promise<void> => {
    await api.post('/staking/exit-package', { packageId });
  },

  // 获取提现记录
  getWithdrawRecords: async (): Promise<WithdrawRecord[]> => {
    const response = await api.get('/withdraw-record');
    return response.data;
  },

  // 提现请求
  requestWithdraw: async (amount: number): Promise<void> => {
    await api.post('/withdraw', { amount });
  },
};