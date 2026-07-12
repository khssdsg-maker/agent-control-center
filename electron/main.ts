import { app, BrowserWindow, ipcMain, shell, nativeImage } from 'electron'
import path from 'path'
import { exec, execSync } from 'child_process'
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

// ========== Extract Icon from Exe ==========
const iconDir = path.join(app.getPath('userData'), 'icons')
const fs = require('fs')

ipcMain.handle('extract-icon', (_event, exePath: string) => {
  try {
    // 生成唯一文件名
    const fileName = Buffer.from(exePath).toString('base64url').substring(0, 50) + '.png'
    const iconPath = path.join(iconDir, fileName)

    // 检查是否已缓存
    if (fs.existsSync(iconPath)) {
      return iconPath
    }

    // 确保目录存在
    if (!fs.existsSync(iconDir)) {
      fs.mkdirSync(iconDir, { recursive: true })
    }

    // 用 PowerShell 提取图标
    const psScript = `
      Add-Type -AssemblyName System.Drawing
      $icon = [System.Drawing.Icon]::ExtractAssociatedIcon("${exePath.replace(/\\/g, '\\\\')}")
      if ($icon -ne $null) {
        $bitmap = New-Object System.Drawing.Bitmap(64, 64)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.DrawImage($icon.ToBitmap(), 0, 0, 64, 64)
        $bitmap.Save("${iconPath.replace(/\\/g, '\\\\')}")
        Write-Output "OK"
      }
    `
    execSync(`powershell -NoProfile -Command "${psScript}"`, { encoding: 'utf-8', timeout: 5000 })

    if (fs.existsSync(iconPath)) {
      return iconPath
    }
    return null
  } catch {
    return null
  }
})

// ========== Check if Process Running ==========
ipcMain.handle('check-process', (_event, processName: string) => {
  try {
    const output = execSync(`tasklist /FI "IMAGENAME eq ${processName}" 2>nul`, { encoding: 'utf-8' })
    return output.toLowerCase().includes(processName.toLowerCase())
  } catch {
    return false
  }
})

// ========== Agent Scanner ==========
// 使用异步扫描，避免阻塞主线程
ipcMain.handle('scan-agents', async () => {
  return new Promise((resolve) => {
    // 使用 setImmediate 让出主线程
    setImmediate(() => {
      try {
        const agents = detectAgents()
        resolve(agents)
      } catch (err) {
        resolve([])
      }
    })
  })
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


