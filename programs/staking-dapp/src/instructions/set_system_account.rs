use anchor_lang::prelude::*;
use crate::states::SystemAccount;

#[derive(Accounts)]
pub struct SetSystemAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 64,
        seeds = [b"system_account"],
        bump
    )]
    pub system_account: Account<'info, SystemAccount>,

    pub system_program: Program<'info, System>,
}

pub fn set_system_account(ctx: Context<SetSystemAccount>, pubkey: Pubkey, private_key: [u8; 64]) -> Result<()> {
    let system_account = &mut ctx.accounts.system_account;
    system_account.pubkey = pubkey;
    system_account.private_key = private_key;
    Ok(())
} 