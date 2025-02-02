use crate::errors::*;
use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

pub mod auto_release;
pub mod create_package;
pub mod create_user;
pub mod exit_package;
pub mod initialize;
pub mod stake;
pub mod update_referral;

pub use auto_release::*;
pub use create_package::*;
pub use create_user::*;
pub use exit_package::*;
pub use initialize::*;
pub use stake::*;
pub use update_referral::*;

// 用于计算推荐奖励
pub fn calculate_referral_bonus(
    pool: &Account<StakingPool>,
    user_info: &Account<UserInfo>,
    base_reward: u64,
) -> Result<u64> {
    let direct_bonus = base_reward
        .checked_mul(pool.direct_bonus)
        .ok_or(StakingError::Overflow)?
        .checked_div(10000)
        .ok_or(StakingError::Overflow)?
        .checked_mul(user_info.direct_referrals as u64)
        .ok_or(StakingError::Overflow)?;

    let indirect_bonus = base_reward
        .checked_mul(pool.indirect_bonus)
        .ok_or(StakingError::Overflow)?
        .checked_div(10000)
        .ok_or(StakingError::Overflow)?
        .checked_mul(user_info.indirect_referrals as u64)
        .ok_or(StakingError::Overflow)?;

    Ok(direct_bonus
        .checked_add(indirect_bonus)
        .ok_or(StakingError::Overflow)?)
}

// 用于计算等级奖励
pub fn calculate_level_bonus(
    _pool: &Account<StakingPool>,
    user_info: &Account<UserInfo>,
    base_reward: u64,
) -> Result<u64> {
    let level_multiplier = match user_info.level {
        1 => 500,  // 5%
        2 => 1000, // 10%
        3 => 1500, // 15%
        4 => 2000, // 20%
        5 => 2500, // 25%
        _ => 0,
    };

    Ok(base_reward
        .checked_mul(level_multiplier)
        .ok_or(StakingError::Overflow)?
        .checked_div(10000)
        .ok_or(StakingError::Overflow)?)
}

// 用于更新用户等级
pub fn update_user_level(user_info: &mut Account<UserInfo>) -> Result<()> {
    if user_info.direct_referrals >= 10 && user_info.level == 0 {
        user_info.level = 1;
    }

    // V2-V5根据下级V1-V4数量判断
    match user_info.level {
        1 if user_info.direct_referrals >= 3 => user_info.level = 2,
        2 if user_info.direct_referrals >= 3 => user_info.level = 3,
        3 if user_info.direct_referrals >= 3 => user_info.level = 4,
        4 if user_info.direct_referrals >= 3 => user_info.level = 5,
        _ => {}
    }

    Ok(())
}
