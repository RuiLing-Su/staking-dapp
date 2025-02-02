use crate::errors::*;
use crate::states::*;
use anchor_lang::prelude::*;

/**
 * 自动释放奖励
 */

#[derive(Accounts)]
pub struct AutoReleaseRewards<'info> {
    #[account(mut)]
    pub staking_package: Account<'info, StakingPackage>,
    pub user: Signer<'info>,
}

pub fn auto_release_rewards(ctx: Context<AutoReleaseRewards>) -> Result<()> {
    let package = &mut ctx.accounts.staking_package;

    // 检查包是否活跃
    require!(package.is_active, StakingError::PackageNotActive);

    let now = Clock::get()?.unix_timestamp;
    let duration = (now - package.created_at) as u64;

    // 计算释放量
    let total_release = package
        .base_release
        .checked_add(package.accelerated_release)
        .ok_or(StakingError::Overflow)?;

    let new_total = package
        .current_total
        .checked_add(total_release.checked_mul(duration / 86400).unwrap())
        .unwrap();

    // 确保不超过最大限额
    package.current_total = std::cmp::min(new_total, package.max_total);
    package.created_at = now;

    Ok(())
}
