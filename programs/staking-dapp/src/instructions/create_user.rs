use crate::states::*;
use anchor_lang::prelude::*;

/**
 * 创建用户账户的结构体
 * 该结构体用于定义创建用户所需的账户信息
 */
#[derive(Accounts)]
pub struct CreateUser<'info> {
    /// 初始化用户信息账户，设置支付者为 user，分配 8 + 200 字节的空间
    #[account(init, payer = user, space = 8 + 200)]
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
pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
    // 获取用户信息账户的可变引用
    let user_info = &mut ctx.accounts.user_info;

    // 记录用户公钥
    user_info.user = ctx.accounts.user.key();
    // 记录推荐人公钥
    user_info.referrer = ctx.accounts.referrer.key();
    // 初始化质押金额为 0
    user_info.staked_amount = 0;
    // 初始化已领取奖励为 0
    user_info.rewards_claimed = 0;
    // 记录最后领取奖励时间，初始化为当前区块链时间戳
    user_info.last_claim_time = Clock::get()?.unix_timestamp;
    // 直接推荐人数初始化为 0
    user_info.direct_referrals = 0;
    // 间接推荐人数初始化为 0
    user_info.indirect_referrals = 0;
    // 用户等级初始化为 0
    user_info.level = 0;
    // 团队业绩初始化为 0
    user_info.team_performance = 0;
    // 用户初始状态设置为未激活
    user_info.is_active = false;
    // 质押包数量初始化为 0
    user_info.packages_count = 0;

    Ok(())
}
