use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct UserInfo {
    pub bump: u8,
    pub wallet_address: Pubkey,
} 