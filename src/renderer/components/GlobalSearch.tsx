import { useState, useEffect, useRef } from 'react'
import { Search, X, Bot, Wrench, MessageSquare, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTabStore } from '@/stores/tabStore'

interface SearchResult {
  id: string
  type: 'agent' | 'skill' | 'chat'
  title: string
  description: string
  icon: string
  path: string
}

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { addTab } = useTabStore()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const q = query.toLowerCase()

    // 搜索 Agent
    const agents = JSON.parse(localStorage.getItem('agent-scan-cache') || '[]')
    const agentIcons: Record<string, string> = {
      mimocode: '🤖', claude: '🧠', codex: '⚡', coffee: '☕',
      doubao: '🫘', kimi: '🌙', qianwen: '🔮', yuanbao: '💎',
      claw: '🦞', antigravity: '🌌',
    }

    agents.forEach((agent: any) => {
      if (agent.name.toLowerCase().includes(q) || agent.description?.toLowerCase().includes(q)) {
        searchResults.push({
          id: agent.id,
          type: 'agent',
          title: agent.name,
          description: agent.description || '',
          icon: agentIcons[agent.id] || '🤖',
          path: `/agent/${agent.id}`,
        })
      }
    })

    // 搜索技能
    const skills = JSON.parse(localStorage.getItem('agent-skills-cache') || '[]')
    skills.forEach((skill: any) => {
      if (skill.name.toLowerCase().includes(q) || skill.description?.toLowerCase().includes(q)) {
        searchResults.push({
          id: skill.id,
          type: 'skill',
          title: skill.name,
          description: skill.description || '',
          icon: '🔧',
          path: '/skills',
        })
      }
    })

    setResults(searchResults.slice(0, 10))
  }, [query])

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'agent') {
      addTab({ id: `agent-${result.id}`, title: result.title, path: result.path, icon: result.icon })
    } else {
      addTab({ id: result.path, title: result.title, path: result.path, icon: result.icon })
    }
    navigate(result.path)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索框 */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索 Agent、技能..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <span className="text-xl">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                  </div>
                  <Badge variant={result.type === 'agent' ? 'info' : 'secondary'} className="text-xs">
                    {result.type === 'agent' ? 'Agent' : '技能'}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              未找到匹配结果
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              输入关键词开始搜索
            </div>
          )}
        </div>

        {/* 快捷键提示 */}
        <div className="p-3 border-t border-border text-xs text-muted-foreground flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">↑↓</kbd> 选择</span>
          <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">Enter</kbd> 打开</span>
          <span><kbd className="px-1.5 py-0.5 bg-secondary rounded">Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearch
