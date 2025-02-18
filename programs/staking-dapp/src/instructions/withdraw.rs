use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use solana_program::{program::invoke_signed, system_instruction::transfer};

use crate::errors::StakingError;
use crate::states::UserInfo;
use crate::states::SystemAccount;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut, 
        seeds = [b"user_info", user.key().as_ref()],
        bump = user_info.bump,
        constraint = user_info.token_balance >= amount
    )]
    pub user_info: Account<'info, UserInfo>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == token_mint.key(),
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,

    #[account(
        seeds = [b"system_account"],
        bump = system_account.bump,
    )]
    pub system_account: Account<'info, SystemAccount>,
}

pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let user_info = &mut ctx.accounts.user_info;
    let user_token_account = &mut ctx.accounts.user_token_account;
    let token_program = &ctx.accounts.token_program;

    let system_account = &ctx.accounts.system_account;
    let system_pubkey = system_account.pubkey;

    // 检查用户钱包地址是否与 UserInfo 中的一致
    if ctx.accounts.user.key() != ctx.accounts.user_info.wallet_address {
        return Err(StakingError::InvalidUserAddress.into());
    }

    // 将 SOL 从系统账户转移到用户账户
    let transfer_ix = transfer(
        &system_pubkey,
        &ctx.accounts.user.key(),
        amount,
    );
    let signers_seeds = &[&b"system_account"[..], &[system_account.bump]];
    invoke_signed(
        &transfer_ix,
        &[
            system_account.to_account_info(),
            ctx.accounts.user.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[signers_seeds],
    )?;

    // 转移代币到用户关联的代币账户
    anchor_spl::token::transfer(
        CpiContext::new(
            token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: user_info.to_account_info(),
                to: user_token_account.to_account_info(),
                authority: user_info.to_account_info(),
            },
        ),
        amount,
    )?;

    // 更新用户代币余额
    user_info.token_balance = user_info
        .token_balance  
        .checked_sub(amount)
        .ok_or(StakingError::InsufficientFunds)?;

    Ok(())
} 