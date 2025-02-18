/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    images:{
        unoptimized:true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            path: false,
            os: false,
            crypto: false,
            stream: false,
            http: false,
            https: false,
            zlib: false,
        };
        return config;
    },
    transpilePackages: [
        "@solana/wallet-adapter-base",
        "@solana/wallet-adapter-react",
        "@solana/wallet-adapter-wallets",
        "@project-serum/anchor"
    ]
};

module.exports = nextConfig;