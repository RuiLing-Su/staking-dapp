import { Program, Provider, web3, BN } from '@project-serum/anchor';
import {
    PublicKey,
    Connection,
    Keypair,
    Transaction,
    TransactionInstruction
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

    constructor(
        private program: Program, // 质押相关的智能合约程序
        private connection: Connection, // 区块链连接对象
        public wallet: any // 用户钱包
    ) {}

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

    // 获取质押池的地址
    async getPoolAddress(): Promise<PublicKey> {
        const [poolAddress] = await PublicKey.findProgramAddress(
            [Buffer.from("staking_pool")],
            this.program.programId
        );
        return poolAddress;
    }

    // 创建用户账户
    async createUser(userPubkey: PublicKey, referrerPubkey: PublicKey) {
        const userInfo = Keypair.generate(); // 生成新的用户密钥对

        return this.withRetry(async () => {
            const tx = await this.program.methods
                .createUser()
                .accounts({
                    userInfo: userInfo.publicKey,
                    user: userPubkey,
                    referrer: referrerPubkey,
                    systemProgram: web3.SystemProgram.programId,
                })
                .signers([userInfo])
                .rpc();

            await this.connection.confirmTransaction(tx, CONFIG.COMMITMENT);
            return userInfo.publicKey;
        });
    }

    // 创建质押包
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

    // 进行质押
    async stake(
        poolAddress: PublicKey,
        userInfoAddress: PublicKey,
        amount: number
    ) {
        // 获取用户代币账户
        const userTokenAccount = await getAssociatedTokenAddress(
            this.program.account.pool.stakeMint,
            this.wallet.publicKey
        );

        // 获取池子代币账户
        const poolTokenAccount = await getAssociatedTokenAddress(
            this.program.account.pool.stakeMint,
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

    // 自动释放奖励
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

    // 退出质押包
    async exitPackage(
        poolAddress: PublicKey,
        userInfoAddress: PublicKey,
        packageAddress: PublicKey,
        adminAddress: PublicKey
    ) {
        // 获取池子的奖励代币账户
        const poolRewardAccount = await getAssociatedTokenAddress(
            this.program.account.pool.rewardMint,
            poolAddress,
            true
        );

        // 获取池子的MEME代币账户
        const poolMemeAccount = await getAssociatedTokenAddress(
            this.program.account.pool.memeMint,
            poolAddress,
            true
        );

        // 获取用户奖励代币账户
        const userRewardAccount = await getAssociatedTokenAddress(
            this.program.account.pool.rewardMint,
            this.wallet.publicKey
        );

        // 获取用户MEME代币账户
        const userMemeAccount = await getAssociatedTokenAddress(
            this.program.account.pool.memeMint,
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

    // 查询质押池信息
    async getPoolInfo(poolAddress: PublicKey) {
        return await this.program.account.stakingPool.fetch(poolAddress);
    }

    // 查询用户信息
    async getUserInfo(userInfoAddress: PublicKey) {
        return await this.program.account.userInfo.fetch(userInfoAddress);
    }

    // 查询质押包信息
    async getPackageInfo(packageAddress: PublicKey) {
        return await this.program.account.stakingPackage.fetch(packageAddress);
    }
}
