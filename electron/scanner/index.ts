import { execSync } from 'child_process'
import { existsSync } from 'fs'

export interface DetectedAgent {
  id: string
  name: string
  description: string
  icon: string
  iconPath: string | null
  type: 'cli' | 'desktop' | 'web'
  status: 'online' | 'idle' | 'running' | 'offline'
  executablePath: string | null
  configPath: string | null
  dataPath: string | null
  diskSpace: number
  memoryUsage: number  // 内存使用量（MB）
  launchCommand: string | null
  chatSessionPath: string | null
  processName: string | null
}

function run(cmd: string): string {
  try { return execSync(cmd, { encoding: 'utf-8', timeout: 5000 }).trim() } catch { return '' }
}

function fileExists(p: string): boolean {
  try { return existsSync(p) } catch { return false }
}

function getDirSizeMB(dirPath: string): number {
  try {
    // 使用更快的方式估算目录大小
    const output = run(`powershell -NoProfile -Command "try { (Get-ChildItem -Path '${dirPath}' -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB } catch { 0 }"`)
    return Math.round(parseFloat(output) || 0)
  } catch { return 0 }
}

function isProcessRunning(processName: string): boolean {
  try {
    const output = run(`tasklist /FI "IMAGENAME eq ${processName}" 2>nul`)
    return output.toLowerCase().includes(processName.toLowerCase())
  } catch { return false }
}

