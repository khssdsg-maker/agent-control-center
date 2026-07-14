import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Agent scanner
  scanAgents: () => ipcRenderer.invoke('scan-agents'),

  // Extract icon from exe
  extractIcon: (exePath: string) => ipcRenderer.invoke('extract-icon', exePath),

  // Check if process is running
  checkProcess: (processName: string) => ipcRenderer.invoke('check-process', processName),

  // Skill scanner
  scanSkills: () => ipcRenderer.invoke('scan-skills'),

  // Chat history scanner
  scanChatHistory: () => ipcRenderer.invoke('scan-chat-history'),

  // Launch agent
  launchAgent: (agentId: string) => ipcRenderer.invoke('launch-agent', agentId),

  // Task runner
  taskRun: (taskId: string, command: string, cwd?: string) => ipcRenderer.invoke('task-run', taskId, command, cwd),
  taskInput: (taskId: string, data: string) => ipcRenderer.send('task-input', taskId, data),
  taskKill: (taskId: string) => ipcRenderer.send('task-kill', taskId),
  onTaskOutput: (callback: (taskId: string, data: string) => void) => {
    ipcRenderer.on('task-output', (_event, taskId, data) => callback(taskId, data))
  },
  onTaskClose: (callback: (taskId: string, code: number) => void) => {
    ipcRenderer.on('task-close', (_event, taskId, code) => callback(taskId, code))
  },

  // Open external path
  openPath: (fullPath: string) => ipcRenderer.invoke('open-path', fullPath),

  // Notifications
  sendNotification: (title: string, body: string) => ipcRenderer.invoke('send-notification', title, body),

  // Data store
  getSettings: () => ipcRenderer.invoke('store-get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('store-save-settings', settings),
  getAgents: () => ipcRenderer.invoke('store-get-agents'),
  saveAgents: (agents: any[]) => ipcRenderer.invoke('store-save-agents', agents),
  getSkills: () => ipcRenderer.invoke('store-get-skills'),
  saveSkills: (skills: any[]) => ipcRenderer.invoke('store-save-skills', skills),
  getTasks: () => ipcRenderer.invoke('store-get-tasks'),
  saveTasks: (tasks: any[]) => ipcRenderer.invoke('store-save-tasks', tasks),
  getCustomAgents: () => ipcRenderer.invoke('store-get-custom-agents'),
  saveCustomAgents: (agents: any[]) => ipcRenderer.invoke('store-save-custom-agents', agents),
})