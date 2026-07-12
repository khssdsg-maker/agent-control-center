import { execSync } from 'child_process'
import { existsSync } from 'fs'

export interface DetectedAgent {
  id: string
  name: string
  description: string
  icon: string
  type: 'cli' | 'desktop' | 'web'
  status: 'online' | 'idle' | 'offline'
  executablePath: string | null
  configPath: string | null
  dataPath: string | null
  diskSpace: number
  launchCommand: string | null
  chatSessionPath: string | null
}

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim()
  } catch {
    return ''
  }
}

function fileExists(p: string): boolean {
  try { return existsSync(p) } catch { return false }
}

function getDirSizeMB(dirPath: string): number {
  try {
    const output = run(`powershell -Command "(Get-ChildItem -Path '${dirPath}' -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB"`)
    return Math.round(parseFloat(output) || 0)
  } catch { return 0 }
}

export function detectAgents(): DetectedAgent[] {
  const agents: DetectedAgent[] = []
  const homedir = process.env.USERPROFILE || process.env.HOME || ''

  // 1. MiMo Code
  const mimoCmd = `${homedir}/AppData/Roaming/npm/mimo.cmd`
  const mimoConfig = `${homedir}/.mimocode`
  const mimoDesktop = `${homedir}/Desktop/.mimocode`
  const mimoInstalled = fileExists(mimoCmd)
  const mimoConfigExists = fileExists(mimoConfig) || fileExists(mimoDesktop)
  const mimoSessions = `${homedir}/.local/share/mimocode/memory/sessions`
  agents.push({
    id: 'mimocode',
    name: 'MiMo Code',
    description: '小米 MiMo 智能编程助手',
    icon: '🤖',
    type: 'cli',
    status: mimoInstalled ? 'idle' : 'offline',
    executablePath: mimoInstalled ? mimoCmd : null,
    configPath: mimoConfigExists ? (fileExists(mimoConfig) ? mimoConfig : mimoDesktop) : null,
    dataPath: mimoConfigExists ? (fileExists(mimoConfig) ? mimoConfig : mimoDesktop) : null,
    diskSpace: mimoConfigExists ? getDirSizeMB(fileExists(mimoConfig) ? mimoConfig : mimoDesktop) : 0,
    launchCommand: mimoInstalled ? 'mimo' : null,
    chatSessionPath: fileExists(mimoSessions) ? mimoSessions : null,
  })

  // 2. Claude Code
  const claudeCmd = `${homedir}/.local/bin/claude`
  const claudeConfig = `${homedir}/.claude`
  const claudeInstalled = fileExists(claudeCmd) || !!run('where claude 2>nul')
  const claudeProjects = `${homedir}/.claude/projects`
  agents.push({
    id: 'claude',
    name: 'Claude Code',
    description: 'Anthropic Claude 编程助手',
    icon: '🧠',
    type: 'cli',
    status: claudeInstalled ? 'idle' : 'offline',
    executablePath: claudeInstalled ? claudeCmd : null,
    configPath: fileExists(claudeConfig) ? claudeConfig : null,
    dataPath: fileExists(claudeConfig) ? claudeConfig : null,
    diskSpace: fileExists(claudeConfig) ? getDirSizeMB(claudeConfig) : 0,
    launchCommand: claudeInstalled ? 'claude' : null,
    chatSessionPath: fileExists(claudeProjects) ? claudeProjects : null,
  })

  // 3. OpenAI Codex
  const codexNpmDir = `${homedir}/AppData/Roaming/npm/node_modules/@openai/codex`
  const codexLocalDir = `${homedir}/AppData/Local/OpenAI/Codex`
  const codexInstalled = fileExists(codexNpmDir) || fileExists(codexLocalDir) || !!run('where codex 2>nul')
  const codexPath = codexInstalled ? (fileExists(codexLocalDir) ? `${codexLocalDir}/bin` : run('where codex 2>nul')) : null
  agents.push({
    id: 'codex',
    name: 'OpenAI Codex',
    description: 'OpenAI Codex CLI 编程助手',
    icon: '⚡',
    type: 'cli',
    status: codexInstalled ? 'idle' : 'offline',
    executablePath: codexPath,
    configPath: fileExists(codexNpmDir) ? codexNpmDir : null,
    dataPath: fileExists(codexLocalDir) ? codexLocalDir : null,
    diskSpace: fileExists(codexLocalDir) ? getDirSizeMB(codexLocalDir) : (fileExists(codexNpmDir) ? getDirSizeMB(codexNpmDir) : 0),
    launchCommand: codexInstalled ? 'codex' : null,
    chatSessionPath: null,
  })

  // 4. Coffee CLI
  const coffeePath = `${homedir}/AppData/Local/Coffee CLI/coffee-cli.exe`
  const coffeeDir = `${homedir}/AppData/Local/Coffee CLI`
  agents.push({
    id: 'coffee',
    name: 'Coffee CLI',
    description: 'Coffee CLI 命令行工具',
    icon: '☕',
    type: 'cli',
    status: fileExists(coffeePath) ? 'idle' : 'offline',
    executablePath: fileExists(coffeePath) ? coffeePath : null,
    configPath: null,
    dataPath: fileExists(coffeeDir) ? coffeeDir : null,
    diskSpace: fileExists(coffeeDir) ? getDirSizeMB(coffeeDir) : 0,
    launchCommand: fileExists(coffeePath) ? `"${coffeePath}"` : null,
    chatSessionPath: null,
  })

  // 5. 豆包 (Doubao)
  const doubaoPath = `${homedir}/AppData/Local/Doubao/Application/Doubao.exe`
  const doubaoData = `${homedir}/AppData/Local/Doubao`
  agents.push({
    id: 'doubao',
    name: '豆包',
    description: '字节跳动 AI 助手',
    icon: '🫘',
    type: 'desktop',
    status: fileExists(doubaoPath) ? 'idle' : 'offline',
    executablePath: fileExists(doubaoPath) ? doubaoPath : null,
    configPath: null,
    dataPath: fileExists(doubaoData) ? doubaoData : null,
    diskSpace: fileExists(doubaoData) ? getDirSizeMB(doubaoData) : 0,
    launchCommand: fileExists(doubaoPath) ? `"${doubaoPath}"` : null,
    chatSessionPath: null,
  })

  // 6. Kimi
  const kimiPath = 'C:/Program Files/Kimi智能助手/Kimi智能助手.exe'
  const kimiDir = 'C:/Program Files/Kimi智能助手'
  const kimiData = `${homedir}/AppData/Local/KimiAppCache`
  agents.push({
    id: 'kimi',
    name: 'Kimi',
    description: '月之暗面 AI 助手',
    icon: '🌙',
    type: 'desktop',
    status: fileExists(kimiPath) ? 'idle' : 'offline',
    executablePath: fileExists(kimiPath) ? kimiPath : null,
    configPath: null,
    dataPath: fileExists(kimiData) ? kimiData : null,
    diskSpace: fileExists(kimiDir) ? getDirSizeMB(kimiDir) : 0,
    launchCommand: fileExists(kimiPath) ? `"${kimiPath}"` : null,
    chatSessionPath: fileExists(kimiData) ? kimiData : null,
  })

  // 7. 千问 (Qianwen)
  const qianwenData = `${homedir}/AppData/Local/Qianwen`
  const qianwenExe = `${homedir}/AppData/Local/Qianwen/app-*/Qianwen.exe`
  agents.push({
    id: 'qianwen',
    name: '千问',
    description: '阿里巴巴通义千问',
    icon: '🔮',
    type: 'desktop',
    status: fileExists(qianwenData) ? 'idle' : 'offline',
    executablePath: null,
    configPath: null,
    dataPath: fileExists(qianwenData) ? qianwenData : null,
    diskSpace: fileExists(qianwenData) ? getDirSizeMB(qianwenData) : 0,
    launchCommand: fileExists(qianwenData) ? `start "" "${qianwenExe}"` : null,
    chatSessionPath: fileExists(qianwenData) ? qianwenData : null,
  })

  // 8. 腾讯元宝 (Yuanbao)
  const yuanbaoPath = 'C:/Program Files/Tencent/Yuanbao/yuanbao.exe'
  const yuanbaoDir = 'C:/Program Files/Tencent/Yuanbao'
  agents.push({
    id: 'yuanbao',
    name: '腾讯元宝',
    description: '腾讯 AI 助手',
    icon: '💎',
    type: 'desktop',
    status: fileExists(yuanbaoPath) ? 'idle' : 'offline',
    executablePath: fileExists(yuanbaoPath) ? yuanbaoPath : null,
    configPath: null,
    dataPath: null,
    diskSpace: fileExists(yuanbaoDir) ? getDirSizeMB(yuanbaoDir) : 0,
    launchCommand: fileExists(yuanbaoPath) ? `"${yuanbaoPath}"` : null,
    chatSessionPath: null,
  })

  // 9. 龙虾 (Claw / WorkBuddy)
  const clawPath = `${homedir}/WorkBuddy/Claw`
  const clawConfig = `${homedir}/.workbuddy`
  agents.push({
    id: 'claw',
    name: '龙虾 (Claw)',
    description: 'WorkBuddy 智能编程助手',
    icon: '🦞',
    type: 'cli',
    status: fileExists(clawPath) ? 'idle' : 'offline',
    executablePath: fileExists(clawPath) ? clawPath : null,
    configPath: fileExists(clawConfig) ? clawConfig : null,
    dataPath: fileExists(clawPath) ? clawPath : null,
    diskSpace: fileExists(clawConfig) ? getDirSizeMB(clawConfig) : 0,
    launchCommand: fileExists(clawPath) ? `cd "${clawPath}" && claude` : null,
    chatSessionPath: fileExists(clawConfig) ? clawConfig : null,
  })

  // 10. Google Antigravity
  const antigravityPath = `${homedir}/AppData/Local/Programs/antigravity/Antigravity.exe`
  const antigravityDir = `${homedir}/AppData/Local/Programs/antigravity`
  const antigravityData = `${homedir}/AppData/Roaming/Antigravity`
  agents.push({
    id: 'antigravity',
    name: 'Antigravity',
    description: 'Google 反重力 AI 智能体',
    icon: '🌌',
    type: 'desktop',
    status: fileExists(antigravityPath) ? 'idle' : 'offline',
    executablePath: fileExists(antigravityPath) ? antigravityPath : null,
    configPath: null,
    dataPath: fileExists(antigravityData) ? antigravityData : null,
    diskSpace: fileExists(antigravityDir) ? getDirSizeMB(antigravityDir) : 0,
    launchCommand: fileExists(antigravityPath) ? `"${antigravityPath}"` : null,
    chatSessionPath: fileExists(antigravityData) ? antigravityData : null,
  })

  return agents
}
