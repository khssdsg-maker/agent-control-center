import { app, BrowserWindow, ipcMain, shell, nativeImage } from 'electron'
import path from 'path'
import { exec, execSync } from 'child_process'
import { detectAgents } from './scanner'
import { scanAllChatHistory } from './scanner/chat-history'
import { scanAllSkills } from './scanner/skill-scanner'
import { getSettings, saveSettings, getAgentCache, saveAgentCache, getSkillsCache, saveSkillsCache, getTasks, saveTasks, getCustomAgents, saveCustomAgents, getWindowBounds, saveWindowBounds } from './store'
import { setMainWindow, setupNotificationIPC } from './notifier'

let mainWindow: BrowserWindow | null = null

function saveWindowPosition() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    saveWindowBounds(mainWindow.getBounds())
  }
}

function createWindow() {
  const bounds = getWindowBounds()

  mainWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
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

  setMainWindow(mainWindow)

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('resize', saveWindowPosition)
  mainWindow.on('move', saveWindowPosition)
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { app.quit() })
app.on('activate', () => { if (!mainWindow) createWindow() })

// ========== Window Control ==========
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => { mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize() })
ipcMain.on('window-close', () => mainWindow?.close())
ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() ?? false)

// ========== Agent Scanner ==========
ipcMain.handle('scan-agents', async () => {
  return new Promise((resolve) => {
    setImmediate(() => { try { resolve(detectAgents()) } catch { resolve([]) } })
  })
})

// ========== Extract Icon ==========
ipcMain.handle('extract-icon', (_event, exePath: string) => {
  try {
    // 尝试从 exe 提取图标
    const icon = nativeImage.createFromPath(exePath)
    if (icon && !icon.isEmpty()) {
      const resized = icon.resize({ width: 64, height: 64 })
      return resized.toDataURL()
    }
  } catch (err) {
    console.log('图标提取失败:', exePath, err)
  }
  return null
})

// ========== Check Process ==========
ipcMain.handle('check-process', (_event, processName: string) => {
  try { return execSync(`tasklist /FI "IMAGENAME eq ${processName}" 2>nul`, { encoding: 'utf-8' }).toLowerCase().includes(processName.toLowerCase()) } catch { return false }
})

// ========== Skill Scanner ==========
ipcMain.handle('scan-skills', () => scanAllSkills(process.env.USERPROFILE || process.env.HOME || ''))

// ========== Chat History Scanner ==========
ipcMain.handle('scan-chat-history', () => scanAllChatHistory(process.env.USERPROFILE || process.env.HOME || ''))

// ========== Launch Agent ==========
ipcMain.handle('launch-agent', (_event, agentId: string) => {
  const agent = detectAgents().find((a) => a.id === agentId)
  if (!agent?.launchCommand) return { success: false, error: 'Agent 未安装' }
  try {
    if (agent.type === 'cli') exec(`start "${agent.name}" cmd /k "${agent.launchCommand}"`)
    else exec(`start "" ${agent.launchCommand}`)
    return { success: true }
  } catch (err: any) { return { success: false, error: err.message } }
})

// ========== Task Runner ==========
let taskProcesses: Map<string, any> = new Map()

ipcMain.handle('task-run', (_event, taskId: string, command: string, cwd?: string) => {
  try {
    const proc = spawn(command, [], { shell: true, cwd: cwd || process.env.USERPROFILE || '', env: { ...process.env } })
    taskProcesses.set(taskId, proc)
    proc.stdout?.on('data', (data: Buffer) => { mainWindow?.webContents.send('task-output', taskId, data.toString()) })
    proc.stderr?.on('data', (data: Buffer) => { mainWindow?.webContents.send('task-output', taskId, data.toString()) })
    proc.on('close', (code) => { taskProcesses.delete(taskId); mainWindow?.webContents.send('task-close', taskId, code) })
    proc.on('error', () => { taskProcesses.delete(taskId); mainWindow?.webContents.send('task-close', taskId, -1) })
    return { success: true }
  } catch (err: any) { return { success: false, error: err.message } }
})

ipcMain.on('task-kill', (_event, taskId: string) => {
  const proc = taskProcesses.get(taskId)
  if (proc) { proc.kill(); taskProcesses.delete(taskId) }
})

// ========== Open External ==========
ipcMain.handle('open-path', (_event, p: string) => shell.openPath(p))

// ========== Data Store ==========
ipcMain.handle('store-get-settings', () => getSettings())
ipcMain.handle('store-save-settings', (_e, s) => { saveSettings(s); return true })
ipcMain.handle('store-get-agents', () => getAgentCache())
ipcMain.handle('store-save-agents', (_e, a) => { saveAgentCache(a); return true })
ipcMain.handle('store-get-skills', () => getSkillsCache())
ipcMain.handle('store-save-skills', (_e, s) => { saveSkillsCache(s); return true })
ipcMain.handle('store-get-tasks', () => getTasks())
ipcMain.handle('store-save-tasks', (_e, t) => { saveTasks(t); return true })
ipcMain.handle('store-get-custom-agents', () => getCustomAgents())
ipcMain.handle('store-save-custom-agents', (_e, a) => { saveCustomAgents(a); return true })

// ========== Notifications ==========
setupNotificationIPC()
