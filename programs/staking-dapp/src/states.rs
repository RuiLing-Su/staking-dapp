use anchor_lang::prelude::*;

#[account]
pub struct StakingPool {
    pub admin: Pubkey,
    pub stake_mint: Pubkey,
    pub reward_mint: Pubkey,
    pub meme_mint: Pubkey,
    pub total_staked: u64,
    pub daily_rate: u64,
    pub max_multiplier: u64,
    pub min_stake: u64,
    pub direct_bonus: u64,
    pub indirect_bonus: u64,
    pub total_users: u32,
    pub global_reward_pool: u64,
}

#[account]
pub struct UserInfo {
    pub user: Pubkey,
    pub referrer: Pubkey,
    pub staked_amount: u64,
    pub rewards_claimed: u64,
    pub last_claim_time: i64,
    pub direct_referrals: u32,
    pub indirect_referrals: u32,
    pub level: u8,
    pub team_performance: u64,
    pub is_active: bool,
    pub packages_count: u64,
}

#[account]
pub struct StakingPackage {
    pub owner: Pubkey,
    pub amount: u64,
    pub base_release: u64,
    pub accelerated_release: u64,
    pub current_total: u64,
    pub max_total: u64,
    pub created_at: i64,
    pub is_active: bool,
}
