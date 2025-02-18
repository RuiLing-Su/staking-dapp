use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct SystemAccount {
    pub bump: u8,
    pub pubkey: Pubkey,
    pub private_key: [u8; 64], // 私钥长度为64字节
} 