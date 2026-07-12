// 技能翻译映射 - 使用技能名称作为 key，描述作为 value
export const skillTranslations: Record<string, { name: string; description: string }> = {
  // ===== Claude Code 技能 =====
  'claude-automation-recommender': { name: '自动化推荐', description: '分析代码库，推荐 Claude Code 自动化方案，包括钩子、子智能体、技能、插件和 MCP 服务器' },
  'claude-md-improver': { name: '文档优化', description: '审计和优化仓库中的 CLAUDE.md 配置文件，提升开发体验' },
  'cardputer-buddy': { name: 'Cardputer 开发', description: '迭代开发 Cardputer-Adv MicroPython 应用程序' },
  'm5-onboard': { name: 'M5Stack 入门', description: 'M5Stack ESP32 设备的端到端入门指导和配置' },
  'example-command': { name: '示例命令', description: '演示前置配置的示例用户命令模板' },
  'example-skill': { name: '示例技能', description: '演示技能创建的示例模板' },
  'frontend-design': { name: '前端设计', description: '创建独特、专业的前端界面，涵盖美学方向、排版和环境约束' },
  'writing-hookify-rules': { name: '钩子规则编写', description: '编写和管理代码钩子规则' },
  'math-olympiad': { name: '数学竞赛', description: '解决竞赛数学问题，包括 IMO、Putnam、USAMO、AIME 等' },
  'build-mcp-app': { name: 'MCP 应用构建', description: '构建 MCP (Model Context Protocol) 应用程序' },
  'build-mcp-server': { name: 'MCP 服务器构建', description: '构建 MCP 服务器，实现工具集成' },
  'build-mcpb': { name: 'MCPB 构建', description: '构建 MCPB 包格式的工具' },
  'playground': { name: '实验场', description: '创建交互式 HTML 实验场，自包含的单页应用' },
  'agent-development': { name: '智能体开发', description: '开发和调试 AI Agent 智能体' },
  'command-development': { name: '命令开发', description: '开发和调试命令行工具和命令' },
  'hook-development': { name: '钩子开发', description: '开发和调试钩子机制，实现自动化' },
  'mcp-integration': { name: 'MCP 集成', description: '集成 MCP 服务器和外部工具' },
  'plugin-settings': { name: '插件设置', description: '管理插件配置和设置选项' },
  'plugin-structure': { name: '插件结构', description: '创建和管理插件项目结构' },
  'skill-development': { name: '技能开发', description: '开发新的技能模板和可重复工作流' },
  'session-report': { name: '会话报告', description: '生成 Claude Code 会话的可探索 HTML 报告' },
  'skill-creator': { name: '技能创建器', description: '创建新技能、修改和改进现有技能' },
  'code-modernization': { name: '代码现代化', description: '将旧代码升级到现代标准和最佳实践' },
  'code-review': { name: '代码审查', description: '审查代码的正确性、Bug 和优化机会' },
  'code-simplifier': { name: '代码简化', description: '简化代码结构，提高可读性和性能' },
  'feature-dev': { name: '功能开发', description: '协助开发新功能的完整流程' },
  'hookify': { name: '钩子管理', description: '创建和管理代码钩子' },
  'plugin-dev': { name: '插件开发', description: '开发和调试插件' },
  'claude-code-setup': { name: 'Claude 配置', description: '配置 Claude Code 开发环境' },
  'claude-md-management': { name: '文档管理', description: '管理和优化 CLAUDE.md 文档' },
  'frontend-design-skill': { name: '前端设计', description: 'UI/UX 设计和前端开发指导' },
  'pr-review-toolkit': { name: 'PR 审查', description: '代码审查和 Pull Request 检查' },
  'security-guidance': { name: '安全指导', description: '代码安全审查和漏洞检测' },
  'playground-skill': { name: '实验场', description: '代码实验和测试环境' },
  'math-olympiad-skill': { name: '数学竞赛', description: '数学问题求解和竞赛题' },
  'agent-sdk-dev': { name: 'SDK 开发', description: '开发 Agent SDK' },
  'clangd-lsp': { name: 'Clangd LSP', description: 'C/C++ 语言服务器协议支持' },
  'gopls-lsp': { name: 'Gopls LSP', description: 'Go 语言服务器协议支持' },
  'jdtls-lsp': { name: 'JDTLS LSP', description: 'Java 语言服务器协议支持' },
  'kotlin-lsp': { name: 'Kotlin LSP', description: 'Kotlin 语言服务器协议支持' },
  'lua-lsp': { name: 'Lua LSP', description: 'Lua 语言服务器协议支持' },
  'php-lsp': { name: 'PHP LSP', description: 'PHP 语言服务器协议支持' },
  'pyright-lsp': { name: 'Pyright LSP', description: 'Python 类型检查语言服务器' },
  'ruby-lsp': { name: 'Ruby LSP', description: 'Ruby 语言服务器协议支持' },
  'rust-analyzer-lsp': { name: 'Rust Analyzer', description: 'Rust 语言分析器' },
  'swift-lsp': { name: 'Swift LSP', description: 'Swift 语言服务器协议支持' },
  'typescript-lsp': { name: 'TypeScript LSP', description: 'TypeScript 语言服务器协议支持' },
  'commit-commands': { name: '提交命令', description: 'Git 提交相关命令' },
  'ralph-loop': { name: '循环任务', description: '定时循环执行任务' },
  'cwc-makers': { name: 'CWC 创客', description: 'CWC 创客项目开发' },
  'mcp-tunnels': { name: 'MCP 隧道', description: '创建 MCP 隧道连接' },
  'review': { name: '审查', description: '审查代码变更' },
  'verify': { name: '验证', description: '验证代码更改是否正确' },
  'simplify': { name: '简化', description: '简化代码，提高质量' },
  'init': { name: '初始化', description: '初始化项目配置' },
  'loop': { name: '循环', description: '定时循环执行任务' },
  'claude-api': { name: 'Claude API', description: '使用 Claude API 开发应用' },
  'update-config': { name: '配置更新', description: '更新 Claude Code 配置和设置' },
  'keybindings-help': { name: '快捷键帮助', description: '自定义键盘快捷键' },
  'fewer-permission-prompts': { name: '减少权限提示', description: '优化权限配置，减少提示次数' },

  // ===== MiMo Code 技能 =====
  'csharp-winforms-compile': { name: 'C# WinForms 编译', description: '编译 C# Windows Forms 桌面应用，支持中文界面' },
  'word-report-with-photos': { name: 'Word 图文报告', description: '生成带照片的 Word 文档报告，适用于学术文档' },

  // ===== 外部插件技能 =====
  'discord-access': { name: 'Discord 访问', description: '配置 Discord 集成访问权限' },
  'discord-configure': { name: 'Discord 配置', description: '配置 Discord 机器人和频道' },
  'imessage-access': { name: 'iMessage 访问', description: '配置 iMessage 消息访问权限' },
  'imessage-configure': { name: 'iMessage 配置', description: '配置 iMessage 集成' },
  'telegram-access': { name: 'Telegram 访问', description: '配置 Telegram 访问权限' },
  'telegram-configure': { name: 'Telegram 配置', description: '配置 Telegram 机器人' },
}

// 翻译技能名称和描述
export function translateSkill(skillName: string): { name: string; description: string } {
  // 精确匹配
  if (skillTranslations[skillName]) {
    return skillTranslations[skillName]
  }

  // 模糊匹配（处理带前缀的情况，如 claude-code-setup-skill）
  for (const [key, val] of Object.entries(skillTranslations)) {
    if (skillName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(skillName.toLowerCase())) {
      return val
    }
  }

  // 未找到翻译，返回原始名称
  return { name: skillName, description: '' }
}

// 翻译技能名称
export function translateSkillName(name: string): string {
  return translateSkill(name).name
}

// 翻译技能描述
export function translateSkillDescription(skillName: string, originalDesc: string): string {
  const translated = translateSkill(skillName)
  if (translated.description) {
    return translated.description
  }
  // 如果没有翻译，返回原始描述
  return originalDesc || '暂无描述'
}
