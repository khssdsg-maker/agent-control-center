interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  scanAgents: () => Promise<DetectedAgent[]>
  openPath: (fullPath: string) => Promise<void>
}

interface DetectedAgent {
  id: string
  name: string
  description: string
  icon: string
  type: 'cli' | 'desktop' | 'web'
  status: 'online' | 'idle' | 'offline'
  executablePath: string | null
  configPath: string | null
  dataPath: string | null
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
