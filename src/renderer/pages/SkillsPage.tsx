import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Trash2, Edit2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { translateSkillName, translateSkillDescription } from '@/lib/skill-translations'

interface RealSkill {
  id: string
  agentId: string
  name: string
  description: string
  category: string
  source: string
}

const agentNames: Record<string, { name: string; icon: string }> = {
  mimocode: { name: 'MiMo Code', icon: '🤖' },
  claude: { name: 'Claude Code', icon: '🧠' },
  codex: { name: 'OpenAI Codex', icon: '⚡' },
  coffee: { name: 'Coffee CLI', icon: '☕' },
  doubao: { name: '豆包', icon: '🫘' },
  kimi: { name: 'Kimi', icon: '🌙' },
  qianwen: { name: '千问', icon: '🔮' },
  yuanbao: { name: '腾讯元宝', icon: '💎' },
  claw: { name: '龙虾 (Claw)', icon: '🦞' },
  antigravity: { name: 'Antigravity', icon: '🌌' },
}

const categories = ['全部', '代码', '调试', '部署', '分析', '自动化', '其他']

function SkillsPage() {
  const [skills, setSkills] = useState<RealSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('all')

  useEffect(() => {
    loadFromCache()
  }, [])

  function loadFromCache() {
    const cached = localStorage.getItem('agent-skills-cache')
    if (cached) {
      setSkills(JSON.parse(cached))
      setLoading(false)
    } else {
      scanSkills()
    }
  }

  async function scanSkills() {
    setScanning(true)
    if (window.electronAPI?.scanSkills) {
      const scanned = await window.electronAPI.scanSkills()
      setSkills(scanned)
      localStorage.setItem('agent-skills-cache', JSON.stringify(scanned))
    }
    setScanning(false)
    setLoading(false)
  }

  const filteredSkills = skills.filter((s) => {
    const matchCategory = selectedCategory === '全部' || s.category === selectedCategory
    const matchAgent = selectedAgent === 'all' || s.agentId === selectedAgent
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchAgent && matchSearch
  })

  const agentCounts = skills.reduce((acc, s) => {
    acc[s.agentId] = (acc[s.agentId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">加载技能...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-muted-foreground text-sm mt-1">扫描到 {skills.length} 个真实技能</p>
        </div>
        <Button onClick={scanSkills} disabled={scanning} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? '扫描中...' : '重新扫描'}
        </Button>
      </div>

      {/* Agent 筛选 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Agent:</span>
        <button
          onClick={() => setSelectedAgent('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            selectedAgent === 'all'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          全部 ({skills.length})
        </button>
        {Object.entries(agentCounts).map(([id, count]) => (
          <button
            key={id}
            onClick={() => setSelectedAgent(id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedAgent === id
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {agentNames[id]?.icon} {agentNames[id]?.name} ({count})
          </button>
        ))}
      </div>

      {/* 搜索和分类筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
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
      </div>

      {/* 技能列表 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSkills.map((skill) => {
          const displayName = translateSkillName(skill.name)
          const displayDesc = translateSkillDescription(skill.name, skill.description)
          return (
            <div key={skill.id} className="relative group/skill">
              <Card className="hover:border-blue-500/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agentNames[skill.agentId]?.icon}</span>
                      <CardTitle className="text-base">{displayName}</CardTitle>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{agentNames[skill.agentId]?.name}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                    {displayDesc}
                  </p>
                  <div className="flex items-center gap-2">
                    {skill.category && <Badge variant="info">{skill.category}</Badge>}
                    <Badge variant="secondary">真实</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 悬停提示框 */}
              <div className="absolute z-50 left-0 right-0 top-full mt-2 opacity-0 invisible group-hover/skill:opacity-100 group-hover/skill:visible transition-all duration-200 pointer-events-none">
                <div className="bg-card border border-border rounded-xl shadow-2xl p-4 max-w-sm">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    <span className="text-xl">{agentNames[skill.agentId]?.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{agentNames[skill.agentId]?.name}</p>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-3 mb-2">
                    <p className="text-xs text-blue-400 mb-1 font-medium">中文说明</p>
                    <p className="text-sm text-foreground leading-relaxed">{displayDesc}</p>
                  </div>
                  {skill.description && skill.description !== displayDesc && (
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">英文原文</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{skill.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>暂无匹配的技能</p>
          <p className="text-sm mt-2">点击「重新扫描」获取最新技能</p>
        </div>
      )}
    </div>
  )
}

export default SkillsPage
