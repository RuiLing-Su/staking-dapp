use crate::states;
use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

/**
 * 初始化质押池
 */
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 200)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub stake_mint: Account<'info, Mint>,
    pub reward_mint: Account<'info, Mint>,
    pub meme_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn initialize(
    ctx: Context<Initialize>,
    daily_rate: u64,     // 3000 表示 3‰
    max_multiplier: u64, // 15000 表示 1.5x
    min_stake: u64,      // 最小质押量 (100 USDC)
    direct_bonus: u64,   // 3000 表示 30%
    indirect_bonus: u64, // 1000 表示 10%
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    pool.admin = ctx.accounts.admin.key();
    pool.stake_mint = ctx.accounts.stake_mint.key();
    pool.reward_mint = ctx.accounts.reward_mint.key();
    pool.meme_mint = ctx.accounts.meme_mint.key();
    pool.total_staked = 0;
    pool.daily_rate = daily_rate;
    pool.max_multiplier = max_multiplier;
    pool.min_stake = min_stake;
    pool.direct_bonus = direct_bonus;
    pool.indirect_bonus = indirect_bonus;
    pool.total_users = 0;
    pool.global_reward_pool = 0;

    Ok(())
}
