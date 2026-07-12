import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Send, Wrench, MessageSquare, Terminal,
  HardDrive, Cpu, MemoryStick, FolderOpen, Star,
  Trash2, Edit2, Plus, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getSkillsByAgent, addSkill, deleteSkill, type Skill, initDatabase } from '@/lib/db'
import { simulateAgentMetrics } from '@/lib/monitor'

// Agent 信息映射
const agentMap: Record<string, { name: string; icon: string; description: string }> = {
  mimocode: { name: 'MiMo Code', icon: '🤖', description: '小米 MiMo 智能编程助手' },
  claude: { name: 'Claude Code', icon: '🧠', description: 'Anthropic Claude 编程助手' },
  codex: { name: 'OpenAI Codex', icon: '⚡', description: 'OpenAI Codex CLI 编程助手' },
  coffee: { name: 'Coffee CLI', icon: '☕', description: 'Coffee CLI 命令行工具' },
  doubao: { name: '豆包', icon: '🫘', description: '字节跳动 AI 助手' },
  kimi: { name: 'Kimi', icon: '🌙', description: '月之暗面 AI 助手' },
  qianwen: { name: '千问', icon: '🔮', description: '阿里巴巴通义千问' },
  yuanbao: { name: '腾讯元宝', icon: '💎', description: '腾讯 AI 助手' },
  claw: { name: '龙虾 (Claw)', icon: '🦞', description: 'WorkBuddy 智能编程助手' },
  antigravity: { name: 'Antigravity', icon: '🌌', description: 'Google 反重力 AI 智能体' },
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'secondary' }> = {
  online: { label: '在线', variant: 'success' },
  idle: { label: '已安装', variant: 'success' },
  running: { label: '运行中', variant: 'info' },
  error: { label: '错误', variant: 'error' },
  offline: { label: '未安装', variant: 'secondary' },
}

// 模拟聊天记录
const mockChats: Record<string, Array<{ id: string; role: string; content: string; time: string }>> = {
  mimocode: [
    { id: '1', role: 'user', content: '帮我优化一下登录系统', time: '2小时前' },
    { id: '2', role: 'assistant', content: '好的，我来分析一下当前的登录系统...\n\n建议：\n1. 添加 JWT token 刷新机制\n2. 使用 bcrypt 加密密码\n3. 添加登录失败限制', time: '2小时前' },
  ],
  claude: [
    { id: '1', role: 'user', content: '分析这个项目的架构', time: '1天前' },
    { id: '2', role: 'assistant', content: '项目采用 React + Electron 架构，主要分为：\n1. 主进程 (electron/main.ts)\n2. 渲染进程 (src/renderer/)\n3. 数据层 (lib/db/)', time: '1天前' },
  ],
}

