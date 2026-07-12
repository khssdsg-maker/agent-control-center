# Agent Control Center

AI Agent 统一管理控制面板 - 一站式管理你电脑上所有的 AI 智能体软件。

## 功能特性

### 智能扫描
- 自动检测电脑已安装的 AI Agent
- 支持 10 种 Agent：MiMo Code、Claude Code、OpenAI Codex、Coffee CLI、豆包、Kimi、千问、腾讯元宝、龙虾 (Claw)、Antigravity
- 实时显示安装状态

### 状态监控
- CPU 使用率监控
- 内存占用监控
- 磁盘空间占用
- 系统资源总览

### 技能管理
- 每个 Agent 独立的技能展示
- 22 个预置技能
- 支持添加、编辑、删除自定义技能
- 按分类筛选（代码、调试、部署、分析、自动化）

### Agent 调用终端
- 在应用内直接调用 Agent
- 模拟对话交互
- 命令行式操作界面

### 聊天记录
- 统一查看所有 Agent 的对话历史
- 支持搜索和收藏

## 技术栈

| 技术 | 说明 |
|------|------|
| Electron | 桌面应用框架 |
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| TailwindCSS | 样式系统 |
| Vite | 构建工具 |
| electron-vite | Electron + Vite 集成 |

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建打包
```bash
# 构建前端
npm run build

# 打包为可执行文件
npm run pack

# 生成安装包
npm run dist
```

## 项目结构

```
agent-control-center/
├── electron/                    # Electron 主进程
│   ├── main.ts                 # 主进程入口
│   ├── preload.ts              # 预加载脚本
│   └── scanner/                # Agent 扫描器
│       └── index.ts
├── src/renderer/                # React 前端
│   ├── components/
│   │   ├── layout/             # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── StatusBar.tsx
│   │   └── ui/                 # 基础 UI 组件
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Badge.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx       # 仪表盘
│   │   ├── SkillsPage.tsx      # 技能管理
│   │   ├── ChatPage.tsx        # 聊天记录
│   │   └── AgentDetailPage.tsx # Agent 详情
│   ├── lib/
│   │   ├── db/                 # 数据存储
│   │   └── monitor.ts          # 资源监控
│   └── styles/
│       └── globals.css         # 全局样式
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 截图

> 界面采用暗色主题设计，参考 VS Code / Raycast 风格

## 支持的 Agent

| Agent | 类型 | 说明 |
|-------|------|------|
| MiMo Code | CLI | 小米 MiMo 智能编程助手 |
| Claude Code | CLI | Anthropic Claude 编程助手 |
| OpenAI Codex | CLI | OpenAI Codex CLI 编程助手 |
| Coffee CLI | CLI | Coffee CLI 命令行工具 |
| 豆包 | 桌面 | 字节跳动 AI 助手 |
| Kimi | 桌面 | 月之暗面 AI 助手 |
| 千问 | 桌面 | 阿里巴巴通义千问 |
| 腾讯元宝 | 桌面 | 腾讯 AI 助手 |
| 龙虾 (Claw) | CLI | WorkBuddy 智能编程助手 |
| Antigravity | 桌面 | Google 反重力 AI 智能体 |

## 开源协议

MIT License

## 联系方式

- GitHub: [@khssdsg-maker](https://github.com/khssdsg-maker)
