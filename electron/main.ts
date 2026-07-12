import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { exec } from 'child_process'
import { detectAgents } from './scanner'
import { scanAllChatHistory } from './scanner/chat-history'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Agent Control Center',
    backgroundColor: '#0a0a0b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    titleBarStyle: 'hidden',
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ========== Window Control ==========
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() ?? false
})

// ========== Agent Scanner ==========
ipcMain.handle('scan-agents', () => {
  return detectAgents()
})

// ========== Chat History Scanner ==========
ipcMain.handle('scan-chat-history', () => {
  const homedir = process.env.USERPROFILE || process.env.HOME || ''
  return scanAllChatHistory(homedir)
})

// ========== Launch Agent ==========
ipcMain.handle('launch-agent', (_event, agentId: string) => {
  const agents = detectAgents()
  const agent = agents.find((a) => a.id === agentId)
  if (!agent || !agent.launchCommand) {
    return { success: false, error: 'Agent 未安装或无法启动' }
  }

  try {
    if (agent.type === 'cli') {
      // CLI 类型：打开真实 cmd.exe 窗口，自动运行命令
      const cmd = `start " ${agent.name}" cmd /k "${agent.launchCommand}"`
      exec(cmd, { cwd: 'C:\\Users\\海辰\\Desktop' })
    } else {
      // 桌面类型：直接启动 exe
      exec(`start "" ${agent.launchCommand}`)
    }
    return { success: true, message: `已启动 ${agent.name}` }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

// ========== Open External ==========
ipcMain.handle('open-path', (_event, fullPath: string) => {
  shell.openPath(fullPath)
})


