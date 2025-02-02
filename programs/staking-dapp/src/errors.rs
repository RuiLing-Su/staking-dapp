use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("最小质押量未满足")]
    MinimumStakeNotMet,
    #[msg("算术溢出错误")]
    Overflow,
    #[msg("用户未激活")]
    UserNotActive,
    #[msg("已达到最大收益倍数")]
    MaxMultiplierReached,
    #[msg("提现金额超过可用余额")]
    InsufficientBalance,
    #[msg("质押包未达到出局条件")]
    PackageNotMatured,
    #[msg("质押包未激活")]
    PackageNotActive,
}
