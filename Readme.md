

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
├── app/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StakingDapp.tsx       # 主组件
│   │   │   ├── StatsCard.tsx         # 统计卡片组件
│   │   │   ├── StakingPackage.tsx    # 质押包组件
│   │   │   ├── ReferralPanel.tsx     # 推荐面板组件
│   │   │   ├── LevelGuide.tsx        # 等级指南组件
│   │   │   ├── RewardsPanel.tsx      # 奖励面板组件
│   │   │   ├── Notification.tsx      # 通知组件
│   │   │   └── ReferralSystem.tsx    # 推荐系统组件
│   │   ├── lib/
│   │   │   ├── staking-client.ts     # 合约交互
│   │   │   ├── config.ts             # 配置文件
│   │   │   ├── types.ts              # 类型定义
│   │   │   ├── useStaking.tsx        # 管理质押相关的状态和操作
│   │   │   └── useWallet.tsx         # 管理钱包连接状态
│   │   └── app/
│   │       └── page.tsx       # 启动
│   ├── public/
│   └── package.json
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