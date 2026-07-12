// 简化版：使用内存数据存储，避免 sql.js WASM 加载问题

export interface Agent {
  id: string
  name: string
  description: string
  icon: string
  type: string
  status: string
  executablePath: string | null
  configPath: string | null
  dataPath: string | null
  cpu_usage: number
  memory_usage: number
}

export interface Skill {
  id: string
  agent_id: string
  name: string
  description: string
  category: string
  is_builtin: number
}

// 内存数据存储
let agents: Agent[] = []
let skills: Skill[] = []
let initialized = false

export function initDatabase(): void {
  if (initialized) return

  // 初始化 Agent 数据（由扫描器提供真实数据，这里只初始化默认值）
  agents = []
  skills = [
    // MiMo Code 技能
    { id: 'mimocode-代码编写', agent_id: 'mimocode', name: '代码编写', description: '编写和修改代码', category: '代码', is_builtin: 1 },
    { id: 'mimocode-代码调试', agent_id: 'mimocode', name: '代码调试', description: '查找和修复 Bug', category: '调试', is_builtin: 1 },
    { id: 'mimocode-项目分析', agent_id: 'mimocode', name: '项目分析', description: '分析项目结构和架构', category: '分析', is_builtin: 1 },
    { id: 'mimocode-Git 操作', agent_id: 'mimocode', name: 'Git 操作', description: '版本控制和代码提交', category: '自动化', is_builtin: 1 },
    { id: 'mimocode-自动测试', agent_id: 'mimocode', name: '自动测试', description: '编写和运行测试', category: '自动化', is_builtin: 1 },

    // Claude Code 技能
    { id: 'claude-智能对话', agent_id: 'claude', name: '智能对话', description: '高质量多轮对话', category: '其他', is_builtin: 1 },
    { id: 'claude-文档生成', agent_id: 'claude', name: '文档生成', description: '生成技术文档', category: '代码', is_builtin: 1 },
    { id: 'claude-代码审查', agent_id: 'claude', name: '代码审查', description: '审查代码质量和安全性', category: '调试', is_builtin: 1 },

    // Codex 技能
    { id: 'codex-代码补全', agent_id: 'codex', name: '代码补全', description: '智能代码补全建议', category: '代码', is_builtin: 1 },
    { id: 'codex-代码转换', agent_id: 'codex', name: '代码转换', description: '语言间代码转换', category: '代码', is_builtin: 1 },

    // 豆包技能
    { id: 'doubao-文本创作', agent_id: 'doubao', name: '文本创作', description: '创作各类文本内容', category: '其他', is_builtin: 1 },
    { id: 'doubao-知识问答', agent_id: 'doubao', name: '知识问答', description: '回答各类知识问题', category: '分析', is_builtin: 1 },
    { id: 'doubao-翻译', agent_id: 'doubao', name: '翻译', description: '多语言翻译', category: '其他', is_builtin: 1 },

    // Kimi 技能
    { id: 'kimi-长文阅读', agent_id: 'kimi', name: '长文阅读', description: '阅读和总结长文档', category: '分析', is_builtin: 1 },
    { id: 'kimi-联网搜索', agent_id: 'kimi', name: '联网搜索', description: '实时联网搜索信息', category: '自动化', is_builtin: 1 },
    { id: 'kimi-文件解析', agent_id: 'kimi', name: '文件解析', description: '解析 PDF、Word 等文件', category: '分析', is_builtin: 1 },

    // 龙虾技能
    { id: 'claw-工作流自动化', agent_id: 'claw', name: '工作流自动化', description: '自动化重复工作流程', category: '自动化', is_builtin: 1 },
    { id: 'claw-定时任务', agent_id: 'claw', name: '定时任务', description: '设置定时执行任务', category: '自动化', is_builtin: 1 },
    { id: 'claw-多步骤执行', agent_id: 'claw', name: '多步骤执行', description: '执行复杂多步骤任务', category: '自动化', is_builtin: 1 },

    // Antigravity 技能
    { id: 'antigravity-AI 创作', agent_id: 'antigravity', name: 'AI 创作', description: 'AI 辅助内容创作', category: '其他', is_builtin: 1 },
    { id: 'antigravity-智能分析', agent_id: 'antigravity', name: '智能分析', description: '智能数据分析和洞察', category: '分析', is_builtin: 1 },
  ]

  initialized = true
}

// Agent 操作
export function getAllAgents(): Agent[] {
  return agents
}

export function setAgents(data: Agent[]) {
  agents = data
}

export function updateAgentMetrics(id: string, cpu: number, mem: number) {
  const agent = agents.find((a) => a.id === id)
  if (agent) {
    agent.cpu_usage = cpu
    agent.memory_usage = mem
  }
}

// Skill 操作
export function getAllSkills(): Skill[] {
  return skills
}

export function getSkillsByAgent(agentId: string): Skill[] {
  return skills.filter((s) => s.agent_id === agentId)
}

export function addSkill(skill: Omit<Skill, 'id'>): Skill {
  const newSkill: Skill = {
    ...skill,
    id: `${skill.agent_id}-${skill.name}-${Date.now()}`
  }
  skills.push(newSkill)
  return newSkill
}

export function deleteSkill(id: string) {
  skills = skills.filter((s) => s.id !== id)
}

export function updateSkill(id: string, updates: Partial<Pick<Skill, 'name' | 'description' | 'category'>>) {
  const skill = skills.find((s) => s.id === id)
  if (skill) {
    Object.assign(skill, updates)
  }
}
