export interface WorkflowStep {
  id: string
  agentId: string
  agentName: string
  agentIcon: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  dependencies: string[]  // 依赖的步骤 ID
  output: string
  startedAt: string | null
  completedAt: string | null
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'draft' | 'running' | 'completed' | 'failed'
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

const STORAGE_KEY = 'agent-workflows'

export function getAllWorkflows(): Workflow[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

function saveWorkflows(workflows: Workflow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows))
}

export function createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'status' | 'startedAt' | 'completedAt'>): Workflow {
  const workflows = getAllWorkflows()
  const newWorkflow: Workflow = {
    ...workflow,
    id: `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  }
  workflows.unshift(newWorkflow)
  saveWorkflows(workflows)
  return newWorkflow
}

export function updateWorkflow(id: string, updates: Partial<Workflow>) {
  const workflows = getAllWorkflows()
  const wf = workflows.find((w) => w.id === id)
  if (wf) {
    Object.assign(wf, updates)
    saveWorkflows(workflows)
  }
}

export function deleteWorkflow(id: string) {
  const workflows = getAllWorkflows().filter((w) => w.id !== id)
  saveWorkflows(workflows)
}

export function addStep(workflowId: string, step: Omit<WorkflowStep, 'id' | 'status' | 'output' | 'startedAt' | 'completedAt'>) {
  const workflows = getAllWorkflows()
  const wf = workflows.find((w) => w.id === workflowId)
  if (wf) {
    wf.steps.push({
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      output: '',
      startedAt: null,
      completedAt: null,
    })
    saveWorkflows(workflows)
  }
}

export function updateStepStatus(workflowId: string, stepId: string, status: WorkflowStep['status'], output?: string) {
  const workflows = getAllWorkflows()
  const wf = workflows.find((w) => w.id === workflowId)
  if (wf) {
    const step = wf.steps.find((s) => s.id === stepId)
    if (step) {
      step.status = status
      if (status === 'running') step.startedAt = new Date().toISOString()
      if (status === 'completed' || status === 'failed') {
        step.completedAt = new Date().toISOString()
        if (output) step.output = output
      }
      saveWorkflows(workflows)
    }
  }
}

export function canRunStep(workflow: Workflow, stepId: string): boolean {
  const step = workflow.steps.find((s) => s.id === stepId)
  if (!step || step.status !== 'pending') return false

  // 检查所有依赖是否已完成
  return step.dependencies.every((depId) => {
    const dep = workflow.steps.find((s) => s.id === depId)
    return dep && dep.status === 'completed'
  })
}

export function getNextRunnableSteps(workflow: Workflow): WorkflowStep[] {
  return workflow.steps.filter((step) => canRunStep(workflow, step.id))
}

export function getWorkflowProgress(workflow: Workflow): number {
  if (workflow.steps.length === 0) return 0
  const completed = workflow.steps.filter((s) => s.status === 'completed').length
  return Math.round((completed / workflow.steps.length) * 100)
}
