use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use solana_program::{program::invoke, system_instruction::transfer};

use crate::errors::StakingError;
use crate::states::UserInfo;

#[derive(Accounts)]
pub struct BuyToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user_info", user.key().as_ref()],
        bump = user_info.bump,
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
    pub system_program: Program<'info, System>,
}

pub fn buy_token(ctx: Context<BuyToken>, amount: u64) -> Result<()> {
    let user_info = &mut ctx.accounts.user_info;
    let user_token_account = &mut ctx.accounts.user_token_account;
    let token_program = &ctx.accounts.token_program;

    // 调用 GMGN 的 API 购买代币
    let (exchange_token_account, exchange_authority) = get_exchange_accounts(ctx.accounts.token_mint.key())?;
    invoke_signed(
        &transfer(
            ctx.accounts.user.key,
            exchange_authority.key,
            amount,
        )?,
        &[
            ctx.accounts.user.to_account_info(),
            exchange_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[&[&b"exchange_authority"[..]]],
    )?;

    // 将购买的代币转入用户账户
    anchor_spl::token::transfer(
        CpiContext::new(
            token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: exchange_token_account.to_account_info(),
                to: user_token_account.to_account_info(),
                authority: exchange_authority.to_account_info(),
            },
        ),
        amount,
    )?;

    // 更新用户代币余额
    user_info.token_balance = user_info
        .token_balance
        .checked_add(amount)
        .ok_or(StakingError::MathOverflow)?;

    Ok(())
}

// 根据代币地址获取GMGN交易所的代币账户和权限账户
fn get_exchange_accounts(token_mint: Pubkey) -> Result<(AccountInfo, AccountInfo)> {
    // 调用 GMGN 的路由接口获取交易所账户信息
    let client = reqwest::Client::new();
    let res = client.get(format!("{}/accounts?mint={}", GMGN_API_URL, token_mint))
        .send()?
        .json::<GmgnAccountsResult>()?;

    let token_account = res.accounts.get(0).ok_or(StakingError::InvalidGmgnAccounts)?;
    let authority = res.authorities.get(0).ok_or(StakingError::InvalidGmgnAccounts)?;

    Ok((
        AccountInfo::try_from(token_account)?,
        AccountInfo::try_from(authority)?,
    ))
}

// GMGN 返回的账户信息
struct GmgnAccountsResult {
    accounts: Vec<GmgnAccountInfo>,
    authorities: Vec<[u8; 32]>,
}

// GMGN 返回的账户信息转换为 AccountInfo
impl TryFrom<&GmgnAccountInfo> for AccountInfo<'_> {
    type Error = ProgramError;

    fn try_from(account: &GmgnAccountInfo) -> Result<Self, Self::Error> {
        Ok(AccountInfo {
            key: Pubkey::new_from_array(account.address),
            is_signer: false,
            is_writable: false,
            lamports: account.lamports,
            data: account.data.as_slice(),
            owner: Pubkey::new_from_array(account.owner),
            executable: account.executable,
            rent_epoch: account.rent_epoch,
        })
    }
} 