import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { getAllSkills, addSkill, deleteSkill, type Skill, initDatabase } from '@/lib/db'

const categories = ['全部', '代码', '调试', '部署', '分析', '自动化', '其他']

// Agent 信息映射
const agentMap: Record<string, { name: string; icon: string }> = {
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

function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

  useEffect(() => {
    initDatabase()
    loadSkills()
  }, [])

  function loadSkills() {
    const allSkills = getAllSkills()
    setSkills(allSkills)
  }

  const filteredSkills = skills.filter((s) => {
    const matchCategory = selectedCategory === '全部' || s.category === selectedCategory
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCategory && matchSearch
  })

  const handleDelete = (id: string) => {
    deleteSkill(id)
    loadSkills()
  }

  const handleAdd = () => {
    setEditingSkill(null)
    setShowEditor(true)
  }

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setShowEditor(true)
  }

  const handleSave = () => {
    setShowEditor(false)
    loadSkills()
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-muted-foreground text-sm mt-1">
            管理所有 Agent 的技能 ({skills.length})
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          添加技能
        </Button>
      </div>

      {/* 搜索和筛选 */}
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
      {filteredSkills.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">暂无技能</p>
            <p className="text-sm text-muted-foreground mt-2">
              点击「添加技能」创建第一个技能
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => {
            const agent = agentMap[skill.agent_id] || { name: skill.agent_id, icon: '❓' }
            return (
              <Card key={skill.id} className="hover:border-blue-500/50 transition-colors group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{agent.icon}</span>
                        <span className="text-xs text-muted-foreground">{agent.name}</span>
                      </div>
                      <CardTitle className="text-base">{skill.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(skill)}
                        className="p-1 rounded hover:bg-secondary"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="p-1 rounded hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {skill.description || '暂无介绍'}
                  </p>
                  <div className="flex items-center gap-2">
                    {skill.category && (
                      <Badge variant="info">{skill.category}</Badge>
                    )}
                    {skill.is_builtin === 1 && (
                      <Badge variant="secondary">内置</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* 技能编辑器对话框 */}
      {showEditor && (
        <SkillEditor
          skill={editingSkill}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}

// 技能编辑器对话框
function SkillEditor({
  skill,
  onSave,
  onClose,
}: {
  skill: Skill | null
  onSave: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(skill?.name || '')
  const [description, setDescription] = useState(skill?.description || '')
  const [category, setCategory] = useState(skill?.category || '其他')
  const [agentId, setAgentId] = useState(skill?.agent_id || 'mimocode')

  const handleSave = () => {
    if (!name.trim()) return

    if (skill) {
      // 编辑模式（暂用删除+新增模拟）
      deleteSkill(skill.id)
    }

    addSkill({
      agent_id: agentId,
      name: name.trim(),
      description: description.trim() || null,
      category,
      tags: null,
      is_builtin: 0,
    })

    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{skill ? '编辑技能' : '添加技能'}</h2>

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
            <label className="text-sm text-muted-foreground">所属 Agent</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mimocode">MiMo Code</option>
              <option value="claude">Claude Code</option>
              <option value="codex">OpenAI Codex</option>
              <option value="coffee">Coffee CLI</option>
              <option value="doubao">豆包</option>
              <option value="kimi">Kimi</option>
              <option value="qianwen">千问</option>
              <option value="yuanbao">腾讯元宝</option>
              <option value="claw">龙虾 (Claw)</option>
              <option value="antigravity">Antigravity</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.filter((c) => c !== '全部').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </div>
    </div>
  )
}

export default SkillsPage
