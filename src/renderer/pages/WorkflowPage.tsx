import { useState, useEffect } from 'react'
import { Plus, Play, Trash2, X, GitBranch, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
  getAllWorkflows, createWorkflow, deleteWorkflow,
  addStep, updateStepStatus, getWorkflowProgress,
  type Workflow, type WorkflowStep
} from '@/lib/workflow'

const agentOptions = [
  { id: 'mimocode', name: 'MiMo Code', icon: '🤖' },
  { id: 'claude', name: 'Claude Code', icon: '🧠' },
  { id: 'codex', name: 'OpenAI Codex', icon: '⚡' },
  { id: 'coffee', name: 'Coffee CLI', icon: '☕' },
  { id: 'doubao', name: '豆包', icon: '🫘' },
  { id: 'kimi', name: 'Kimi', icon: '🌙' },
]

const stepStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '等待中', color: 'text-gray-400', icon: Clock },
  running: { label: '运行中', color: 'text-blue-400', icon: cn },
  completed: { label: '已完成', color: 'text-green-400', icon: CheckCircle },
  failed: { label: '失败', color: 'text-red-400', icon: XCircle },
  skipped: { label: '跳过', color: 'text-gray-400', icon: ArrowRight },
}

function cn(...args: any[]) { return args.filter(Boolean).join(' ') }

function WorkflowPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showAddStep, setShowAddStep] = useState(false)

  useEffect(() => {
    loadWorkflows()
  }, [])

  function loadWorkflows() {
    setWorkflows(getAllWorkflows())
  }

  const handleCreateWorkflow = (name: string, description: string) => {
    createWorkflow({ name, description, steps: [] })
    loadWorkflows()
    setShowCreateModal(false)
  }

  const handleDeleteWorkflow = (id: string) => {
    deleteWorkflow(id)
    loadWorkflows()
    if (selectedWorkflow?.id === id) setSelectedWorkflow(null)
  }

  const handleAddStep = (step: Omit<WorkflowStep, 'id' | 'status' | 'output' | 'startedAt' | 'completedAt'>) => {
    if (selectedWorkflow) {
      addStep(selectedWorkflow.id, step)
      loadWorkflows()
      setShowAddStep(false)
      // 刷新选中的工作流
      const updated = getAllWorkflows().find((w) => w.id === selectedWorkflow.id)
      if (updated) setSelectedWorkflow(updated)
    }
  }

  const handleRunWorkflow = async (workflow: Workflow) => {
    // 找到可以运行的步骤
    const runnableSteps = workflow.steps.filter((s) => s.status === 'pending')
    if (runnableSteps.length === 0) return

    // 执行第一个可运行的步骤
    const step = runnableSteps[0]
    updateStepStatus(workflow.id, step.id, 'running')
    loadWorkflows()

    // 模拟执行
    setTimeout(() => {
      updateStepStatus(workflow.id, step.id, 'completed', '步骤执行完成')
      loadWorkflows()
      const updated = getAllWorkflows().find((w) => w.id === workflow.id)
      if (updated) setSelectedWorkflow(updated)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">工作流</h1>
          <p className="text-muted-foreground text-sm mt-1">任务编排和自动化流程</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建工作流
        </Button>
      </div>

      <div className="flex gap-6">
        {/* 工作流列表 */}
        <div className="w-80 space-y-3">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">暂无工作流</p>
                <p className="text-sm text-muted-foreground mt-1">点击上方按钮创建</p>
              </CardContent>
            </Card>
          ) : (
            workflows.map((wf) => {
              const progress = getWorkflowProgress(wf)
              return (
                <Card
                  key={wf.id}
                  className={`cursor-pointer transition-colors ${
                    selectedWorkflow?.id === wf.id ? 'border-blue-500' : 'hover:border-border/80'
                  }`}
                  onClick={() => setSelectedWorkflow(wf)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{wf.name}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(wf.id) }}
                        className="p-1 rounded hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{wf.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{wf.steps.length} 步骤</Badge>
                      <Badge variant={wf.status === 'completed' ? 'success' : wf.status === 'running' ? 'info' : 'secondary'}>
                        {wf.status === 'draft' ? '草稿' : wf.status === 'running' ? '运行中' : wf.status === 'completed' ? '已完成' : '失败'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* 工作流详情 */}
        <div className="flex-1">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedWorkflow.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setShowAddStep(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      添加步骤
                    </Button>
                    <Button size="sm" onClick={() => handleRunWorkflow(selectedWorkflow)}>
                      <Play className="h-4 w-4 mr-1" />
                      运行
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedWorkflow.steps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>暂无步骤</p>
                    <p className="text-sm mt-1">点击「添加步骤」创建工作流</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, i) => {
                      const config = stepStatusConfig[step.status]
                      const StatusIcon = config.icon
                      return (
                        <div key={step.id} className="flex items-center gap-4">
                          {/* 步骤序号 */}
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                            {i + 1}
                          </div>

                          {/* 步骤内容 */}
                          <div className="flex-1 p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{step.agentIcon}</span>
                                <span className="font-medium">{step.title}</span>
                              </div>
                              <span className={`text-sm ${config.color}`}>{config.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            {step.output && (
                              <p className="text-xs text-green-400 mt-2">{step.output}</p>
                            )}
                          </div>

                          {/* 箭头 */}
                          {i < selectedWorkflow.steps.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <GitBranch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">选择工作流</h3>
                <p className="text-muted-foreground">从左侧列表选择一个工作流查看详情</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 创建工作流弹窗 */}
      {showCreateModal && (
        <CreateWorkflowModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateWorkflow}
        />
      )}

      {/* 添加步骤弹窗 */}
      {showAddStep && selectedWorkflow && (
        <AddStepModal
          onClose={() => setShowAddStep(false)}
          onAdd={handleAddStep}
          existingSteps={selectedWorkflow.steps}
        />
      )}
    </div>
  )
}

function CreateWorkflowModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, desc: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">创建工作流</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">名称 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：项目部署流程"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">描述</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="工作流的描述"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={() => onCreate(name, description)} disabled={!name.trim()}>创建</Button>
        </div>
      </div>
    </div>
  )
}

function AddStepModal({ onClose, onAdd, existingSteps }: { onClose: () => void; onAdd: (step: any) => void; existingSteps: WorkflowStep[] }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [agentId, setAgentId] = useState('mimocode')
  const [dependencies, setDependencies] = useState<string[]>([])

  const handleAdd = () => {
    if (!title.trim()) return
    const agent = agentOptions.find((a) => a.id === agentId)
    onAdd({
      agentId,
      agentName: agent?.name || agentId,
      agentIcon: agent?.icon || '❓',
      title: title.trim(),
      description: description.trim(),
      dependencies,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">添加步骤</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">步骤名称 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：代码审查"
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">描述</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">选择 Agent</label>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)}
              className="w-full h-10 px-3 mt-1 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {agentOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
          </div>
          {existingSteps.length > 0 && (
            <div>
              <label className="text-sm text-muted-foreground">依赖步骤（可选）</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {existingSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      setDependencies((prev) =>
                        prev.includes(step.id)
                          ? prev.filter((id) => id !== step.id)
                          : [...prev, step.id]
                      )
                    }}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                      dependencies.includes(step.id)
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleAdd} disabled={!title.trim()}>添加</Button>
        </div>
      </div>
    </div>
  )
}

export default WorkflowPage
