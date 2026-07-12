import { useState, useEffect } from 'react'
import {
  Clock, CheckCircle, XCircle, AlertCircle, Play,
  Plus, Trash2, Filter, Search, X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
  getAllTasks, createTask, updateTaskStatus, deleteTask,
  type Task
} from '@/lib/tasks'
import { initDatabase } from '@/lib/db'

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'error' | 'secondary'; icon: any }> = {
  pending: { label: '等待中', variant: 'secondary', icon: Clock },
  running: { label: '运行中', variant: 'info', icon: Play },
  completed: { label: '已完成', variant: 'success', icon: CheckCircle },
  failed: { label: '失败', variant: 'error', icon: XCircle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'text-gray-400' },
  normal: { label: '普通', color: 'text-blue-400' },
  high: { label: '高', color: 'text-red-400' },
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    initDatabase()
    loadTasks()
  }, [])

  function loadTasks() {
    setTasks(getAllTasks())
  }

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.agentName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleDelete = (id: string) => {
    deleteTask(id)
    loadTasks()
  }

  const handleRunTask = (task: Task) => {
    updateTaskStatus(task.id, 'running')
    loadTasks()

    // 模拟任务执行
    setTimeout(() => {
      updateTaskStatus(task.id, 'completed', '任务执行完成')
      loadTasks()
    }, 3000)
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    running: tasks.filter((t) => t.status === 'running').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">管理所有 Agent 的任务</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建任务
        </Button>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '总任务', value: stats.total, color: '' },
          { label: '等待中', value: stats.pending, color: 'text-gray-400' },
          { label: '运行中', value: stats.running, color: 'text-blue-400' },
          { label: '已完成', value: stats.completed, color: 'text-green-400' },
          { label: '失败', value: stats.failed, color: 'text-red-400' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['all', 'pending', 'running', 'completed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterStatus === status
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all' ? '全部' : statusConfig[status]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const statusInfo = statusConfig[task.status]
          const StatusIcon = statusInfo.icon
          return (
            <Card key={task.id} className="hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{task.agentIcon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant={statusInfo.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <span className={`text-xs ${priorityConfig[task.priority]?.color}`}>
                        {priorityConfig[task.priority]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {task.agentName} · {new Date(task.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'pending' && (
                      <Button size="sm" onClick={() => handleRunTask(task)}>
                        <Play className="h-4 w-4 mr-1" />
                        执行
                      </Button>
                    )}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">暂无任务</div>
        )}
      </div>

      {/* 创建任务弹窗 */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            loadTasks()
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

function CreateTaskModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [agentId, setAgentId] = useState('mimocode')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal')

  const agents = [
    { id: 'mimocode', name: 'MiMo Code', icon: '🤖' },
    { id: 'claude', name: 'Claude Code', icon: '🧠' },
    { id: 'codex', name: 'OpenAI Codex', icon: '⚡' },
    { id: 'coffee', name: 'Coffee CLI', icon: '☕' },
    { id: 'doubao', name: '豆包', icon: '🫘' },
    { id: 'kimi', name: 'Kimi', icon: '🌙' },
    { id: 'qianwen', name: '千问', icon: '🔮' },
    { id: 'yuanbao', name: '腾讯元宝', icon: '💎' },
    { id: 'claw', name: '龙虾 (Claw)', icon: '🦞' },
    { id: 'antigravity', name: 'Antigravity', icon: '🌌' },
  ]

  const handleCreate = () => {
    if (!title.trim()) return

    const agent = agents.find((a) => a.id === agentId)
    createTask({
      agentId,
      agentName: agent?.name || agentId,
      agentIcon: agent?.icon || '❓',
      title: title.trim(),
      description: description.trim(),
      priority,
      input: '',
      output: '',
    })

    onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">创建任务</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">任务标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：优化登录系统"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="任务详细描述..."
              rows={3}
              className="w-full px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">选择 Agent</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">优先级</label>
            <div className="flex gap-2 mt-1">
              {(['low', 'normal', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    priority === p
                      ? p === 'high' ? 'bg-red-500/20 text-red-400' : p === 'normal' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>创建</Button>
        </div>
      </div>
    </div>
  )
}

export default TasksPage
