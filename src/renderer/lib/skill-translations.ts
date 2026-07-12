// 技能名称和描述的中文翻译映射
export const skillTranslations: Record<string, { name?: string; description?: string }> = {
  // Claude Code 技能
  'code-review': { name: '代码审查', description: '审查代码质量、正确性和潜在问题' },
  'code-simplifier': { name: '代码简化', description: '简化代码结构，提高可读性和性能' },
  'feature-dev': { name: '功能开发', description: '协助开发新功能的完整流程' },
  'hookify': { name: '钩子管理', description: '创建和管理代码钩子' },
  'plugin-dev': { name: '插件开发', description: '开发和调试插件' },
  'skill-creator': { name: '技能创建', description: '创建新的技能模板' },
  'claude-code-setup': { name: 'Claude 配置', description: '配置 Claude Code 开发环境' },
  'claude-md-management': { name: '文档管理', description: '管理和优化 CLAUDE.md 文档' },
  'code-modernization': { name: '代码现代化', description: '将旧代码升级到现代标准' },
  'frontend-design': { name: '前端设计', description: 'UI/UX 设计和前端开发指导' },
  'pr-review-toolkit': { name: 'PR 审查', description: '代码审查和 Pull Request 检查' },
  'security-guidance': { name: '安全指导', description: '代码安全审查和漏洞检测' },
  'session-report': { name: '会话报告', description: '生成开发会话报告' },
  'mcp-server-dev': { name: 'MCP 开发', description: '开发 MCP 服务器' },
  'playground': { name: '实验场', description: '代码实验和测试环境' },
  'math-olympiad': { name: '数学竞赛', description: '数学问题求解和竞赛题' },
  'agent-sdk-dev': { name: 'SDK 开发', description: '开发 Agent SDK' },

  // MiMo Code 技能
  'csharp-winforms-compile': { name: 'C# WinForms 编译', description: '编译 C# Windows Forms 桌面应用' },
  'word-report-with-photos': { name: 'Word 图文报告', description: '生成带照片的 Word 文档报告' },

  // 通用描述翻译
  'deep-research': { name: '深度调研', description: '多源深度研究和报告生成' },
  'update-config': { name: '配置更新', description: '更新 Claude Code 配置和设置' },
  'keybindings-help': { name: '快捷键帮助', description: '自定义键盘快捷键' },
  'verify': { name: '验证', description: '验证代码更改是否正确' },
  'simplify': { name: '代码简化', description: '简化代码，提高质量' },
  'loop': { name: '循环执行', description: '定时循环执行任务' },
  'claude-api': { name: 'Claude API', description: '使用 Claude API 开发应用' },
  'init': { name: '初始化', description: '初始化项目配置' },
  'review': { name: '审查', description: '审查代码变更' },

  // 通用技能描述关键词翻译
  'hooks': { description: '钩子机制，自动执行预定义操作' },
  'subagents': { description: '子智能体，并行执行专门任务' },
  'skills': { description: '技能，打包的专业知识和工作流' },
  'plugins': { description: '插件，可安装的技能集合' },
  'MCP': { description: 'MCP 服务器，外部工具集成' },
}

// 翻译技能名称
export function translateSkillName(name: string): string {
  // 精确匹配
  if (skillTranslations[name]?.name) {
    return skillTranslations[name].name!
  }
  // 模糊匹配
  for (const [key, val] of Object.entries(skillTranslations)) {
    if (name.toLowerCase().includes(key.toLowerCase()) && val.name) {
      return val.name
    }
  }
  return name
}

// 翻译技能描述
export function translateSkillDescription(desc: string): string {
  if (!desc) return '暂无描述'

  // 精确匹配
  for (const [key, val] of Object.entries(skillTranslations)) {
    if (desc.toLowerCase().includes(key.toLowerCase()) && val.description) {
      return val.description
    }
  }

  // 如果描述已经是中文，直接返回
  if (/[\u4e00-\u9fa5]/.test(desc)) {
    return desc
  }

  // 英文描述添加中文提示
  return `${desc}`
}