// 获取进程内存使用量（MB）
function getProcessMemory(processName: string): number {
  try {
    const output = run(`tasklist /FI "IMAGENAME eq ${processName}" /FO CSV 2>nul`)
    const lines = output.split('\n').filter(l => l.includes(processName))
    if (lines.length > 0) {
      // CSV 格式：Image Name,PID,Session Name,Session#,Mem Usage
      const parts = lines[0].split(',')
      if (parts.length >= 5) {
        const memStr = parts[4].replace(/"/g, '').replace(',', '').trim()
        const memKB = parseInt(memStr) || 0
        return Math.round(memKB / 1024) // 转换为 MB
      }
    }
  } catch {}
  return 0
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
  const mimoRunning = isProcessRunning('mimo.exe')
  agents.push({
    id: 'mimocode', name: 'MiMo Code', description: '小米 MiMo 智能编程助手',
    icon: '🤖', iconPath: null, type: 'cli',
    status: mimoInstalled ? (mimoRunning ? 'running' : 'idle') : 'offline',
    executablePath: mimoInstalled ? mimoCmd : null,
    configPath: mimoConfigExists ? (fileExists(mimoConfig) ? mimoConfig : mimoDesktop) : null,
    dataPath: mimoConfigExists ? (fileExists(mimoConfig) ? mimoConfig : mimoDesktop) : null,
    diskSpace: mimoConfigExists ? getDirSizeMB(fileExists(mimoConfig) ? mimoConfig : mimoDesktop) : 0,
    memoryUsage: mimoRunning ? getProcessMemory('mimo.exe') : 0,
    launchCommand: mimoInstalled ? 'mimo' : null,
    chatSessionPath: fileExists(mimoSessions) ? mimoSessions : null,
    processName: 'mimo.exe',
  })

  // 2. Claude Code
  const claudeExe = `${homedir}/.local/bin/claude.exe`
  const claudeConfig = `${homedir}/.claude`
  const claudeInstalled = fileExists(claudeExe) || !!run('where claude 2>nul')
  const claudeProjects = `${homedir}/.claude/projects`
  agents.push({
    id: 'claude', name: 'Claude Code', description: 'Anthropic Claude 编程助手',
    icon: '🧠', iconPath: fileExists(claudeExe) ? claudeExe : null, type: 'cli',
    status: claudeInstalled ? (isProcessRunning('claude.exe') ? 'running' : 'idle') : 'offline',
    executablePath: claudeInstalled ? claudeExe : null,
    configPath: fileExists(claudeConfig) ? claudeConfig : null,
    dataPath: fileExists(claudeConfig) ? claudeConfig : null,
    diskSpace: fileExists(claudeConfig) ? getDirSizeMB(claudeConfig) : 0,
    memoryUsage: isProcessRunning('claude.exe') ? getProcessMemory('claude.exe') : 0,
    launchCommand: claudeInstalled ? 'claude' : null,
    chatSessionPath: fileExists(claudeProjects) ? claudeProjects : null,
    processName: 'claude.exe',
  })

  // 3. OpenAI Codex
  const codexNpmDir = `${homedir}/AppData/Roaming/npm/node_modules/@openai/codex`
  const codexLocalDir = `${homedir}/AppData/Local/OpenAI/Codex`
  const codexInstalled = fileExists(codexNpmDir) || fileExists(codexLocalDir)
  agents.push({
    id: 'codex', name: 'OpenAI Codex', description: 'OpenAI Codex CLI 编程助手',
    icon: '⚡', iconPath: null, type: 'cli',
    status: codexInstalled ? (isProcessRunning('codex.exe') ? 'running' : 'idle') : 'offline',
    executablePath: codexInstalled ? (fileExists(codexLocalDir) ? `${codexLocalDir}/bin` : null) : null,
    configPath: fileExists(codexNpmDir) ? codexNpmDir : null,
    dataPath: fileExists(codexLocalDir) ? codexLocalDir : null,
    diskSpace: fileExists(codexLocalDir) ? getDirSizeMB(codexLocalDir) : 0,
    memoryUsage: isProcessRunning('codex.exe') ? getProcessMemory('codex.exe') : 0,
    launchCommand: codexInstalled ? 'codex' : null,
    chatSessionPath: null,
    processName: 'codex.exe',
  })

  // 4. Coffee CLI
  const coffeeExe = `${homedir}/AppData/Local/Coffee CLI/coffee-cli.exe`
  const coffeeDir = `${homedir}/AppData/Local/Coffee CLI`
  agents.push({
    id: 'coffee', name: 'Coffee CLI', description: 'Coffee CLI 命令行工具',
    icon: '☕', iconPath: fileExists(coffeeExe) ? coffeeExe : null, type: 'cli',
    status: fileExists(coffeeExe) ? (isProcessRunning('coffee-cli.exe') ? 'running' : 'idle') : 'offline',
    executablePath: fileExists(coffeeExe) ? coffeeExe : null,
    configPath: null, dataPath: fileExists(coffeeDir) ? coffeeDir : null,
    diskSpace: fileExists(coffeeDir) ? getDirSizeMB(coffeeDir) : 0,
    memoryUsage: isProcessRunning('coffee-cli.exe') ? getProcessMemory('coffee-cli.exe') : 0,
    launchCommand: fileExists(coffeeExe) ? `"${coffeeExe}"` : null,
    chatSessionPath: null,
    processName: 'coffee-cli.exe',
  })

  // 5. 豆包 (Doubao)
  const doubaoExe = `${homedir}/AppData/Local/Doubao/Application/Doubao.exe`
  const doubaoData = `${homedir}/AppData/Local/Doubao`
  agents.push({
    id: 'doubao', name: '豆包', description: '字节跳动 AI 助手',
    icon: '🫘', iconPath: fileExists(doubaoExe) ? doubaoExe : null, type: 'desktop',
    status: fileExists(doubaoExe) ? (isProcessRunning('Doubao.exe') ? 'running' : 'idle') : 'offline',
    executablePath: fileExists(doubaoExe) ? doubaoExe : null,
    configPath: null, dataPath: fileExists(doubaoData) ? doubaoData : null,
    diskSpace: fileExists(doubaoData) ? getDirSizeMB(doubaoData) : 0,
    memoryUsage: isProcessRunning('Doubao.exe') ? getProcessMemory('Doubao.exe') : 0,
    launchCommand: fileExists(doubaoExe) ? `"${doubaoExe}"` : null,
    chatSessionPath: null,
    processName: 'Doubao.exe',
  })

  // 6. Kimi
  const kimiExe = 'C:/Program Files/Kimi智能助手/Kimi智能助手.exe'
  const kimiDir = 'C:/Program Files/Kimi智能助手'
  const kimiData = `${homedir}/AppData/Local/KimiAppCache`
  agents.push({
    id: 'kimi', name: 'Kimi', description: '月之暗面 AI 助手',
    icon: '🌙', iconPath: fileExists(kimiExe) ? kimiExe : null, type: 'desktop',
    status: fileExists(kimiExe) ? (isProcessRunning('Kimi智能助手.exe') ? 'running' : 'idle') : 'offline',
    executablePath: fileExists(kimiExe) ? kimiExe : null,
    configPath: null, dataPath: fileExists(kimiData) ? kimiData : null,
    diskSpace: fileExists(kimiDir) ? getDirSizeMB(kimiDir) : 0,
    memoryUsage: isProcessRunning('Kimi智能助手.exe') ? getProcessMemory('Kimi智能助手.exe') : 0,
    launchCommand: fileExists(kimiExe) ? `"${kimiExe}"` : null,
    chatSessionPath: fileExists(kimiData) ? kimiData : null,
    processName: 'Kimi智能助手.exe',
  })

  // 7. 千问 (Qianwen)
  const qianwenData = `${homedir}/AppData/Local/Qianwen`
  agents.push({
    id: 'qianwen', name: '千问', description: '阿里巴巴通义千问',
    icon: '🔮', iconPath: null, type: 'desktop',
    status: fileExists(qianwenData) ? (isProcessRunning('Qianwen.exe') ? 'running' : 'idle') : 'offline',
    executablePath: null, configPath: null,
    dataPath: fileExists(qianwenData) ? qianwenData : null,
    diskSpace: fileExists(qianwenData) ? getDirSizeMB(qianwenData) : 0,
    memoryUsage: isProcessRunning('Qianwen.exe') ? getProcessMemory('Qianwen.exe') : 0,
    launchCommand: null, chatSessionPath: fileExists(qianwenData) ? qianwenData : null,
    processName: 'Qianwen.exe',
  })

  // 8. 腾讯元宝 (Yuanbao)
  const yuanbaoExe = 'C:/Program Files/Tencent/Yuanbao/yuanbao.exe'
  const yuanbaoDir = 'C:/Program Files/Tencent/Yuanbao'
  agents.push({
    id: 'yuanbao', name: '腾讯元宝', description: '腾讯 AI 助手',
    icon: '💎', iconPath: fileExists(yuanbaoExe) ? yuanbaoExe : null, type: 'desktop',
    status: fileExists(yuanbaoExe) ? (isProcessRunning('yuanbao.exe') ? 'running' : 'idle') : 'offline',
    executablePath: fileExists(yuanbaoExe) ? yuanbaoExe : null,
    configPath: null, dataPath: null,
    diskSpace: fileExists(yuanbaoDir) ? getDirSizeMB(yuanbaoDir) : 0,
    memoryUsage: isProcessRunning('yuanbao.exe') ? getProcessMemory('yuanbao.exe') : 0,
    launchCommand: fileExists(yuanbaoExe) ? `"${yuanbaoExe}"` : null,
    chatSessionPath: null,
    processName: 'yuanbao.exe',
  })

  // 9. 龙虾 (Claw / WorkBuddy)
  const clawPath = `${homedir}/WorkBuddy/Claw`
  const clawConfig = `${homedir}/.workbuddy`
  agents.push({
    id: 'claw', name: '龙虾 (Claw)', description: 'WorkBuddy 智能编程助手',
    icon: '🦞', iconPath: null, type: 'cli',
    status: fileExists(clawPath) ? 'idle' : 'offline',
    executablePath: fileExists(clawPath) ? clawPath : null,
    configPath: fileExists(clawConfig) ? clawConfig : null,
    dataPath: fileExists(clawPath) ? clawPath : null,
    diskSpace: fileExists(clawConfig) ? getDirSizeMB(clawConfig) : 0,
    memoryUsage: 0,
    launchCommand: fileExists(clawPath) ? `cd "${clawPath}" && claude` : null,
    chatSessionPath: fileExists(clawConfig) ? clawConfig : null,
    processName: null,
  })

  // 10. Google Antigravity
  const antigravityExe = `${homedir}/AppData/Local/Programs/antigravity/Antigravity.exe`
  const antigravityDir = `${homedir}/AppData/Local/Programs/antigravity`
  const antigravityData = `${homedir}/AppData/Roaming/Antigravity`
  agents.push({
    id: 'antigravity', name: 'Antigravity', description: 'Google 反重力 AI 智能体',
    icon: '🌌', iconPath: fileExists(antigravityExe) ? antigravityExe : null, type: 'desktop',
    status: fileExists(antigravityExe) ? (isProcessRunning('Antigravity.exe') ? 'running' : 'idle') : 'offline',
    executablePath: fileExists(antigravityExe) ? antigravityExe : null,
    configPath: null, dataPath: fileExists(antigravityData) ? antigravityData : null,
    diskSpace: fileExists(antigravityDir) ? getDirSizeMB(antigravityDir) : 0,
    memoryUsage: isProcessRunning('Antigravity.exe') ? getProcessMemory('Antigravity.exe') : 0,
    launchCommand: fileExists(antigravityExe) ? `"${antigravityExe}"` : null,
    chatSessionPath: fileExists(antigravityData) ? antigravityData : null,
    processName: 'Antigravity.exe',
  })

  return agents
}
