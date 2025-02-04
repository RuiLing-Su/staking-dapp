import { Program, Provider, web3, BN } from '@project-serum/anchor';
import {
    PublicKey,
    Connection,
    Keypair,
    SystemProgram,
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
    UserInfo,
    StakingPackage,
    PackageStatus,
    UserRole
} from './types';

export class StakingClient {
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 1000;

    /**
     * 构造函数
     * @param program 质押相关的智能合约程序
     * @param connection 区块链连接对象
     * @param wallet 用户钱包
     */
    constructor(
        private program: Program,
        private connection: Connection,
        public wallet: any
    ) {}

    /**
     * 获取质押池地址
     */
    async getPoolAddress(): Promise<PublicKey> {
        const [poolAddress] = await PublicKey.findProgramAddress(
            [Buffer.from("staking_pool")],
            this.program.programId
        );
        return poolAddress;
    }

    /**
     * 初始化用户账户
     * @param referrerPubkey
     */
    async initializeUserAccount(referrerPubkey?: PublicKey): Promise<UserInfo> {
        const userIdentifier = await this.getUserIdentifier();
        const userInfoAddress = await this.getUserInfoAddress();

        // 查看用户账户是否存在
        const accountInfo = await this.connection.getAccountInfo(userInfoAddress);
        if (accountInfo !== null) {
            return this.getUserInfo();
        }

        // 创建用户账户
        const actualReferrer = referrerPubkey || SystemProgram.programId;
        await this.program.methods
            .createUser()
            .accounts({
                userInfo: userInfoAddress,
                user: this.wallet.publicKey,
                referrer: actualReferrer,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        return this.getUserInfo();
    }

    /**
     * 质押包相关方法
     * @param amount
     */
    async createAndStakePackage(amount:BN): Promise<{ packageAddress: PublicKey }> {
        const poolAddress = await this.getPoolAddress();
        const userInfoAddress = await this.getUserInfoAddress();
        const stakingPackage = Keypair.generate();

        // 创建质押包
        await this.program.methods
            .createPackage(new BN(amount))
            .accounts({
                pool: poolAddress,
                userInfo: userInfoAddress,
                stakingPackage: stakingPackage.publicKey,
                user: this.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([stakingPackage])
            .rpc();

        // 质押
        const poolInfo = await this.getPoolInfo(poolAddress);
        const userTokenAccount = await getAssociatedTokenAddress(
            poolInfo.stake_mint,
            this.wallet.publicKey
        );
        const poolTokenAccount = await getAssociatedTokenAddress(
            poolInfo.stake_mint,
            poolAddress,
            true
        );

        await this.program.methods
            .stake(new BN(amount))
            .accounts({
                pool: poolAddress,
                userInfo: userInfoAddress,
                stakingPackage: stakingPackage.publicKey,
                userTokenAccount,
                poolTokenAccount,
                user: this.wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        return { packageAddress: stakingPackage.publicKey };
    }

    /**
     * 退出质押包
     * @param packageAddress
     */
    async exitPackage(packageAddress: PublicKey): Promise<string> {
        const poolAddress = await this.getPoolAddress();
        const userInfoAddress = await this.getUserInfoAddress();
        const poolInfo = await this.getPoolInfo(poolAddress);

        const userTokenAccounts = await Promise.all([
            getAssociatedTokenAddress(poolInfo.rewardMint, this.wallet.publicKey),
            getAssociatedTokenAddress(poolInfo.memeMint, this.wallet.publicKey)
        ]);

        const poolTokenAccounts = await Promise.all([
            getAssociatedTokenAddress(poolInfo.rewardMint, poolAddress, true),
            getAssociatedTokenAddress(poolInfo.memeMint, poolAddress, true)
        ]);

        await this.program.methods
            .exitPackage()
            .accounts({
                pool: poolAddress,
                userInfo: userInfoAddress,
                stakingPackage: packageAddress,
                userRewardAccount: userTokenAccounts[0],
                userMemeAccount: userTokenAccounts[1],
                poolRewardAccount: poolTokenAccounts[0],
                poolMemeAccount: poolTokenAccounts[1],
                user: this.wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();
    }

    private async getTokenAccounts(poolInfo: any, poolAddress: PublicKey) {
        const [poolRewardAccount, poolMemeAccount, userRewardAccount, userMemeAccount] =
            await Promise.all([
                getAssociatedTokenAddress(poolInfo.reward_mint, poolAddress, true),
                getAssociatedTokenAddress(poolInfo.meme_mint, poolAddress, true),
                getAssociatedTokenAddress(poolInfo.reward_mint, this.wallet.publicKey),
                getAssociatedTokenAddress(poolInfo.meme_mint, this.wallet.publicKey)
            ]);

        return {
            poolRewardAccount,
            poolMemeAccount,
            userRewardAccount,
            userMemeAccount
        };
    }

    private async getUserIdentifier(): Promise<PublicKey> {
        return PublicKey.findProgramAddress(
            [Buffer.from('user'), this.wallet.publicKey.toBuffer()],
            this.program.programId
        ).then(([address]) => address);
    }

    /**
     * 获取用户信息地址
     * @private
     */
    private async getUserInfoAddress(): Promise<PublicKey> {
        const [address] = await PublicKey.findProgramAddress(
            [
                Buffer.from('user_info'),
                this.wallet.publicKey.toBuffer()
            ],
            this.program.programId
        );
        return address;
    }

    private async getPoolInfo(poolAddress: PublicKey): Promise<any> {
        const poolInfo = await this.program.account.pool.fetch(poolAddress);
        return poolInfo;
    }

    /**
     * 自动释放奖励
     * @param packageAddress
     */
    async autoReleaseRewards(packageAddress: PublicKey): Promise<string> {
        return this.program.methods
            .autoReleaseRewards()
            .accounts({
                stakingPackage: packageAddress,
                user: this.wallet.publicKey,
            })
            .rpc();
    }


    /**
     * 查询用户信息
     */
    async getUserInfo(): Promise<UserInfo> {
        const userInfoAddress = await this.getUserInfoAddress();
        return this.program.account.userInfo.fetch(userInfoAddress);
    }
    async getUserPackages(): Promise<StakingPackage[]> {
        const userInfo = await this.getUserInfo();
        const packages: StakingPackage[] = [];

        // 遍历用户所有质押包
        for (let i = 0; i < userInfo.packagesCount.toNumber(); i++) {
            const packageAddress = await this.derivePackageAddress(i);
            const packageInfo = await this.getPackageInfo(packageAddress);
            if (packageInfo.status === PackageStatus.Active) {
                packages.push(packageInfo);
            }
        }

        return packages;
    }

    private async derivePackageAddress(index: number): Promise<PublicKey> {
        const [address] = await PublicKey.findProgramAddress(
            [
                Buffer.from('staking_package'),
                this.wallet.publicKey.toBuffer(),
                Buffer.from(index.toString())
            ],
            this.program.programId
        );
        return address;
    }
    private async getPackageInfo(packageAddress: PublicKey): Promise<StakingPackage> {
        return this.program.account.stakingPackage.fetch(packageAddress);
    }




}