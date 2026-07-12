import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

export interface ChatConversation {
  id: string
  agentId: string
  agentName: string
  agentIcon: string
  title: string
  lastMessage: string
  time: string
  favorite: boolean
  messageCount: number
  messages: ChatMessage[]
}

function parseJsonl(filePath: string): any[] {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return content.split('\n').filter(Boolean).map((line) => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean)
  } catch {
    return []
  }
}

function formatTime(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 扫描 Claude Code 聊天记录
function scanClaudeCode(homedir: string): ChatConversation[] {
  const conversations: ChatConversation[] = []
  const claudeDir = path.join(homedir, '.claude')

  if (!existsSync(claudeDir)) return conversations

  // 读取 history.jsonl 获取用户输入历史
  const historyFile = path.join(claudeDir, 'history.jsonl')
  const historyData = parseJsonl(historyFile)

  // 按 sessionId 分组
  const sessionMap = new Map<string, any[]>()
  for (const item of historyData) {
    if (item.sessionId && item.display) {
      if (!sessionMap.has(item.sessionId)) {
        sessionMap.set(item.sessionId, [])
      }
      sessionMap.get(item.sessionId)!.push(item)
    }
  }

  // 读取项目目录下的会话文件
  const projectsDir = path.join(claudeDir, 'projects')
  if (existsSync(projectsDir)) {
    const projectDirs = readdirSync(projectsDir)
    for (const projectDir of projectDirs) {
      const projectPath = path.join(projectsDir, projectDir)
      if (!existsSync(projectPath)) continue

      const files = readdirSync(projectPath).filter((f) => f.endsWith('.jsonl'))
      for (const file of files) {
        const sessionId = file.replace('.jsonl', '')
        const filePath = path.join(projectPath, file)
        const sessionData = parseJsonl(filePath)

        // 提取用户消息和助手回复
        const messages: ChatMessage[] = []
        let title = ''
        let lastTime = 0

        for (const item of sessionData) {
          if (item.type === 'user' && item.message?.role === 'user') {
            const content = typeof item.message.content === 'string'
              ? item.message.content
              : Array.isArray(item.message.content)
                ? item.message.content.find((c: any) => c.type === 'text')?.text || ''
                : ''
            if (content && !content.startsWith('{')) {
              messages.push({
                id: item.uuid || String(messages.length),
                role: 'user',
                content: content.substring(0, 200),
                time: formatTime(item.timestamp),
              })
              if (!title) title = content.substring(0, 30)
              lastTime = new Date(item.timestamp).getTime()
            }
          }
          if (item.type === 'assistant' && item.message?.role === 'assistant') {
            const content = Array.isArray(item.message.content)
              ? item.message.content.find((c: any) => c.type === 'text')?.text || ''
              : item.message.content || ''
            if (content && !content.includes('<thinking>')) {
              messages.push({
                id: item.uuid || String(messages.length),
                role: 'assistant',
                content: content.substring(0, 200),
                time: formatTime(item.timestamp),
              })
              lastTime = new Date(item.timestamp).getTime()
            }
          }
        }

        if (messages.length > 0 && title) {
          conversations.push({
            id: `claude-${sessionId}`,
            agentId: 'claude',
            agentName: 'Claude Code',
            agentIcon: '🧠',
            title: title,
            lastMessage: messages[messages.length - 1].content.substring(0, 50),
            time: formatTime(lastTime),
            favorite: false,
            messageCount: messages.length,
            messages: messages.slice(-10), // 最近10条
          })
        }
      }
    }
  }

  // 按时间排序，取最近的
  return conversations.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 20)
}

// 扫描 MiMo Code 聊天记录
function scanMiMoCode(homedir: string): ChatConversation[] {
  const conversations: ChatConversation[] = []
  const sessionsDir = path.join(homedir, '.local', 'share', 'mimocode', 'memory', 'sessions')

  if (!existsSync(sessionsDir)) return conversations

  const sessionDirs = readdirSync(sessionsDir).filter((d) => d.startsWith('ses_'))

  for (const sessionDir of sessionDirs) {
    const checkpointFile = path.join(sessionsDir, sessionDir, 'checkpoint.md')
    if (!existsSync(checkpointFile)) continue

    try {
      const content = readFileSync(checkpointFile, 'utf-8')

      // 提取标题
      const topicMatch = content.match(/Topic:\s*(.+)/)
      const title = topicMatch ? topicMatch[1].trim() : `会话 ${sessionDir.substring(4, 12)}`

      // 提取用户消息
      const messages: ChatMessage[] = []
      const userMsgMatches = content.match(/>\s*"(.+?)"/g) || []
      for (const match of userMsgMatches.slice(0, 5)) {
        const msg = match.replace(/^>\s*"/, '').replace(/"$/, '')
        messages.push({
          id: String(messages.length),
          role: 'user',
          content: msg.substring(0, 200),
          time: '最近',
        })
      }

      // 提取任务完成信息
      const taskMatches = content.match(/✅\s*(.+)/g) || []
      for (const match of taskMatches.slice(0, 3)) {
        const msg = match.replace(/✅\s*/, '')
        messages.push({
          id: String(messages.length),
          role: 'assistant',
          content: `已完成: ${msg}`,
          time: '最近',
        })
      }

      if (messages.length > 0) {
        conversations.push({
          id: `mimo-${sessionDir}`,
          agentId: 'mimocode',
          agentName: 'MiMo Code',
          agentIcon: '🤖',
          title: title.substring(0, 50),
          lastMessage: messages[messages.length - 1].content.substring(0, 50),
          time: '最近',
          favorite: false,
          messageCount: messages.length,
          messages,
        })
      }
    } catch {
      // 跳过解析失败的文件
    }
  }

  return conversations.slice(0, 10)
}

// 主函数：扫描所有 Agent 的聊天记录
export function scanAllChatHistory(homedir: string): ChatConversation[] {
  const allConversations: ChatConversation[] = []

  // 扫描各 Agent
  allConversations.push(...scanClaudeCode(homedir))
  allConversations.push(...scanMiMoCode(homedir))

  // 按时间排序
  return allConversations.sort((a, b) => {
    const timeA = a.time.includes('分钟') || a.time.includes('小时') || a.time === '最近' ? 0 : 1
    const timeB = b.time.includes('分钟') || b.time.includes('小时') || b.time === '最近' ? 0 : 1
    return timeA - timeB
  })
}
