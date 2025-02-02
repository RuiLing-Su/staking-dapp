use crate::instructions::{calculate_level_bonus, calculate_referral_bonus};
use crate::states::*;
use anchor_lang::prelude::*;
use crate::StakingError;

/**
 * 创建质押包
 */
#[derive(Accounts)]
pub struct CreatePackage<'info> {
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user_info: Account<'info, UserInfo>,
    #[account(init, payer = user, space = 8 + 200)]
    pub staking_package: Account<'info, StakingPackage>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_package(ctx: Context<CreatePackage>, amount: u64) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let user_info = &mut ctx.accounts.user_info;
    let package = &mut ctx.accounts.staking_package;

    // 检查最小质押量
    require!(amount >= pool.min_stake, StakingError::MinimumStakeNotMet);

    // 计算基础释放量
    let base_release = amount
        .checked_mul(pool.daily_rate)
        .ok_or(StakingError::Overflow)?
        .checked_div(10000)
        .ok_or(StakingError::Overflow)?;

    // 计算推荐加速
    let referral_bonus = calculate_referral_bonus(pool, user_info, base_release)?;

    // 计算等级加速
    let level_bonus = calculate_level_bonus(pool, user_info, base_release)?;

    // 初始化质押包
    package.owner = ctx.accounts.user.key();
    package.amount = amount;
    package.base_release = base_release;
    package.accelerated_release = referral_bonus
        .checked_add(level_bonus)
        .ok_or(StakingError::Overflow)?;
    package.current_total = 0;
    package.max_total = amount
        .checked_mul(15000)
        .ok_or(StakingError::Overflow)?
        .checked_div(10000)
        .ok_or(StakingError::Overflow)?;
    package.created_at = Clock::get()?.unix_timestamp;
    package.is_active = true;

    Ok(())
}
