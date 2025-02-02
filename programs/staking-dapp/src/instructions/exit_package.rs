use crate::errors::*;
use crate::instructions::{calculate_level_bonus, calculate_referral_bonus};
use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

/**
 * 出局
 */
#[derive(Accounts)]
pub struct ExitPackage<'info> {
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user_info: Account<'info, UserInfo>,
    #[account(mut)]
    pub staking_package: Account<'info, StakingPackage>,
    #[account(mut)]
    pub pool_reward_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_meme_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_reward_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_meme_account: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}
pub fn exit_package(ctx: Context<ExitPackage>) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let user_info = &mut ctx.accounts.user_info;
    let package = &mut ctx.accounts.staking_package;

    // 验证包是否达到最大收益
    require!(
        package.current_total >= package.max_total,
        StakingError::PackageNotMatured
    );

    // 50%兑换成SOL和MEME
    let sol_reward = package.current_total.checked_div(2).unwrap();
    let meme_reward = package.current_total.checked_div(2).unwrap();

    // 转移SOL奖励
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_reward_account.to_account_info(),
                to: ctx.accounts.user_reward_account.to_account_info(),
                authority: ctx.accounts.admin.to_account_info(),
            },
        ),
        sol_reward,
    )?;

    // 转移MEME奖励
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_meme_account.to_account_info(),
                to: ctx.accounts.user_meme_account.to_account_info(),
                authority: ctx.accounts.admin.to_account_info(),
            },
        ),
        meme_reward,
    )?;

    // 更新包状态
    package.is_active = false;

    // 更新用户信息
    user_info.staked_amount = user_info.staked_amount.checked_sub(package.amount).unwrap();
    user_info.packages_count = user_info.packages_count.checked_sub(1).unwrap();
    user_info.rewards_claimed = user_info
        .rewards_claimed
        .checked_add(package.current_total)
        .unwrap();

    Ok(())
}
