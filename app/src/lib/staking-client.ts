import { Program, Provider, web3, BN } from '@project-serum/anchor';
import {
    PublicKey,
    Connection,
    Keypair,
    Transaction,
    TransactionInstruction, SystemProgram
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { CONFIG } from './config';

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
     * 重试操作
     * @param operation
     * @private
     */
    private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError;
        for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
                const result = await operation();
                return result;
            } catch (error) {
                console.error(`尝试第 ${i + 1} 次失败:`, error);
                lastError = error;
                if (i < this.MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                }
            }
        }
        throw lastError;
    }

    /**
     * 获取用户信息地址
     */
    async getUserInfoAddress(): Promise<PublicKey> {
        const [userInfoAddress] = await PublicKey.findProgramAddress(
            [
                Buffer.from("user_info"),
                this.wallet.publicKey.toBuffer()
            ],
            this.program.programId
        );
        return userInfoAddress;
    }

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
     * 创建用户账户
     * @param referrerPubkey
     */
    async createUser(referrerPubkey: PublicKey) {
        const userInfoAddress = await this.getUserInfoAddress();

        return this.withRetry(async () => {
            try {
                // 先检查账户是否已存在
                const accountInfo = await this.connection.getAccountInfo(userInfoAddress);
                if (accountInfo !== null) {
                    console.log("用户账户已存在，无需创建");
                    return userInfoAddress; // 如果账户已存在，直接返回地址
                }

                console.log("用户账户不存在，开始创建");

                // 如果没有推荐人，则将推荐人设置为系统账户
                if (!referrerPubkey){
                    console.log("没有推荐人，将推荐人设置为系统账户");
                    referrerPubkey = SystemProgram.programId;
                }

                // 创建用户账户
                const tx = await this.program.methods
                    .createUser()
                    .accounts({
                        userInfo: userInfoAddress,
                        user: this.wallet.publicKey,
                        referrer: referrerPubkey,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([]) // 不需要签名
                    .rpc();

                console.log("创建用户账户成功，交易ID:", tx);

                await this.connection.confirmTransaction(tx, CONFIG.COMMITMENT);

                console.log("用户账户地址:", userInfoAddress.toBase58());

                return userInfoAddress;
            } catch (error) {
                console.error('创建用户账户失败:', error);
                throw error;
            }
        });
    }


    /**
     * 查询用户信息
     * @param userInfoAddress
     */
    async getUserInfo(userInfoAddress: PublicKey) {
        try {
            // 先检查账户是否存在
            const accountInfo = await this.connection.getAccountInfo(userInfoAddress);
            if (accountInfo === null) {
                return null; // 如果账户不存在，返回 null
            }

            // 获取用户信息
            return await this.program.account.userInfo.fetch(userInfoAddress);
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    }

    /**
     * 创建质押包
     * @param poolAddress
     * @param userInfoAddress
     * @param amount
     */
    async createPackage(
        poolAddress: PublicKey,
        userInfoAddress: PublicKey,
        amount: number
    ) {
        const stakingPackage = Keypair.generate(); // 生成质押包的密钥对

        return this.withRetry(async () => {
            const tx = await this.program.methods
                .createPackage(new BN(amount))
                .accounts({
                    pool: poolAddress,
                    userInfo: userInfoAddress,
                    stakingPackage: stakingPackage.publicKey,
                    user: this.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([stakingPackage])
                .rpc();

            await this.connection.confirmTransaction(tx, CONFIG.COMMITMENT);
            return stakingPackage.publicKey;
        });
    }

    /**
     * 进行质押
     * @param poolAddress
     * @param userInfoAddress
     * @param amount
     */
    async stake(
        poolAddress: PublicKey,
        userInfoAddress: PublicKey,
        amount: number
    ) {
        // 从池子信息中获取stake_mint
        const poolInfo = await this.getPoolInfo(poolAddress);

        // 获取用户代币账户
        const userTokenAccount = await getAssociatedTokenAddress(
            poolInfo.stake_mint,
            this.wallet.publicKey
        );

        // 获取池子代币账户
        const poolTokenAccount = await getAssociatedTokenAddress(
            poolInfo.stake_mint,
            poolAddress,
            true
        );

        return this.withRetry(async () => {
            const tx = await this.program.methods
                .stake(new BN(amount))
                .accounts({
                    pool: poolAddress,
                    userInfo: userInfoAddress,
                    userTokenAccount,
                    poolTokenAccount,
                    user: this.wallet.publicKey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            await this.connection.confirmTransaction(tx, CONFIG.COMMITMENT);
            return tx;
        });
    }

    /**
     * 自动释放奖励
     * @param packageAddress
     */
    async autoReleaseRewards(packageAddress: PublicKey) {
        return this.withRetry(async () => {
            const tx = await this.program.methods
                .autoReleaseRewards()
                .accounts({
                    stakingPackage: packageAddress,
                    user: this.wallet.publicKey,
                })
                .rpc();

            await this.connection.confirmTransaction(tx, CONFIG.COMMITMENT);
            return tx;
        });
    }

    /**
     * 退出质押包
     * @param poolAddress
     * @param userInfoAddress
     * @param packageAddress
     * @param adminAddress
     */
    async exitPackage(
        poolAddress: PublicKey,
        userInfoAddress: PublicKey,
        packageAddress: PublicKey,
        adminAddress: PublicKey
    ) {
        // 从池子信息中获取 reward_mint 和 meme_mint
        const poolInfo = await this.getPoolInfo(poolAddress);

        // 获取池子的奖励代币账户
        const poolRewardAccount = await getAssociatedTokenAddress(
            poolInfo.reward_mint,
            poolAddress,
            true
        );

        // 获取池子的MEME代币账户
        const poolMemeAccount = await getAssociatedTokenAddress(
            poolInfo.meme_mint,
            poolAddress,
            true
        );

        // 获取用户奖励代币账户
        const userRewardAccount = await getAssociatedTokenAddress(
            poolInfo.reward_mint,
            this.wallet.publicKey
        );

        // 获取用户MEME代币账户
        const userMemeAccount = await getAssociatedTokenAddress(
            poolInfo.meme_mint,
            this.wallet.publicKey
        );

        return this.withRetry(async () => {
            const tx = await this.program.methods
                .exitPackage()
                .accounts({
                    pool: poolAddress,
                    userInfo: userInfoAddress,
                    stakingPackage: packageAddress,
                    poolRewardAccount,
                    poolMemeAccount,
                    userRewardAccount,
                    userMemeAccount,
                    user: this.wallet.publicKey,
                    admin: adminAddress,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            await this.connection.confirmTransaction(tx, CONFIG.COMMITMENT);
            return tx;
        });
    }

    /**
     * 查询质押池信息
     * @param poolAddress
     */
    async getPoolInfo(poolAddress: PublicKey) {
        return await this.program.account.stakingPool.fetch(poolAddress);
    }

    /**
     * 查询质押包信息
     * @param packageAddress
     */
    async getPackageInfo(packageAddress: PublicKey) {
        return await this.program.account.stakingPackage.fetch(packageAddress);
    }
}