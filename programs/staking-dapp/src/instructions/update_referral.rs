use crate::instructions::update_user_level;
use crate::states::{StakingPool, UserInfo};
use anchor_lang::prelude::*;

/**
 * 更新推荐人奖励
 */
#[derive(Accounts)]
pub struct UpdateReferralRewards<'info> {
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user_info: Account<'info, UserInfo>,
    pub user: Signer<'info>,
}

pub fn update_referral_rewards(
    ctx: Context<UpdateReferralRewards>,
    new_referrals: u32,
    referral_stake_amount: u64,
) -> Result<()> {
    let user_info = &mut ctx.accounts.user_info;
    let pool = &mut ctx.accounts.pool;

    // 更新直推人数和团队业绩
    user_info.direct_referrals = user_info
        .direct_referrals
        .checked_add(new_referrals)
        .unwrap();
    user_info.team_performance = user_info
        .team_performance
        .checked_add(referral_stake_amount)
        .unwrap();

    // 检查分级晋升
    update_user_level(user_info)?;

    // 更新全局统计
    pool.total_users = pool.total_users.saturating_add(new_referrals);
    pool.global_reward_pool = pool
        .global_reward_pool
        .checked_add(referral_stake_amount)
        .unwrap();

    Ok(())
}
