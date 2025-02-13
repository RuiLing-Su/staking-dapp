

# StakingDapp

本项目是一个基于智能合约的应用。

## 环境要求

- Node.js 版本 >= 18.x
- npm 版本 >= 18.x
- Solana CLI / Ethereum 环境等（视项目使用的链类型而定）

## 项目目录

```
staking-dapp/
├── programs/
│   └── staking-program/
│       ├── src/
│       │   ├── lib.rs        # 智能合约主代码
│       │   ├── errors.rs     # 错误定义
│       │   ├── state.rs      # 账户状态结构
│       │   └── instructions/ # 指令实现
│       └── Cargo.toml
│── app/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # 根布局组件
│   │   │   ├── page.tsx            # 首页
│   │   │   └── globals.css         # 全局样式
│   │   │
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── AuthContainer.tsx    # 认证容器组件
│   │   │   │   ├── LoginForm.tsx        # 登录表单
│   │   │   │   └── RegisterForm.tsx     # 注册表单
│   │   │   │
│   │   │   ├── StakingDapp.tsx     # 主应用组件
│   │   │   ├── ReferralPanel.tsx    # 推荐面板
│   │   │   ├── RewardsPanel.tsx     # 奖励面板
│   │   │   ├── StatsCard.tsx        # 统计卡片
│   │   │   ├── StakingPackage.tsx   # 质押包组件
│   │   │   ├── LevelGuide.tsx       # 等级指南
│   │   │   ├── Notification.tsx     # 通知组件
│   │   │   └── ReferralSystem.tsx   # 推荐系统
│   │   │
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── auth.ts          # 认证相关API
│   │   │   │   └── authTypes.ts         # API配置和类型
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── AuthContext.ts   # 认证上下文
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts       # 认证Hook
│   │   │   │   ├── useWallet.ts     # 钱包Hook
│   │   │   │   └── useStaking.ts    # 质押Hook
│   │   │   │
│   │   │   └── config.ts            # 全局配置
│   │   │
│   │   ├── types/
│   │   │   └── authTypes.ts             # 全局类型定义
│   │   │
│   │   └── utils/                   # 工具函数
│   │       ├── format.ts            # 格式化工具
│   │       └── validation.ts        # 验证工具
│   │
│   ├── public/                      # 静态资源
│   │   └── images/
│   │
│   ├── .env                        # 环境变量
│   ├── .env.local                  # 本地环境变量
│   ├── next.config.js              # Next.js 配置
│   ├── tailwind.config.js          # Tailwind CSS 配置
│   ├── tsconfig.json               # TypeScript 配置
│   └── package.json                # 项目依赖
├── tests/
└── Anchor.toml
```
## 安装与运行

### 1. 克隆项目

```bash
git clone https://github.com/RuiLing-Su/staking-dapp.git
cd staking-dapp
```

### 2. 安装依赖

#### 安装前端依赖：

```bash
cd app
npm install
```

#### 编译合约：

```bash
cd programs/staking-dapp
anchor build
```

### 3. 运行项目

#### 启动前端

```bash
cd app
npm run dev
```

前端项目将会启动在 `http://localhost:3000` 或其他指定端口。

后端服务将根据智能合约部署和 IDL 文件与前端交互。

### 4. 部署智能合约

如果需要重新部署智能合约，可以按照以下步骤操作：

```bash
cd programs/staking-dapp
solana program deploy target/deploy/staking_dapp.so
```

根据不同的区块链平台，部署方式可能会有所不同，请根据项目需求进行修改。