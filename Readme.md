

# SolEdge

本项目是一个基于 React 和 Next.js 的去中心化金融（DeFi）应用，主要功能包括用户认证、钱包连接、质押、代币交易等。用户可以通过该应用进行代币的充值、提现和质押操作，同时支持推荐系统。

目前，StakingDapp的开发中，已实现钱包连接功能，采用了wallet-adapter组件，但仍需完善登录、注册和登出接口。问题在于每次点击“connect”按钮时，页面会自动刷新，导致闪烁且钱包地址未正确显示，仍显示为最初的“connect”。目前仅支持Phantom钱包连接，其他钱包支持还在开发中。

页面的顶部图标、钱包按钮和底部版权信息在page.tsx中，主要逻辑在StakingDapp.tsx。充值功能已完成，代币图片未获取，奖励领取功能未实现。

## 环境要求

- Node.js 版本 >= 18.x
- npm 版本 >= 18.x

## 前端项目目录

```
/app
├── /api                     # API 接口
│   ├── auth.ts             # 认证相关 API
│   ├── baseApi.ts          # 基础 API 客户端配置
│   ├── staking.ts          # 质押相关 API
│   ├── token.ts            # 代币相关 API
│   └── wallet.ts           # 钱包相关 API
├── /app                    # 应用页面
│   ├── /auth               # 认证相关页面
│   │   ├── login           # 登录页面
│   │   ├── register        # 注册页面
│   │   └── page.tsx        # 认证页面
│   ├── /token              # 代币列表页面
│   └── /token/[id]        # 代币详情页面
├── /components             # 组件
│   ├── AppBar.tsx          # 应用顶部钱包按钮
│   ├── AuthSection.tsx     # 认证部分组件
│   ├── ReferralPanel.tsx    # 推荐面板组件
│   ├── RewardsPanel.tsx    # 奖励面板组件
│   ├── StakingDapp.tsx     # 质押 DApp 组件
│   ├── TokenList.tsx       # 代币列表组件
│   ├── StatsCard.tsx       # 统计卡片组件
│   └── ...                 # 其他组件
├── /lib                    # 库和上下文
│   ├── /context            # 上下文管理
│   │   ├── AuthContext.tsx # 认证上下文
│   │   ├── UserContext.tsx # 用户上下文
│   │   └── WalletContextProvider.tsx # 钱包上下文
│   ├── /hooks              # 自定义 Hook
│   │   ├── useAuth.ts      # 认证 Hook
│   │   ├── useStaking.ts   # 质押 Hook
│   │   └── useSystemWallet.ts # 系统钱包 Hook
│   └── /utils              # 工具函数
│       ├── validation.ts    # 验证函数
│       └── wallet.ts        # 钱包连接函数
├── /types                  # 类型定义
│   ├── authTypes.ts        # 认证相关类型
│   ├── stakingTypes.ts     # 质押相关类型
│   └── walletTypes.ts      # 钱包相关类型
├── /globals.css            # 全局样式
└── layout.tsx              # 应用布局
```
## 安装与运行

### 1. 克隆项目

```bash
```

### 2. 安装依赖

#### 安装前端依赖：

```bash
cd app
npm install
```

### 3. 运行项目

#### 启动前端

```bash
cd app
npm run dev
```

前端项目将会启动在 `http://localhost:3000` 或其他指定端口。

## 主要功能

- 用户认证：支持用户注册和登录，使用 Phantom 钱包进行身份验证。
- 代币交易：用户可以查看代币列表，进行代币充值和提现。
- 质押功能：用户可以参与质押，查看质押包和奖励信息。
- 推荐系统：用户可以通过推荐链接邀请他人，获取奖励。
