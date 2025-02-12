export const CONFIG = {

    API_URL: 'http://192.168.1.104:8000/api',
    PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID!,
    RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT!,
    COMMITMENT: 'confirmed' as const,
    TOKENS: {
        STAKE: {
            DECIMALS: 6,
            SYMBOL: 'USDC'
        },
        REWARD: {
            DECIMALS: 9,
            SYMBOL: 'REWARD'
        },
        MEME: {
            DECIMALS: 9,
            SYMBOL: 'MEME'
        }
    }
};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NEXT_PUBLIC_PROGRAM_ID: string;
            NEXT_PUBLIC_RPC_ENDPOINT: string;
        }
    }
}