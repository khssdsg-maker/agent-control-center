// Agent 详细信息
export interface AgentInfo {
  id: string
  name: string
  icon: string
  description: string
  longDescription: string
  website: string
  installUrl: string
  installMethod: string
  features: string[]
  requirements: string[]
  category: 'cli' | 'desktop' | 'web'
}

export const agentInfos: Record<string, AgentInfo> = {
  mimocode: {
    id: 'mimocode',
    name: 'MiMo Code',
    icon: '🤖',
    description: '小米 MiMo 智能编程助手',
    longDescription: 'MiMo Code 是小米推出的智能编程助手，基于 MiMo 大模型，提供代码编写、调试、优化等功能。支持多种编程语言，能够理解项目上下文，提供精准的代码建议。',
    website: 'https://github.com/XiaoMi/mimo-code',
    installUrl: 'https://github.com/XiaoMi/mimo-code',
    installMethod: 'npm install -g @mimo-ai/cli',
    features: ['智能代码补全', '代码调试', '项目分析', 'Git 操作', '自动测试'],
    requirements: ['Node.js 18+', 'npm 或 yarn'],
    category: 'cli',
  },
  claude: {
    id: 'claude',
    name: 'Claude Code',
    icon: '🧠',
    description: 'Anthropic Claude 编程助手',
    longDescription: 'Claude Code 是 Anthropic 推出的 AI 编程助手，基于 Claude 大模型。提供代码编写、审查、调试、文档生成等功能，支持多种编程语言和开发框架。',
    website: 'https://github.com/anthropics/claude-code',
    installUrl: 'https://github.com/anthropics/claude-code',
    installMethod: 'npm install -g @anthropic-ai/claude-code',
    features: ['代码审查', '文档生成', '智能对话', '项目分析', '安全检查'],
    requirements: ['Node.js 18+', 'Anthropic API Key'],
    category: 'cli',
  },
  codex: {
    id: 'codex',
    name: 'OpenAI Codex',
    icon: '⚡',
    description: 'OpenAI Codex CLI 编程助手',
    longDescription: 'OpenAI Codex 是 OpenAI 推出的 AI 编程助手，基于 GPT 模型。提供代码生成、转换、优化等功能，支持多种编程语言。',
    website: 'https://github.com/openai/codex',
    installUrl: 'https://github.com/openai/codex',
    installMethod: 'npm install -g @openai/codex',
    features: ['代码生成', '代码转换', '代码优化', '智能补全', '多语言支持'],
    requirements: ['Node.js 18+', 'OpenAI API Key'],
    category: 'cli',
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee CLI',
    icon: '☕',
    description: 'Coffee CLI 命令行工具',
    longDescription: 'Coffee CLI 是一个轻量级的命令行工具，提供快速的开发辅助功能。',
    website: '',
    installUrl: '',
    installMethod: '下载安装包',
    features: ['命令行操作', '快速开发'],
    requirements: ['Windows 系统'],
    category: 'cli',
  },
  doubao: {
    id: 'doubao',
    name: '豆包',
    icon: '🫘',
    description: '字节跳动 AI 助手',
    longDescription: '豆包是字节跳动推出的 AI 助手，基于豆包大模型。提供对话、创作、翻译、知识问答等功能，支持多模态交互。',
    website: 'https://www.doubao.com',
    installUrl: 'https://www.doubao.com',
    installMethod: '访问官网下载桌面版',
    features: ['智能对话', '文本创作', '翻译', '知识问答', '多模态交互'],
    requirements: ['Windows/Mac/Linux'],
    category: 'desktop',
  },
  kimi: {
    id: 'kimi',
    name: 'Kimi',
    icon: '🌙',
    description: '月之暗面 AI 助手',
    longDescription: 'Kimi 是月之暗面推出的 AI 助手，基于 Kimi 大模型。支持超长文本处理、联网搜索、文件解析等功能。',
    website: 'https://kimi.moonshot.cn',
    installUrl: 'https://kimi.moonshot.cn',
    installMethod: '访问官网下载桌面版',
    features: ['超长文本处理', '联网搜索', '文件解析', '智能对话', '多模态'],
    requirements: ['Windows/Mac/Linux'],
    category: 'desktop',
  },
  qianwen: {
    id: 'qianwen',
    name: '千问',
    icon: '🔮',
    description: '阿里巴巴通义千问',
    longDescription: '通义千问是阿里巴巴推出的 AI 助手，基于千问大模型。提供对话、创作、分析等功能，支持多模态交互。',
    website: 'https://tongyi.aliyun.com',
    installUrl: 'https://tongyi.aliyun.com',
    installMethod: '访问官网下载桌面版',
    features: ['智能对话', '文本创作', '多模态', '知识问答', '代码生成'],
    requirements: ['Windows/Mac/Linux'],
    category: 'desktop',
  },
  yuanbao: {
    id: 'yuanbao',
    name: '腾讯元宝',
    icon: '💎',
    description: '腾讯 AI 助手',
    longDescription: '腾讯元宝是腾讯推出的 AI 助手，基于混元大模型。提供对话、创作、分析等功能。',
    website: 'https://yuanbao.tencent.com',
    installUrl: 'https://yuanbao.tencent.com',
    installMethod: '访问官网下载桌面版',
    features: ['智能对话', '文本创作', '知识问答', '多模态'],
    requirements: ['Windows/Mac/Linux'],
    category: 'desktop',
  },
  claw: {
    id: 'claw',
    name: '龙虾 (Claw)',
    icon: '🦞',
    description: 'WorkBuddy 智能编程助手',
    longDescription: '龙虾 (Claw) 是 WorkBuddy 推出的智能编程助手，提供代码编写、调试、优化等功能。',
    website: '',
    installUrl: '',
    installMethod: '通过 WorkBuddy 安装',
    features: ['代码编写', '调试', '优化'],
    requirements: ['WorkBuddy 环境'],
    category: 'cli',
  },
  antigravity: {
    id: 'antigravity',
    name: 'Antigravity',
    icon: '🌌',
    description: 'Google 反重力 AI 智能体',
    longDescription: 'Antigravity 是 Google 推出的 AI 智能体，提供多种 AI 能力。',
    website: '',
    installUrl: '',
    installMethod: '访问官网下载',
    features: ['AI 创作', '智能分析'],
    requirements: ['Windows 系统'],
    category: 'desktop',
  },
}

export function getAgentInfo(agentId: string): AgentInfo | null {
  return agentInfos[agentId] || null
}

export function getAllAgentInfos(): AgentInfo[] {
  return Object.values(agentInfos)
}
