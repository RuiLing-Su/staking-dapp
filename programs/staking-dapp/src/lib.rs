use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use solana_client::rpc_client::RpcClient;
use spl_token::instruction::transfer;

pub mod errors;
pub mod instructions;
pub mod states;
mod status_enum;

use instructions::*;
use states::*;

declare_id!("F3VhG4T9RboKvcZ8T17U8tFUT1cVr8s5jaEErvEupL7S");

#[program]
pub mod staking_program {
    use super::*;

    // 购买代币
    pub fn buy_token(ctx: Context<BuyToken>, amount: u64) -> Result<()> {
        instructions::buy_token::buy_token(ctx, amount)
    }

    // 提现
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::withdraw(ctx, amount)
    }

    pub fn set_system_account(ctx: Context<SetSystemAccount>, pubkey: Pubkey, private_key: [u8; 64]) -> Result<()> {
        instructions::set_system_account::set_system_account(ctx, pubkey, private_key)
    }
}

// 重新导出指令上下文，使得其他模块可以通过引用本模块来使用这些上下文
pub use instructions::{
    BuyToken, Withdraw, SetSystemAccount
};

// 重新导出状态结构体，使得其他模块可以通过引用本模块来使用这些状态数据结构
pub use states::{UserInfo, SystemAccount};

// 重新导出错误，使得其他模块可以通过引用本模块来处理这些错误
pub use errors::StakingError;
