"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StakingPackage } from '../types';
import { StakingClient } from '../staking-client';
// 改为从用户上下文中获取用户信息，从而判断是否已经登录
import { useUser } from '@/lib/context/UserContext';

export const useStaking = () => {
  const { user } = useUser();
  // 登录后从 localStorage 获取最新 token（确保登录时已写入 token）
  const token = user ? localStorage.getItem('access') : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [packages, setPackages] = useState<StakingPackage[]>([]);

  // 缓存 StakingClient 实例，依赖于 token 的变化
  const stakingClient = useMemo(() => new StakingClient(token), [token]);

  // 获取当前用户所有质押包
  const fetchPackages = useCallback(async () => {
    if (!token) return; // 未登录时不执行请求
    setLoading(true);
    setError(null);
    try {
      const fetchedPackages = await stakingClient.getUserPackages();
      setPackages(fetchedPackages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("获取质押包失败"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stakingClient, token]);

  // 当 token 存在时加载质押包数据
  useEffect(() => {
    if (token) {
      fetchPackages();
    }
  }, [fetchPackages, token]);

  /**
   * 购买质押包（调用 /purchase 接口），购买成功后刷新数据
   * @param purchase_amount 质押金额（数字类型，比如 200000000）
   */
  const createStake = useCallback(async (purchase_amount: number) => {
    if (!token) throw new Error("未登录或 token 不存在");
    setLoading(true);
    setError(null);
    try {
      const newPackage = await stakingClient.purchaseStakingPackage(purchase_amount);
      await fetchPackages();
      return newPackage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("购买质押包失败"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stakingClient, fetchPackages, token]);

  /**
   * 退出质押包（调用 /staking/exit-package 接口），退出成功后刷新数据
   * @param packageId 质押包 ID
   */
  const exitPackage = useCallback(async (packageId: string) => {
    if (!token) throw new Error("未登录或 token 不存在");
    setLoading(true);
    setError(null);
    try {
      await stakingClient.exitPackage(packageId);
      await fetchPackages();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("退出质押包失败"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stakingClient, fetchPackages, token]);

  return {
    loading,
    error,
    packages,
    createStake,
    exitPackage,
    refreshPackages: fetchPackages,
  };
};