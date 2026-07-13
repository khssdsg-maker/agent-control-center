import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, MessageSquare, Terminal, HardDrive, Cpu, MemoryStick, FolderOpen, Plus, X, Play, ExternalLink, Info, Download, Search, Trash2, CheckCircle, Copy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getSkillsByAgent, addSkill, deleteSkill, type Skill } from '@/lib/db'
import { getAgentInfo } from '@/lib/agent-info'
import { getInstallMethod } from '@/lib/agent-install'

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
  online: { label: '在线', variant: 'success' }, idle: { label: '空闲', variant: 'secondary' },
  running: { label: '运行中', variant: 'info' }, error: { label: '错误', variant: 'error' }, offline: { label: '未安装', variant: 'secondary' },
}

function getCustomIcon(id: string): string | null { const s = localStorage.getItem('app-settings'); return s ? JSON.parse(s).agentIcons?.[id] || null : null }
function formatSize(mb: number): string { return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB` }

function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [skills, setSkills] = useState<Skill[]>([])
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'chat' | 'install' | 'terminal'>('about')
  const [agentInfo, setAgentInfo] = useState<any>(null)
  const [showSkillEditor, setShowSkillEditor] = useState(false)

  useEffect(() => { setTimeout(() => { loadSkills(); loadAgentInfo() }, 100) }, [agentId])
  function loadSkills() { if (agentId) setSkills(getSkillsByAgent(agentId)) }
  async function loadAgentInfo() { const c = localStorage.getItem('agent-scan-cache'); if (c) { const a = JSON.parse(c); setAgentInfo(a.find((x: any) => x.id === agentId)) } }

  const info = agentMap[agentId || ''] || { name: agentId, icon: '❓', description: '' }
  const customIcon = agentId ? getCustomIcon(agentId) : null
  const detailedInfo = agentId ? getAgentInfo(agentId) : null

  const handleOpenPath = (p: string | null) => { if (p && window.electronAPI?.openPath) window.electronAPI.openPath(p) }
  const handleDeleteSkill = (id: string) => { deleteSkill(id); loadSkills() }
  const handleAddSkill = (n: string, d: string, c: string) => { if (agentId) { addSkill({ agent_id: agentId, name: n, description: d, category: c, is_builtin: 0 }); loadSkills() }; setShowSkillEditor(false) }
  const handleLaunch = async () => { if (agentId && window.electronAPI?.launchAgent) { const r = await window.electronAPI.launchAgent(agentId); if (!r.success) alert(`启动失败: ${r.error}`) } }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b border-border p-4 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="h-5 w-5" /></button>
        {customIcon ? <img src={customIcon} alt={info.name} className="w-8 h-8 rounded-lg" /> : <span className="text-2xl">{info.icon}</span>}
        <div className="flex-1"><h1 className="text-xl font-bold">{info.name}</h1><p className="text-sm text-muted-foreground">{info.description}</p></div>
        <Badge variant={statusConfig[agentInfo?.status || 'offline']?.variant ?? 'secondary'}>{statusConfig[agentInfo?.status || 'offline']?.label ?? '未知'}</Badge>
      </div>
      <div className="border-b border-border p-3 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-orange-400" /><span className="text-muted-foreground">磁盘:</span><span className="font-medium">{formatSize(agentInfo?.diskSpace || 0)}</span></div>
        <div className="flex items-center gap-2"><MemoryStick className="h-4 w-4 text-purple-400" /><span className="text-muted-foreground">内存:</span><span className="font-medium">{agentInfo?.memoryUsage || 0}MB</span></div>
        <div className="flex items-center gap-3 ml-auto">
          {agentInfo?.status !== 'offline' && <Button onClick={handleLaunch} size="sm"><Play className="h-4 w-4 mr-1" />启动</Button>}
          {(agentInfo?.executablePath || agentInfo?.dataPath) && <button onClick={() => handleOpenPath(agentInfo.dataPath || agentInfo.executablePath)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><FolderOpen className="h-4 w-4" />打开目录</button>}
        </div>
      </div>
      <div className="border-b border-border flex">
        {[{ id: 'about' as const, icon: Info, label: '介绍' }, { id: 'skills' as const, icon: Wrench, label: `技能 (${skills.length})` }, { id: 'chat' as const, icon: MessageSquare, label: '聊天记录' }, { id: 'install' as const, icon: Download, label: '安装方法' }, { id: 'terminal' as const, icon: Terminal, label: '调用终端' }].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-muted-foreground hover:text-foreground'}`}><t.icon className="h-4 w-4" />{t.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'about' && detailedInfo && (
          <div className="p-6 space-y-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />基本信息</CardTitle></CardHeader><CardContent><h3 className="text-lg font-semibold mb-2">{detailedInfo.name}</h3><p className="text-muted-foreground leading-relaxed">{detailedInfo.longDescription}</p><div className="flex items-center gap-4 mt-4"><Badge variant={detailedInfo.category === 'cli' ? 'info' : 'success'}>{detailedInfo.category === 'cli' ? 'CLI 工具' : '桌面应用'}</Badge></div></CardContent></Card>
            <Card><CardHeader><CardTitle>功能特性</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-3">{detailedInfo.features.map((f: string, i: number) => (<div key={i} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /><span className="text-sm">{f}</span></div>))}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>系统要求</CardTitle></CardHeader><CardContent><div className="space-y-2">{detailedInfo.requirements.map((r: string, i: number) => (<div key={i} className="flex items-center gap-2"><span className="text-muted-foreground">•</span><span className="text-sm">{r}</span></div>))}</div></CardContent></Card>
          </div>
        )}
        {activeTab === 'about' && !detailedInfo && <div className="p-6 text-center text-muted-foreground">暂无详细信息</div>}
        {activeTab === 'skills' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Skills</h2><Button size="sm" onClick={() => setShowSkillEditor(true)}><Plus className="h-4 w-4 mr-1" />添加</Button></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((s) => (<Card key={s.id} className="hover:border-blue-500/50 group"><CardHeader className="pb-2"><div className="flex items-start justify-between"><CardTitle className="text-base">{s.name}</CardTitle><button onClick={() => handleDeleteSkill(s.id)} className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{s.description || '暂无描述'}</p>{s.category && <Badge variant="info" className="mt-2">{s.category}</Badge>}</CardContent></Card>))}
            </div>
          </div>
        )}
        {activeTab === 'chat' && <ChatTab agentId={agentId || ''} agentName={info.name} agentIcon={info.icon} />}
        {activeTab === 'install' && <InstallTab agentId={agentId || ''} agentName={info.name} agentIcon={info.icon} />}
        {activeTab === 'terminal' && (
          <div className="p-6 flex flex-col items-center justify-center h-full">
            <span className="text-6xl mb-6">{info.icon}</span>
            <h2 className="text-2xl font-bold mb-2">调用 {info.name}</h2>
            <p className="text-muted-foreground mb-8">点击按钮启动 {info.name}</p>
            <Button onClick={handleLaunch} size="lg" className="px-8"><Play className="h-5 w-5 mr-2" />启动 {info.name}</Button>
          </div>
        )}
      </div>
      {showSkillEditor && <AddSkillModal onSave={handleAddSkill} onClose={() => setShowSkillEditor(false)} />}
    </div>
  )
}

