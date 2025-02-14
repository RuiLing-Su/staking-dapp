import axios from 'axios';
import { StakingPackage } from './types';

/**
 * StakingClient 类封装链下接口调用，
 * 包括获取当前用户所有质押包、购买质押包（调用 /purchase 接口）、以及退出质押包。
 * 注意：构造时传入的 token 或从 localStorage 中获取的 token 会附加到所有请求的 header 中。
 */
export class StakingClient {
  private api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // 后端 API 地址
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * 构造函数可接受传入的 token（优先使用传入的值）
   */
  constructor(token?: string | null) {
    const authToken = token || localStorage.getItem('access');
    if (authToken) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      console.warn('未获取到 token，部分接口可能无法调用');
    }
  }

  /**
   * 获取当前用户所有质押包
   */
  async getUserPackages(): Promise<StakingPackage[]> {
    const response = await this.api.get('/my-orders');
    return response.data;
  }

  /**
   * 用户购买质押包  
   * 请求体为 { "purchase_amount": 数字 }，例如：
   * { "purchase_amount": 200000000 }
   */
  async purchaseStakingPackage(purchase_amount: number): Promise<StakingPackage> {
    const response = await this.api.post('/purchase/', { purchase_amount });
    return response.data;
  }

  /**
   * 退出指定质押包  
   * 参数 packageId 为质押包 ID（字符串格式）
   */
  async exitPackage(packageId: string): Promise<void> {
    await this.api.post('/staking/exit-package', { packageId });
  }
}