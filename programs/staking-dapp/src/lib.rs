use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

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

    // 初始化质押池
    pub fn initialize(
        ctx: Context<Initialize>,
        daily_rate: u64,     // 3000 means 3‰
        max_multiplier: u64, // 15000 means 1.5x
        min_stake: u64,      // minimum stake amount (100 USDC)
        direct_bonus: u64,   // 3000 means 30%
        indirect_bonus: u64, // 1000 means 10%
    ) -> Result<()> {
        instructions::initialize(
            ctx,
            daily_rate,
            max_multiplier,
            min_stake,
            direct_bonus,
            indirect_bonus,
        )
    }

    // 创建用户账户
    pub fn create_user(
        ctx: Context<CreateUser>,
        referrer: Option<Pubkey>,
    ) -> Result<()> {
        instructions::create_user(ctx, referrer)
    }

    // 创建质押包
    pub fn create_package(ctx: Context<CreatePackage>, amount: u64) -> Result<()> {
        instructions::create_package(ctx, amount)
    }

    // 质押
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::stake(ctx, amount)
    }

    // 自动释放奖励
    pub fn auto_release_rewards(ctx: Context<AutoReleaseRewards>) -> Result<()> {
        instructions::auto_release::auto_release_rewards(ctx)
    }

    // 出局
    pub fn exit_package(ctx: Context<ExitPackage>) -> Result<()> {
        instructions::exit_package(ctx)
    }

    // 更新推荐人奖励
    pub fn update_referral_rewards(
        ctx: Context<UpdateReferralRewards>,
        new_referrals: u32,
        referral_stake_amount: u64,
    ) -> Result<()> {
        instructions::update_referral::update_referral_rewards(
            ctx,
            new_referrals,
            referral_stake_amount,
        )
    }
}

// 重新导出指令上下文，使得其他模块可以通过引用本模块来使用这些上下文
pub use instructions::{
    AutoReleaseRewards, CreatePackage, CreateUser, ExitPackage, Initialize, Stake,
    UpdateReferralRewards,
};

// 重新导出状态结构体，使得其他模块可以通过引用本模块来使用这些状态数据结构
pub use states::{StakingPackage, StakingPool, UserInfo};

// 重新导出错误，使得其他模块可以通过引用本模块来处理这些错误
pub use errors::StakingError;
