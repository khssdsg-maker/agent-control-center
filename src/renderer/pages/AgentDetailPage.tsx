import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Wrench, MessageSquare, Terminal,
  HardDrive, Cpu, MemoryStick, FolderOpen,
  Plus, X, Play, ExternalLink, Info, Download, CheckCircle, Copy, Search, Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getSkillsByAgent, addSkill, deleteSkill, type Skill, initDatabase } from '@/lib/db'
import { simulateAgentMetrics } from '@/lib/monitor'
import { getAgentInfo, type AgentInfo } from '@/lib/agent-info'

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
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'chat' | 'terminal'>('about')
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
    if (agentId) setSkills(getSkillsByAgent(agentId))
  }

  async function loadAgentInfo() {
    if (window.electronAPI?.scanAgents && agentId) {
      const agents = await window.electronAPI.scanAgents()
      setAgentInfo(agents.find((a: any) => a.id === agentId))
    }
  }

  const info = agentMap[agentId || ''] || { name: agentId, icon: '❓', description: '' }
  const customIcon = agentId ? getCustomIcon(agentId) : null
  const detailedInfo = agentId ? getAgentInfo(agentId) : null

  const handleOpenPath = (p: string | null) => {
    if (p && window.electronAPI?.openPath) window.electronAPI.openPath(p)
  }

  const handleDeleteSkill = (id: string) => {
    deleteSkill(id)
    loadSkills()
  }

  const handleAddSkill = (name: string, description: string, category: string) => {
    if (agentId) {
      addSkill({ agent_id: agentId, name, description, category, is_builtin: 0 })
      loadSkills()
    }
    setShowSkillEditor(false)
  }

  const handleLaunchAgent = async () => {
    if (agentId && window.electronAPI?.launchAgent) {
      const result = await window.electronAPI.launchAgent(agentId)
      if (!result.success) alert(`启动失败: ${result.error}`)
    }
  }

  const handleOpenWebsite = () => {
    if (detailedInfo?.website && window.electronAPI?.openPath) {
      window.electronAPI.openPath(detailedInfo.website)
    }
  }

  const handleCopyInstall = () => {
    if (detailedInfo?.installMethod) {
      navigator.clipboard.writeText(detailedInfo.installMethod)
    }
  }

  const handleSearchInstall = () => {
    if (detailedInfo?.name && window.electronAPI?.openPath) {
      window.electronAPI.openPath(`https://www.google.com/search?q=${encodeURIComponent(detailedInfo.name + ' install download')}`)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="border-b border-border p-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
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
              启动
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
        {[
          { id: 'about' as const, icon: Info, label: '介绍' },
          { id: 'skills' as const, icon: Wrench, label: `技能 (${skills.length})` },
          { id: 'chat' as const, icon: MessageSquare, label: '聊天记录' },
          { id: 'terminal' as const, icon: Terminal, label: '调用终端' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {/* 介绍 Tab */}
        {activeTab === 'about' && detailedInfo && (
          <div className="p-6 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{detailedInfo.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{detailedInfo.longDescription}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={detailedInfo.category === 'cli' ? 'info' : 'success'}>
                    {detailedInfo.category === 'cli' ? 'CLI 工具' : '桌面应用'}
                  </Badge>
                  <Badge variant="secondary">v1.0.0</Badge>
                </div>
              </CardContent>
            </Card>

            {/* 功能特性 */}
            <Card>
              <CardHeader>
                <CardTitle>功能特性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {detailedInfo.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 系统要求 */}
            <Card>
              <CardHeader>
                <CardTitle>系统要求</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detailedInfo.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm">{req}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 安装方法 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  安装方法
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">命令行安装</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono">
                      {detailedInfo.installMethod}
                    </code>
                    <Button size="sm" variant="ghost" onClick={handleCopyInstall}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  {detailedInfo.website && (
                    <Button variant="outline" onClick={handleOpenWebsite}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      访问官网
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleSearchInstall}>
                    <Search className="h-4 w-4 mr-2" />
                    搜索安装教程
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'about' && !detailedInfo && (
          <div className="p-6 text-center text-muted-foreground">
            <p>暂无详细信息</p>
          </div>
        )}

        {/* 技能 Tab */}
        {activeTab === 'skills' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Skills</h2>
              <Button size="sm" onClick={() => setShowSkillEditor(true)}>
                <Plus className="h-4 w-4 mr-1" />
                添加技能
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <Card key={skill.id} className="hover:border-blue-500/50 transition-colors group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{skill.name}</CardTitle>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{skill.description || '暂无描述'}</p>
                    {skill.category && (
                      <Badge variant="info" className="mt-2">{skill.category}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 聊天记录 Tab */}
        {activeTab === 'chat' && (
          <div className="p-6 text-center text-muted-foreground">
            <p>请在左侧聊天记录页面查看</p>
          </div>
        )}

        {/* 调用终端 Tab */}
        {activeTab === 'terminal' && (
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <span className="text-6xl mb-6">{info.icon}</span>
            <h2 className="text-2xl font-bold mb-2">调用 {info.name}</h2>
            <p className="text-muted-foreground mb-8">点击按钮启动 {info.name}</p>
            <Button onClick={handleLaunchAgent} size="lg" className="px-8">
              <Play className="h-5 w-5 mr-2" />
              启动 {info.name}
            </Button>
          </div>
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

function Trash2Icon(props: any) {
  return <Trash2 {...props} />
}

function SearchIcon(props: any) {
  return <Search {...props} />
}

function AddSkillModal({ onSave, onClose }: { onSave: (name: string, desc: string, cat: string) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('其他')
  const categories = ['代码', '调试', '部署', '分析', '自动化', '其他']

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">添加技能</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">名称 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="技能名称"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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
