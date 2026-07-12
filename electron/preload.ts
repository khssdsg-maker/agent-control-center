import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Agent scanner
  scanAgents: () => ipcRenderer.invoke('scan-agents'),

  // Open external path
  openPath: (fullPath: string) => ipcRenderer.invoke('open-path', fullPath),
})

export type ElectronAPI = {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  scanAgents: () => Promise<any[]>
  openPath: (fullPath: string) => Promise<void>
}
