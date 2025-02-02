use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

/**
 * 质押
 */
#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub user_info: Account<'info, UserInfo>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let user_info = &mut ctx.accounts.user_info;

    // 更新用户信息
    user_info.staked_amount = user_info.staked_amount.checked_add(amount).unwrap();
    pool.total_staked = pool.total_staked.checked_add(amount).unwrap();

    // 激活用户
    if !user_info.is_active {
        user_info.is_active = true;
        pool.total_users = pool.total_users.saturating_add(1);
    }

    // 转移质押代币
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.pool_token_account.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    Ok(())
}
