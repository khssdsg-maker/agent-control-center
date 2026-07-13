// 任务模板

export interface TaskTemplate {
  id: string
  name: string
  description: string
  agentId: string
  agentName: string
  agentIcon: string
  category: string
  input: string
}

export const taskTemplates: TaskTemplate[] = [
  // 代码相关
  {
    id: 'code-review',
    name: '代码审查',
    description: '审查代码质量、安全性和最佳实践',
    agentId: 'claude',
    agentName: 'Claude Code',
    agentIcon: '🧠',
    category: '代码',
    input: '审查当前项目的代码，检查质量、安全性和最佳实践',
  },
  {
    id: 'code-optimization',
    name: '代码优化',
    description: '优化代码性能和可读性',
    agentId: 'mimocode',
    agentName: 'MiMo Code',
    agentIcon: '🤖',
    category: '代码',
    input: '优化当前项目的代码，提高性能和可读性',
  },
  {
    id: 'debug-assist',
    name: '调试辅助',
    description: '帮助定位和修复 Bug',
    agentId: 'mimocode',
    agentName: 'MiMo Code',
    agentIcon: '🤖',
    category: '调试',
    input: '帮助调试当前项目的问题',
  },

  // 分析相关
  {
    id: 'project-analysis',
    name: '项目分析',
    description: '分析项目结构和架构',
    agentId: 'claude',
    agentName: 'Claude Code',
    agentIcon: '🧠',
    category: '分析',
    input: '分析当前项目的结构、架构和技术栈',
  },
  {
    id: 'security-audit',
    name: '安全审计',
    description: '检查代码安全漏洞',
    agentId: 'claude',
    agentName: 'Claude Code',
    agentIcon: '🧠',
    category: '分析',
    input: '对当前项目进行安全审计，检查潜在漏洞',
  },

  // 部署相关
  {
    id: 'deploy-prep',
    name: '部署准备',
    description: '准备项目部署配置',
    agentId: 'mimocode',
    agentName: 'MiMo Code',
    agentIcon: '🤖',
    category: '部署',
    input: '准备项目的部署配置，包括环境变量和构建脚本',
  },
  {
    id: 'docker-setup',
    name: 'Docker 配置',
    description: '创建 Docker 配置文件',
    agentId: 'claude',
    agentName: 'Claude Code',
    agentIcon: '🧠',
    category: '部署',
    input: '为项目创建 Dockerfile 和 docker-compose.yml',
  },

  // 文档相关
  {
    id: 'readme-gen',
    name: 'README 生成',
    description: '生成项目 README 文档',
    agentId: 'claude',
    agentName: 'Claude Code',
    agentIcon: '🧠',
    category: '其他',
    input: '为当前项目生成 README.md 文档',
  },
  {
    id: 'api-docs',
    name: 'API 文档',
    description: '生成 API 接口文档',
    agentId: 'claude',
    agentName: 'Claude Code',
    agentIcon: '🧠',
    category: '其他',
    input: '为项目生成 API 接口文档',
  },

  // 测试相关
  {
    id: 'unit-test',
    name: '单元测试',
    description: '编写单元测试用例',
    agentId: 'mimocode',
    agentName: 'MiMo Code',
    agentIcon: '🤖',
    category: '自动化',
    input: '为当前项目的核心模块编写单元测试',
  },
  {
    id: 'test-coverage',
    name: '测试覆盖率',
    description: '检查测试覆盖率并补充测试',
    agentId: 'claude',
    agentName: 'Claude Code',
    agentIcon: '🧠',
    category: '自动化',
    input: '检查项目的测试覆盖率，补充缺失的测试用例',
  },
]

export function getTemplatesByCategory(category: string): TaskTemplate[] {
  if (category === '全部') return taskTemplates
  return taskTemplates.filter((t) => t.category === category)
}

export function getTemplateById(id: string): TaskTemplate | undefined {
  return taskTemplates.find((t) => t.id === id)
}
