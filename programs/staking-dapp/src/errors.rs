use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Airdrop failed")]
    AirdropFailed,
    #[msg("Airdrop confirm failed")]
    AirdropConfirmFailed,
    #[msg("Invalid user wallet address")]
    InvalidUserAddress,
}