function formatSize(mb: number): string {
  if (mb === 0) return '0 MB'
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [skills, setSkills] = useState<Skill[]>([])
  const [activeTab, setActiveTab] = useState<'skills' | 'chat' | 'terminal'>('skills')
  const [agentInfo, setAgentInfo] = useState<any>(null)
  const [metrics, setMetrics] = useState({ cpu: 0, mem: 0 })
  const [showSkillEditor, setShowSkillEditor] = useState(false)

  useEffect(() => {
    initDatabase()
    loadSkills()
    loadAgentInfo()
  }, [agentId])

  useEffect(() => {
    const timer = setInterval(() => {
      if (agentInfo?.status !== 'offline') {
        const m = simulateAgentMetrics()
        setMetrics({ cpu: m.cpu, mem: m.mem })
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [agentInfo?.status])

  function loadSkills() {
    if (agentId) {
      setSkills(getSkillsByAgent(agentId))
    }
  }

  async function loadAgentInfo() {
    if (window.electronAPI?.scanAgents && agentId) {
      const agents = await window.electronAPI.scanAgents()
      const agent = agents.find((a: any) => a.id === agentId)
      setAgentInfo(agent)
    }
  }

  const info = agentMap[agentId || ''] || { name: agentId, icon: '❓', description: '' }
  const chats = mockChats[agentId || ''] || []

  const handleOpenPath = (path: string | null) => {
    if (path && window.electronAPI?.openPath) {
      window.electronAPI.openPath(path)
    }
  }

  const handleDeleteSkill = (id: string) => {
    deleteSkill(id)
    loadSkills()
  }

  const handleAddSkill = (name: string, description: string, category: string) => {
    if (agentId) {
      addSkill({
        agent_id: agentId,
        name,
        description,
        category,
        is_builtin: 0,
      })
      loadSkills()
    }
    setShowSkillEditor(false)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="border-b border-border p-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-2xl">{info.icon}</span>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{info.name}</h1>
          <p className="text-sm text-muted-foreground">{info.description}</p>
        </div>
        <Badge variant={statusConfig[agentInfo?.status || 'offline']?.variant ?? 'secondary'}>
          {statusConfig[agentInfo?.status || 'offline']?.label ?? '未知'}
        </Badge>
      </div>

      {/* 状态栏 */}
      <div className="border-b border-border p-3 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-orange-400" />
          <span className="text-muted-foreground">磁盘:</span>
          <span className="font-medium">{formatSize(agentInfo?.diskSpace || 0)}</span>
        </div>
        {agentInfo?.status !== 'offline' && (
          <>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              <span className="text-muted-foreground">CPU:</span>
              <span className="font-medium">{metrics.cpu}%</span>
            </div>
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-purple-400" />
              <span className="text-muted-foreground">内存:</span>
              <span className="font-medium">{metrics.mem}MB</span>
            </div>
          </>
        )}
        {(agentInfo?.executablePath || agentInfo?.dataPath) && (
          <button
            onClick={() => handleOpenPath(agentInfo.dataPath || agentInfo.executablePath)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            <FolderOpen className="h-4 w-4" />
            打开目录
          </button>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="border-b border-border flex">
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'skills'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wrench className="h-4 w-4" />
          技能 ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          聊天记录
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'terminal'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Terminal className="h-4 w-4" />
          调用终端
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'skills' && (
          <SkillsTab
            skills={skills}
            agentId={agentId || ''}
            onDelete={handleDeleteSkill}
            onAdd={() => setShowSkillEditor(true)}
          />
        )}
        {activeTab === 'chat' && (
          <ChatTab chats={chats} agentName={info.name} agentIcon={info.icon} />
        )}
        {activeTab === 'terminal' && (
          <TerminalTab agentName={info.name} agentIcon={info.icon} agentId={agentId || ''} />
        )}
      </div>

      {/* 添加技能弹窗 */}
      {showSkillEditor && (
        <AddSkillModal
          onSave={handleAddSkill}
          onClose={() => setShowSkillEditor(false)}
        />
      )}
    </div>
  )
}

// ========== 技能 Tab ==========
function SkillsTab({
  skills,
  agentId,
  onDelete,
  onAdd,
}: {
  skills: Skill[]
  agentId: string
  onDelete: (id: string) => void
  onAdd: () => void
}) {
  const categories = ['全部', '代码', '调试', '部署', '分析', '自动化', '其他']
  const [selectedCategory, setSelectedCategory] = useState('全部')

  const filtered = skills.filter(
    (s) => selectedCategory === '全部' || s.category === selectedCategory
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skills</h2>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          添加技能
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => (
          <Card key={skill.id} className="hover:border-blue-500/50 transition-colors group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{skill.name}</CardTitle>
                <button
                  onClick={() => onDelete(skill.id)}
                  className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{skill.description || '暂无介绍'}</p>
              <div className="flex items-center gap-2">
                {skill.category && <Badge variant="info">{skill.category}</Badge>}
                {skill.is_builtin === 1 && <Badge variant="secondary">内置</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          暂无技能，点击「添加技能」创建
        </div>
      )}
    </div>
  )
}

// ========== 聊天记录 Tab ==========
function ChatTab({
  chats,
  agentName,
  agentIcon,
}: {
  chats: Array<{ id: string; role: string; content: string; time: string }>
  agentName: string
  agentIcon: string
}) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  // 模拟多轮对话
  const mockConversation = [
    { id: '1', role: 'user', content: '你好，帮我看看这个项目' },
    { id: '2', role: 'assistant', content: `好的，我是 ${agentName}，很高兴为你服务！\n\n请告诉我你需要什么帮助？` },
    { id: '3', role: 'user', content: '分析一下项目结构' },
    { id: '4', role: 'assistant', content: '项目结构分析：\n\n📁 agent-control-center/\n├── electron/          # Electron 主进程\n├── src/renderer/      # React 前端\n├── package.json       # 依赖配置\n└── tailwind.config.ts # 样式配置\n\n这是一个 Electron + React + TypeScript 的桌面应用项目。' },
  ]

  return (
    <div className="h-full flex">
      {/* 左侧对话列表 */}
      <div className="w-64 border-r border-border p-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">对话历史</h3>
        <button
          onClick={() => setSelectedChat('new')}
          className="w-full text-left p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-sm"
        >
          + 新建对话
        </button>
        {chats.length > 0 ? (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedChat === chat.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <p className="text-sm truncate">{chat.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{chat.time}</p>
            </button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">暂无对话</p>
        )}
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockConversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className="text-xl flex-shrink-0">{msg.role === 'user' ? '👤' : agentIcon}</span>
                <div
                  className={`rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500/20 text-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 输入框 */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`向 ${agentName} 发送消息...`}
              className="flex-1 h-10 px-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  setInputValue('')
                }
              }}
            />
            <Button>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== 调用终端 Tab ==========
function TerminalTab({
  agentName,
  agentIcon,
  agentId,
}: {
  agentName: string
  agentIcon: string
  agentId: string
}) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: `${agentIcon} ${agentName} 终端已就绪` },
    { type: 'output', text: '输入命令开始调用，例如: "分析项目结构" 或 "帮我写一个函数"' },
    { type: 'output', text: '---' },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleSend = () => {
    if (!input.trim() || isRunning) return

    const cmd = input.trim()
    setInput('')
    setHistory((prev) => [...prev, { type: 'input', text: `> ${cmd}` }])
    setIsRunning(true)

    // 模拟 Agent 响应
    setTimeout(() => {
      const responses: Record<string, string> = {
        '分析项目结构': `正在分析项目结构...

📁 Agent Control Center
├── electron/           # Electron 主进程
│   ├── main.ts         # 主进程入口
│   ├── preload.ts      # 预加载脚本
│   └── scanner/        # Agent 扫描器
├── src/renderer/       # React 前端
│   ├── components/     # UI 组件
│   ├── pages/          # 页面
│   └── lib/            # 工具库
├── package.json
└── tailwind.config.ts

分析完成！项目包含 10 个 Agent 管理模块。`,

        '帮我写一个函数': `好的，我来帮你写一个函数：

\`\`\`typescript
// 递归计算目录大小
function getDirSize(dirPath: string): number {
  const files = fs.readdirSync(dirPath);
  let size = 0;
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += stat.size;
    }
  }
  return size;
}
\`\`\`

这个函数可以递归计算目录的总大小。`,

        '优化建议': `基于当前项目分析，优化建议：

1. **性能优化**
   - 添加 Agent 状态缓存，减少重复扫描
   - 使用 Web Worker 处理耗时计算

2. **用户体验**
   - 添加加载动画
   - 支持拖拽排序 Agent

3. **代码质量**
   - 添加单元测试
   - 使用 ESLint + Prettier`,

        default: `收到命令: "${cmd}"

${agentName} 正在处理中...

处理完成！
- 状态: 成功
- 耗时: 1.2s
- 输出: 已完成请求的操作`,
      }

      const response = responses[cmd] || responses['default']
      setHistory((prev) => [...prev, { type: 'output', text: response }])
      setIsRunning(false)
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 终端标题 */}
      <div className="border-b border-border p-3 flex items-center gap-2">
        <Terminal className="h-4 w-4 text-green-400" />
        <span className="text-sm font-medium">{agentName} 终端</span>
        <Badge variant={isRunning ? 'info' : 'success'} className="ml-2">
          {isRunning ? '运行中' : '就绪'}
        </Badge>
      </div>

      {/* 终端输出 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black/20"
      >
        {history.map((item, i) => (
          <div
            key={i}
            className={`mb-2 ${
              item.type === 'input'
                ? 'text-blue-400'
                : item.type === 'error'
                ? 'text-red-400'
                : 'text-green-300'
            }`}
          >
            <pre className="whitespace-pre-wrap">{item.text}</pre>
          </div>
        ))}
        {isRunning && (
          <div className="text-yellow-400 animate-pulse">
            正在处理...
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <span className="text-green-400 font-mono">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入命令或问题..."
            className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            disabled={isRunning}
          />
          <Button onClick={handleSend} disabled={isRunning || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>试试:</span>
          {['分析项目结构', '帮我写一个函数', '优化建议'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => setInput(cmd)}
              className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ========== 添加技能弹窗 ==========
function AddSkillModal({
  onSave,
  onClose,
}: {
  onSave: (name: string, description: string, category: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('其他')
  const categories = ['代码', '调试', '部署', '分析', '自动化', '其他']

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">添加技能</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">技能名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：代码编写"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="技能的详细描述..."
              rows={3}
              className="w-full px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={() => onSave(name, description, category)} disabled={!name.trim()}>保存</Button>
        </div>
      </div>
    </div>
  )
}

export default AgentDetailPage
