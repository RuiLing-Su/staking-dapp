"use client";

import { useState, useEffect, useCallback } from 'react';
import { StakingPackage } from '@/types/stakingTypes';
import { stakingApi } from '@/api/staking';
import { useUser } from '@/lib/context/UserContext';

export const useStaking = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [packages, setPackages] = useState<StakingPackage[]>([]);

  // 获取当前用户所有质押包
  const fetchPackages = useCallback(async () => {
    if (!user) return; // 未登录时不执行请求
    setLoading(true);
    setError(null);
    try {
      const fetchedPackages = await stakingApi.getUserPackages();
      setPackages(fetchedPackages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("获取质押包失败"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 当用户登录状态改变时加载质押包数据
  useEffect(() => {
    if (user) {
      fetchPackages();
    }
  }, [fetchPackages, user]);

  /**
   * 购买质押包
   * @param purchase_amount 质押金额
   */
  const createStake = useCallback(async (purchase_amount: number) => {
    if (!user) throw new Error("未登录");
    setLoading(true);
    setError(null);
    try {
      const newPackage = await stakingApi.purchaseStakingPackage(purchase_amount);
      await fetchPackages();
      return newPackage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("购买质押包失败"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchPackages]);

  /**
   * 退出质押包
   * @param packageId 质押包 ID
   */
  const exitPackage = useCallback(async (packageId: string) => {
    if (!user) throw new Error("未登录");
    setLoading(true);
    setError(null);
    try {
      await stakingApi.exitPackage(packageId);
      await fetchPackages();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("退出质押包失败"));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchPackages]);

  return {
    loading,
    error,
    packages,
    createStake,
    exitPackage,
    refreshPackages: fetchPackages,
  };
};