function ChatTab({ agentId, agentName, agentIcon }: { agentId: string; agentName: string; agentIcon: string }) {
  const [chats, setChats] = useState<any[]>([])
  const [sel, setSel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'time' | 'count'>('time')

  useEffect(() => { (async () => { if (window.electronAPI?.scanChatHistory) { const all = await window.electronAPI.scanChatHistory(); setChats(all.filter((c: any) => c.agentId === agentId)) } setLoading(false) })() }, [agentId])

  const filteredChats = chats
    .filter(c => !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortBy === 'count' ? (b.messageCount || 0) - (a.messageCount || 0) : 0)

  if (loading) return <div className="p-6 text-center text-muted-foreground">加载中...</div>
  if (!chats.length) return <div className="p-6 text-center text-muted-foreground"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>暂无聊天记录</p><p className="text-sm mt-1">使用 {agentName} 后对话记录会自动显示</p></div>

  return (
    <div className="flex h-full">
      <div className="w-72 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="搜索对话..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-8 pl-8 pr-3 rounded bg-secondary border border-border text-sm focus:outline-none" /></div>
          <div className="flex gap-2"><button onClick={() => setSortBy('time')} className={`px-2 py-1 rounded text-xs ${sortBy === 'time' ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary'}`}>按时间</button><button onClick={() => setSortBy('count')} className={`px-2 py-1 rounded text-xs ${sortBy === 'count' ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary'}`}>按消息数</button></div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.map(c => (<button key={c.id} onClick={() => setSel(c)} className={`w-full text-left p-3 rounded-lg text-sm ${sel?.id === c.id ? 'bg-accent' : 'hover:bg-accent/50'}`}><p className="font-medium truncate">{c.title}</p><p className="text-xs text-muted-foreground mt-1">{c.time} · {c.messageCount}条</p></button>))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sel ? sel.messages?.map((m: any, i: number) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-500/20' : 'bg-secondary'}`}><p className="text-sm whitespace-pre-wrap">{m.content}</p><p className="text-xs text-muted-foreground mt-1">{m.time}</p></div></div>)) : <div className="text-center text-muted-foreground py-12">选择一个对话查看</div>}
      </div>
    </div>
  )
}

function InstallTab({ agentId, agentName, agentIcon }: { agentId: string; agentName: string; agentIcon: string }) {
  const [sel, setSel] = useState(0)
  const [status, setStatus] = useState('')
  const method = getInstallMethod(agentId)
  const handleInstall = () => { if (!method) return; const opt = method.methods[sel]; if (opt?.url) { window.electronAPI?.openPath(opt.url); setStatus('已打开下载页面') } else if (opt?.commands?.[0]) { navigator.clipboard.writeText(opt.commands.join('\n')); setStatus('命令已复制到剪贴板') } }
  if (!method) return <div className="p-6 text-center text-muted-foreground"><Download className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>暂无安装方法</p></div>
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3"><span className="text-3xl">{agentIcon}</span><div><h2 className="text-xl font-bold">{agentName} 安装方法</h2><p className="text-sm text-muted-foreground">国内环境安装指南</p></div></div>
      <Card><CardHeader><CardTitle className="text-sm">选择安装方式</CardTitle></CardHeader><CardContent><div className="flex gap-3 flex-wrap">{method.methods.map((opt, i) => (<button key={i} onClick={() => setSel(i)} className={`flex-1 min-w-[200px] p-3 rounded-lg border-2 text-left transition-colors ${sel === i ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-border/80'}`}><p className="font-medium text-sm">{opt.name}</p><p className="text-xs text-muted-foreground mt-1">{opt.description}</p></button>))}</div></CardContent></Card>
      {method.methods[sel] && (<>
        <Card><CardHeader><CardTitle className="text-sm">安装步骤</CardTitle></CardHeader><CardContent><div className="space-y-3">{method.methods[sel].steps.map((s, i) => (<div key={i} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">{i + 1}</div><span className="text-sm">{s}</span></div>))}</div></CardContent></Card>
        {method.methods[sel].commands.length > 0 && <Card><CardHeader><CardTitle className="text-sm">安装命令</CardTitle></CardHeader><CardContent className="space-y-2">{method.methods[sel].commands.map((cmd, i) => (<div key={i} className="flex items-center gap-2 p-3 bg-secondary rounded-lg"><code className="flex-1 text-sm font-mono">{cmd}</code><button onClick={() => navigator.clipboard.writeText(cmd)} className="text-xs text-blue-400 hover:text-blue-300">复制</button></div>))}</CardContent></Card>}
        {method.methods[sel].url && <Card><CardHeader><CardTitle className="text-sm">下载链接</CardTitle></CardHeader><CardContent><button onClick={() => window.electronAPI?.openPath(method.methods[sel].url!)} className="text-blue-400 hover:underline text-sm">{method.methods[sel].url}</button></CardContent></Card>}
      </>)}
      <Card><CardHeader><CardTitle className="text-sm">注意事项</CardTitle></CardHeader><CardContent><ul className="space-y-2">{method.notes.map((n, i) => (<li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-yellow-500">•</span>{n}</li>))}</ul></CardContent></Card>
      <Button onClick={handleInstall} className="w-full" size="lg"><Download className="h-5 w-5 mr-2" />{method.methods[sel]?.url ? '打开下载页面' : '复制安装命令'}</Button>
      {status && <p className="text-sm text-center text-green-400">{status}</p>}
    </div>
  )
}

function AddSkillModal({ onSave, onClose }: { onSave: (n: string, d: string, c: string) => void; onClose: () => void }) {
  const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [cat, setCat] = useState('其他')
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">添加技能</h2><button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button></div>
        <div className="space-y-3">
          <div><label className="text-sm text-muted-foreground">名称 *</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="text-sm text-muted-foreground">描述</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div><label className="text-sm text-muted-foreground">分类</label><select value={cat} onChange={e => setCat(e.target.value)} className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm"><option>代码</option><option>调试</option><option>部署</option><option>分析</option><option>自动化</option><option>其他</option></select></div>
        </div>
        <div className="flex justify-end gap-3 pt-2"><Button variant="secondary" onClick={onClose}>取消</Button><Button onClick={() => onSave(name, desc, cat)} disabled={!name.trim()}>保存</Button></div>
      </div>
    </div>
  )
}

export default AgentDetailPage
