use crate::states::*;
use anchor_lang::prelude::*;

/**
 * 创建用户账户
 */
#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(init, payer = user, space = 8 + 200)]
    pub user_info: Account<'info, UserInfo>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This account is not written to or read from
    pub referrer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
    let user_info = &mut ctx.accounts.user_info;

    user_info.user = ctx.accounts.user.key();
    user_info.referrer = ctx.accounts.referrer.key();
    user_info.staked_amount = 0;
    user_info.rewards_claimed = 0;
    user_info.last_claim_time = Clock::get()?.unix_timestamp;
    user_info.direct_referrals = 0;
    user_info.indirect_referrals = 0;
    user_info.level = 0;
    user_info.team_performance = 0;
    user_info.is_active = false;
    user_info.packages_count = 0;

    Ok(())
}
