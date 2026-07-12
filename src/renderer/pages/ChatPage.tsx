import { useState, useEffect, useRef } from 'react'
import { Search, Star, Send, Plus, Bot, User, MessageSquare, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import { initDatabase } from '@/lib/db'

interface Conversation {
  id: string
  agentId: string
  agentName: string
  agentIcon: string
  title: string
  lastMessage: string
  time: string
  favorite: boolean
  messageCount: number
  messages: Array<{ id: string; role: string; content: string; time: string }>
}

function ChatPage() {
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string; time: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'favorites'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initDatabase()
    loadChatHistory()
  }, [])

  async function loadChatHistory() {
    if (window.electronAPI?.scanChatHistory) {
      const history = await window.electronAPI.scanChatHistory()
      setConversations(history)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (selectedConv) {
      setMessages(selectedConv.messages || [])
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [selectedConv])

  const filteredConversations = conversations.filter((c) => {
    const matchSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchFilter = filterType === 'all' || c.favorite
    return matchSearch && matchFilter
  })

  const handleSend = () => {
    if (!inputValue.trim() || !selectedConv) return

    const newMessage = {
      id: String(Date.now()),
      role: 'user',
      content: inputValue.trim(),
      time: '刚刚',
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue('')

    // 模拟 Agent 回复
    setTimeout(() => {
      const reply = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `收到你的消息："${newMessage.content}"\n\n我正在处理中，请稍候...`,
        time: '刚刚',
      }
      setMessages((prev) => [...prev, reply])
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }, 1000)
  }

  const toggleFavorite = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">正在扫描聊天记录...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* 左侧：对话列表 */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* 标题和搜索 */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <span className="text-sm text-muted-foreground">{conversations.length} 条</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType('favorites')}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                filterType === 'favorites'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Star className="h-3 w-3 inline mr-1" />
              收藏
            </button>
          </div>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`w-full text-left p-3 rounded-lg transition-colors group ${
                selectedConv?.id === conv.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{conv.agentIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(conv.id)
                      }}
                      className="flex-shrink-0"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          conv.favorite
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{conv.agentName}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{conv.time}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredConversations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无对话
            </div>
          )}
        </div>
      </div>

      {/* 右侧：聊天区域 */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* 聊天头部 */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedConv.agentIcon}</span>
                <div>
                  <h3 className="font-medium">{selectedConv.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConv.agentName} · {selectedConv.messageCount} 条消息
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={async () => {
                  if (window.electronAPI?.launchAgent) {
                    const result = await window.electronAPI.launchAgent(selectedConv.agentId)
                    if (result.success) {
                      alert(`已启动 ${selectedConv.agentName}`)
                    } else {
                      alert(`启动失败: ${result.error}`)
                    }
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                在 {selectedConv.agentName} 中打开
              </Button>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-blue-500/20' : 'bg-secondary'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-500/20 text-foreground rounded-tr-sm'
                            : 'bg-secondary text-foreground rounded-tl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`向 ${selectedConv.agentName} 发送消息...`}
                  className="flex-1 h-11 px-4 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="h-11 w-11 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                按 Enter 发送，Shift + Enter 换行
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">选择一个对话开始</p>
              <p className="text-sm text-muted-foreground mt-2">
                左侧显示从各 Agent 扫描到的真实聊天记录
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
