// Agent 一键安装方法（国内环境，多种安装方式）
export interface InstallMethod {
  agentId: string
  methods: InstallOption[]
  notes: string[]
}

export interface InstallOption {
  name: string
  description: string
  steps: string[]
  commands: string[]
  url?: string
}

export const installMethods: Record<string, InstallMethod> = {
  mimocode: {
    agentId: 'mimocode',
    methods: [
      {
        name: 'npm 安装（推荐）',
        description: '使用 npm 全局安装',
        steps: ['安装 Node.js 18+', '运行安装命令', '验证安装'],
        commands: ['npm install -g @mimo-ai/cli', 'mimo --version'],
      },
      {
        name: 'pnpm 安装',
        description: '使用 pnpm 全局安装',
        steps: ['安装 Node.js 18+', '安装 pnpm', '运行安装命令'],
        commands: ['npm install -g pnpm', 'pnpm install -g @mimo-ai/cli'],
      },
      {
        name: 'GitHub 源码安装',
        description: '从 GitHub 克隆源码安装',
        steps: ['克隆仓库', '安装依赖', '链接到全局'],
        commands: ['git clone https://github.com/XiaoMi/mimo-code.git', 'cd mimo-code && npm install && npm link'],
        url: 'https://github.com/XiaoMi/mimo-code',
      },
    ],
    notes: ['需要 Node.js 18+', '国内可使用 npmmirror 加速', '安装后运行 mimo 启动'],
  },
  claude: {
    agentId: 'claude',
    methods: [
      {
        name: 'npm 安装（推荐）',
        description: '使用 npm 全局安装',
        steps: ['安装 Node.js 18+', '运行安装命令', '配置 API Key'],
        commands: ['npm install -g @anthropic-ai/claude-code', 'claude --version'],
      },
      {
        name: 'GitHub 源码安装',
        description: '从 GitHub 克隆源码安装',
        steps: ['克隆仓库', '安装依赖', '链接到全局'],
        commands: ['git clone https://github.com/anthropics/claude-code.git', 'cd claude-code && npm install && npm link'],
        url: 'https://github.com/anthropics/claude-code',
      },
    ],
    notes: ['需要 Node.js 18+', '需要 Anthropic API Key', '安装后运行 claude 启动'],
  },
  codex: {
    agentId: 'codex',
    methods: [
      {
        name: 'npm 安装（推荐）',
        description: '使用 npm 全局安装',
        steps: ['安装 Node.js 18+', '运行安装命令', '配置 API Key'],
        commands: ['npm install -g @openai/codex', 'codex --version'],
      },
      {
        name: 'GitHub 源码安装',
        description: '从 GitHub 克隆源码安装',
        steps: ['克隆仓库', '安装依赖', '链接到全局'],
        commands: ['git clone https://github.com/openai/codex.git', 'cd codex && npm install && npm link'],
        url: 'https://github.com/openai/codex',
      },
    ],
    notes: ['需要 Node.js 18+', '需要 OpenAI API Key', '安装后运行 codex 启动'],
  },
  doubao: {
    agentId: 'doubao',
    methods: [
      {
        name: '官网下载（推荐）',
        description: '访问豆包官网下载桌面版',
        steps: ['访问官网', '下载安装包', '运行安装程序'],
        commands: [],
        url: 'https://www.doubao.com',
      },
      {
        name: '应用商店',
        description: '通过 Windows/Mac 应用商店安装',
        steps: ['打开应用商店', '搜索豆包', '点击安装'],
        commands: [],
      },
    ],
    notes: ['免费使用', '支持 Windows/Mac/Linux', '国产应用，速度快'],
  },
  kimi: {
    agentId: 'kimi',
    methods: [
      {
        name: '官网下载（推荐）',
        description: '访问 Kimi 官网下载桌面版',
        steps: ['访问官网', '下载安装包', '运行安装程序'],
        commands: [],
        url: 'https://kimi.moonshot.cn',
      },
      {
        name: '应用商店',
        description: '通过 Windows/Mac 应用商店安装',
        steps: ['打开应用商店', '搜索 Kimi', '点击安装'],
        commands: [],
      },
    ],
    notes: ['免费使用', '支持 Windows/Mac/Linux', '国产应用，速度快'],
  },
  qianwen: {
    agentId: 'qianwen',
    methods: [
      {
        name: '官网下载（推荐）',
        description: '访问通义千问官网下载桌面版',
        steps: ['访问官网', '下载安装包', '运行安装程序'],
        commands: [],
        url: 'https://tongyi.aliyun.com',
      },
      {
        name: '应用商店',
        description: '通过 Windows/Mac 应用商店安装',
        steps: ['打开应用商店', '搜索通义千问', '点击安装'],
        commands: [],
      },
    ],
    notes: ['免费使用', '支持 Windows/Mac/Linux', '国产应用，速度快'],
  },
  yuanbao: {
    agentId: 'yuanbao',
    methods: [
      {
        name: '官网下载（推荐）',
        description: '访问腾讯元宝官网下载桌面版',
        steps: ['访问官网', '下载安装包', '运行安装程序'],
        commands: [],
        url: 'https://yuanbao.tencent.com',
      },
      {
        name: '应用商店',
        description: '通过 Windows/Mac 应用商店安装',
        steps: ['打开应用商店', '搜索腾讯元宝', '点击安装'],
        commands: [],
      },
    ],
    notes: ['免费使用', '支持 Windows/Mac/Linux', '国产应用，速度快'],
  },
  coffee: {
    agentId: 'coffee',
    methods: [
      {
        name: '下载安装包',
        description: '下载 Coffee CLI 安装包',
        steps: ['下载安装包', '运行安装程序'],
        commands: [],
      },
    ],
    notes: ['需要下载安装包', '支持 Windows'],
  },
  claw: {
    agentId: 'claw',
    methods: [
      {
        name: '通过 WorkBuddy 安装',
        description: '先安装 WorkBuddy，再安装 Claw',
        steps: ['安装 WorkBuddy', '通过 WorkBuddy 安装 Claw'],
        commands: [],
      },
    ],
    notes: ['需要先安装 WorkBuddy', '通过 WorkBuddy 管理安装'],
  },
  antigravity: {
    agentId: 'antigravity',
    methods: [
      {
        name: '下载安装包',
        description: '访问 Antigravity 官网下载',
        steps: ['访问官网', '下载安装包', '运行安装程序'],
        commands: [],
      },
    ],
    notes: ['需要下载安装包', '支持 Windows'],
  },
}

export function getInstallMethod(agentId: string): InstallMethod | null {
  return installMethods[agentId] || null
}
