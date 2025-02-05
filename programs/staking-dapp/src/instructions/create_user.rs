use crate::states::*;
use anchor_lang::prelude::*;
use crate::status_enum::UserRole;

/**
 * 创建用户账户的结构体
 * 该结构体用于定义创建用户所需的账户信息
 */
#[derive(Accounts)]
pub struct CreateUser<'info> {
    /// 初始化用户信息账户，设置支付者为 user，分配 8 + 200 字节的空间
    /// bump 会自动计算并存储在 ctx.accounts 中的 bump 字段中
    #[account(init, payer = user, space = 8 + 200, seeds = [b"user_info", user.key().as_ref()], bump)]
    pub user_info: Account<'info, UserInfo>,
    /// 用户账户，作为交易的签名者
    #[account(mut)]
    pub user: Signer<'info>,
    /// 推荐人账户，未被直接读写，仅用于记录推荐关系
    /// CHECK: This account is not written to or read from
    pub referrer: AccountInfo<'info>,
    /// 系统程序账户，用于创建新账户
    pub system_program: Program<'info, System>,
}

/**
 * 创建用户函数
 * 初始化用户信息，并记录用户的基本信息
 */
pub fn create_user(
    ctx: Context<CreateUser>,
    referrer: Option<Pubkey>
) -> Result<()> {
    let user_info = &mut ctx.accounts.user_info;
    user_info.user = ctx.accounts.user.key();
    user_info.referrer = referrer.unwrap_or(ctx.accounts.user.key());
    user_info.staked_amount = 0;
    user_info.rewards_claimed = 0;
    user_info.last_claim_time = Clock::get()?.unix_timestamp;
    user_info.direct_referrals = 0;
    user_info.indirect_referrals = 0;
    user_info.level = 0;
    user_info.team_performance = 0;
    user_info.is_active = false;
    user_info.packages_count = 0;
    user_info.role = UserRole::User;
    Ok(())
}