/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
  // 添加输出清理选项
  cleanDistDir: true,
  // 优化输出
  output: 'standalone',
}

module.exports = nextConfig 