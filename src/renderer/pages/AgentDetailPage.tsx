import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Send, Wrench, MessageSquare, Terminal,
  HardDrive, Cpu, MemoryStick, FolderOpen, Star,
  Trash2, Edit2, Plus, X, Play, ExternalLink
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
  idle: { label: '空闲', variant: 'secondary' },
  running: { label: '运行中', variant: 'info' },
  error: { label: '错误', variant: 'error' },
  offline: { label: '未安装', variant: 'secondary' },
}

// 获取自定义图标
function getCustomIcon(agentId: string): string | null {
  const settings = localStorage.getItem('app-settings')
  if (settings) {
    const s = JSON.parse(settings)
    return s.agentIcons?.[agentId] || null
  }
  return null
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

  const handleLaunchAgent = async () => {
    if (agentId && window.electronAPI?.launchAgent) {
      const result = await window.electronAPI.launchAgent(agentId)
      if (result.success) {
        alert(`已启动 ${info.name}`)
      } else {
        alert(`启动失败: ${result.error}`)
      }
    }
  }

  const customIcon = agentId ? getCustomIcon(agentId) : null

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
        {customIcon ? (
          <img src={customIcon} alt={info.name} className="w-8 h-8 rounded-lg" />
        ) : (
          <span className="text-2xl">{info.icon}</span>
        )}
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
        <div className="flex items-center gap-3 ml-auto">
          {agentInfo?.status !== 'offline' && (
            <Button onClick={handleLaunchAgent} size="sm">
              <Play className="h-4 w-4 mr-1" />
              启动 {info.name}
            </Button>
          )}
          {(agentInfo?.executablePath || agentInfo?.dataPath) && (
            <button
              onClick={() => handleOpenPath(agentInfo.dataPath || agentInfo.executablePath)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
              打开目录
            </button>
          )}
        </div>
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
          <ChatTab agentId={agentId || ''} agentName={info.name} agentIcon={info.icon} />
        )}
        {activeTab === 'terminal' && (
          <TerminalTab agentName={info.name} agentIcon={info.icon} agentId={agentId || ''} agentType={agentInfo?.type} />
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
  agentId,
  agentName,
  agentIcon,
}: {
  agentId: string
  agentName: string
  agentIcon: string
}) {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChatHistory()
  }, [agentId])

  async function loadChatHistory() {
    if (window.electronAPI?.scanChatHistory) {
      const allHistory = await window.electronAPI.scanChatHistory()
      // 只显示当前 Agent 的聊天记录
      const agentHistory = allHistory.filter((c: any) => c.agentId === agentId)
      setConversations(agentHistory)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">加载聊天记录...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* 左侧对话列表 */}
      <div className="w-64 border-r border-border p-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">对话历史</h3>
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedConv?.id === conv.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <p className="text-sm truncate font-medium">{conv.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{conv.time} · {conv.messageCount} 条</p>
            </button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">暂无对话记录</p>
        )}
      </div>

      {/* 右侧聊天区域 */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(selectedConv.messages || []).map((msg: any) => (
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
                      <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">选择一个对话查看记录</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== 调用终端 Tab ==========
function TerminalTab({
  agentName,
  agentIcon,
  agentId,
  agentType,
}: {
  agentName: string
  agentIcon: string
  agentId: string
  agentType?: string
}) {
  const [launching, setLaunching] = useState(false)

  const handleLaunch = async () => {
    if (window.electronAPI?.launchAgent) {
      setLaunching(true)
      const result = await window.electronAPI.launchAgent(agentId)
      setLaunching(false)
      if (result.success) {
        // 不弹窗，直接打开
      } else {
        alert(`启动失败: ${result.error}`)
      }
    }
  }

  const typeLabel = agentType === 'cli' ? '命令行工具' : '桌面应用'

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <span className="text-6xl mb-6 block">{agentIcon}</span>
      <h2 className="text-2xl font-bold mb-2">{agentName}</h2>
      <p className="text-muted-foreground mb-2">{typeLabel}</p>
      <p className="text-sm text-muted-foreground mb-8">
        {agentType === 'cli'
          ? '点击打开终端并运行'
          : '点击启动应用'}
      </p>
      <Button onClick={handleLaunch} disabled={launching} size="lg" className="px-8">
        {launching ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            启动中...
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            启动 {agentName}
          </>
        )}
      </Button>
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
