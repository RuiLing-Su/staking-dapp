export interface WithdrawRecord {
  id: number;
  withdrawal_amount: string;
  fee_amount: string;
  actual_amount: string;
  withdrawal_status: string;
  auditor: string;
  audit_time: string;
  receiver_wallet_address: string;
}

export interface StakingPackage {
  id: number;
  product_name: string;
  purchase_amount: string;
  total_released: string;
  max_release_amount: string;
  progress_percent: number;
  status: number;
  created_at: string;
}