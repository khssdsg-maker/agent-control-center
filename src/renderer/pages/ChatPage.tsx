import { useState, useEffect } from 'react'
import { Search, Star, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { initDatabase } from '@/lib/db'

// 模拟聊天数据（后续会接入真实 Agent 对话）
const mockConversations = [
  { id: '1', agentName: 'MiMo Code', agentIcon: '🤖', title: '项目结构优化', time: '2小时前', favorite: true },
  { id: '2', agentName: 'Claude Code', agentIcon: '🧠', title: 'React 组件设计', time: '5小时前', favorite: false },
  { id: '3', agentName: '龙虾 (Claw)', agentIcon: '🦞', title: '自动化部署流程', time: '1天前', favorite: false },
  { id: '4', agentName: 'MiMo Code', agentIcon: '🤖', title: '数据库设计讨论', time: '2天前', favorite: true },
]

const mockMessages = [
  { id: '1', role: 'user', content: '帮我优化一下这个项目的目录结构' },
  { id: '2', role: 'assistant', content: '好的，我来分析一下当前的项目结构...\n\n建议将 src/ 下的文件按功能模块重新组织：\n1. components/ - 可复用组件\n2. pages/ - 页面组件\n3. lib/ - 工具函数\n4. db/ - 数据库相关' },
  { id: '3', role: 'user', content: '好的，按你说的改' },
  { id: '4', role: 'assistant', content: '已完成目录重构，主要变更：\n- 移动了 15 个文件\n- 更新了所有 import 路径\n- 确保所有测试通过' },
]

function ChatPage() {
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    initDatabase()
  }, [])

  return (
    <div className="h-full flex">
      {/* 左侧：对话列表 */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索对话..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {mockConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedConv === conv.id
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{conv.agentIcon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">{conv.agentName} · {conv.time}</p>
                </div>
                {conv.favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧：聊天区域 */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500/20 text-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
                  placeholder="输入消息..."
                  className="flex-1 h-10 px-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      setInputValue('')
                    }
                  }}
                />
                <button className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">选择一个对话开始</p>
              <p className="text-sm text-muted-foreground mt-2">
                左侧显示所有 Agent 的聊天记录
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
