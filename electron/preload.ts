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

  // Open external path
  openPath: (fullPath: string) => ipcRenderer.invoke('open-path', fullPath),

  // Notifications
  sendNotification: (title: string, body: string) => ipcRenderer.invoke('send-notification', title, body),
  getNotificationsEnabled: () => ipcRenderer.invoke('get-notifications-enabled'),
  setNotificationsEnabled: (enabled: boolean) => ipcRenderer.invoke('set-notifications-enabled', enabled),

  // Data store
  getSettings: () => ipcRenderer.invoke('store-get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('store-save-settings', settings),
  getAgents: () => ipcRenderer.invoke('store-get-agents'),
  saveAgents: (agents: any[]) => ipcRenderer.invoke('store-save-agents', agents),
  getSkills: () => ipcRenderer.invoke('store-get-skills'),
  saveSkills: (skills: any[]) => ipcRenderer.invoke('store-save-skills', skills),
  getTasks: () => ipcRenderer.invoke('store-get-tasks'),
  saveTasks: (tasks: any[]) => ipcRenderer.invoke('store-save-tasks', tasks),

  // Custom agents
  getCustomAgents: () => ipcRenderer.invoke('store-get-custom-agents'),
  saveCustomAgents: (agents: any[]) => ipcRenderer.invoke('store-save-custom-agents', agents),
})

export type ElectronAPI = {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  scanAgents: () => Promise<any[]>
  extractIcon: (exePath: string) => Promise<string | null>
  checkProcess: (processName: string) => Promise<boolean>
  scanSkills: () => Promise<any[]>
  scanChatHistory: () => Promise<any[]>
  launchAgent: (agentId: string) => Promise<{ success: boolean; message?: string; error?: string }>
  openPath: (fullPath: string) => Promise<void>
  sendNotification: (title: string, body: string) => Promise<boolean>
  getNotificationsEnabled: () => Promise<boolean>
  setNotificationsEnabled: (enabled: boolean) => Promise<boolean>
  getSettings: () => Promise<any>
  saveSettings: (settings: any) => Promise<boolean>
  getAgents: () => Promise<any[]>
  saveAgents: (agents: any[]) => Promise<boolean>
  getSkills: () => Promise<any[]>
  saveSkills: (skills: any[]) => Promise<boolean>
  getTasks: () => Promise<any[]>
  saveTasks: (tasks: any[]) => Promise<boolean>
  getCustomAgents: () => Promise<any[]>
  saveCustomAgents: (agents: any[]) => Promise<boolean>
}
