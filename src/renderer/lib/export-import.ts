// 数据导出/导入功能

export interface ExportData {
  version: string
  exportedAt: string
  settings: any
  agents: any[]
  skills: any[]
  tasks: any[]
  workflows: any[]
  customAgents: any[]
}

// 导出所有数据
export async function exportAllData(): Promise<string> {
  const data: ExportData = {
    version: '2.0.1',
    exportedAt: new Date().toISOString(),
    settings: {},
    agents: [],
    skills: [],
    tasks: [],
    workflows: [],
    customAgents: [],
  }

  // 获取设置
  if (window.electronAPI?.getSettings) {
    data.settings = await window.electronAPI.getSettings()
  }

  // 获取 Agent 缓存
  if (window.electronAPI?.getAgents) {
    data.agents = await window.electronAPI.getAgents()
  }

  // 获取技能
  if (window.electronAPI?.getSkills) {
    data.skills = await window.electronAPI.getSkills()
  }

  // 获取任务
  if (window.electronAPI?.getTasks) {
    data.tasks = await window.electronAPI.getTasks()
  }

  // 获取工作流
  const workflowsData = localStorage.getItem('agent-workflows')
  if (workflowsData) {
    data.workflows = JSON.parse(workflowsData)
  }

  // 获取自定义 Agent
  if (window.electronAPI?.getCustomAgents) {
    data.customAgents = await window.electronAPI.getCustomAgents()
  }

  return JSON.stringify(data, null, 2)
}

// 导入数据
export async function importData(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data: ExportData = JSON.parse(jsonString)

    if (!data.version || !data.exportedAt) {
      return { success: false, message: '无效的备份文件' }
    }

    // 导入设置
    if (data.settings && window.electronAPI?.saveSettings) {
      await window.electronAPI.saveSettings(data.settings)
    }

    // 导入 Agent 缓存
    if (data.agents && window.electronAPI?.saveAgents) {
      await window.electronAPI.saveAgents(data.agents)
    }

    // 导入技能
    if (data.skills && window.electronAPI?.saveSkills) {
      await window.electronAPI.saveSkills(data.skills)
    }

    // 导入任务
    if (data.tasks && window.electronAPI?.saveTasks) {
      await window.electronAPI.saveTasks(data.tasks)
    }

    // 导入工作流
    if (data.workflows) {
      localStorage.setItem('agent-workflows', JSON.stringify(data.workflows))
    }

    // 导入自定义 Agent
    if (data.customAgents && window.electronAPI?.saveCustomAgents) {
      await window.electronAPI.saveCustomAgents(data.customAgents)
    }

    return { success: true, message: `成功导入数据 (版本: ${data.version})` }
  } catch (err: any) {
    return { success: false, message: `导入失败: ${err.message}` }
  }
}

// 下载文件
export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
