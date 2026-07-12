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

  // Chat history scanner
  scanChatHistory: () => ipcRenderer.invoke('scan-chat-history'),

  // Launch agent
  launchAgent: (agentId: string) => ipcRenderer.invoke('launch-agent', agentId),

  // Open external path
  openPath: (fullPath: string) => ipcRenderer.invoke('open-path', fullPath),
})

export type ElectronAPI = {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  scanAgents: () => Promise<any[]>
  extractIcon: (exePath: string) => Promise<string | null>
  checkProcess: (processName: string) => Promise<boolean>
  scanChatHistory: () => Promise<any[]>
  launchAgent: (agentId: string) => Promise<{ success: boolean; message?: string; error?: string }>
  openPath: (fullPath: string) => Promise<void>
}
