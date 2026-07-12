import { Notification, BrowserWindow } from 'electron'

let mainWindow: BrowserWindow | null = null
let notificationsEnabled = true

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

export function setNotificationsEnabled(enabled: boolean) {
  notificationsEnabled = enabled
}

export function isNotificationsEnabled(): boolean {
  return notificationsEnabled
}

export function sendNotification(title: string, body: string, silent: boolean = false) {
  if (!notificationsEnabled) return

  try {
    const notification = new Notification({
      title,
      body,
      silent,
      icon: undefined, // 可以添加应用图标
    })

    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })

    notification.show()
  } catch (err) {
    console.error('通知发送失败:', err)
  }
}

// 通过 IPC 发送通知
export function setupNotificationIPC() {
  const { ipcMain } = require('electron')

  ipcMain.handle('send-notification', (_event, title: string, body: string) => {
    sendNotification(title, body)
    return true
  })

  ipcMain.handle('get-notifications-enabled', () => {
    return notificationsEnabled
  })

  ipcMain.handle('set-notifications-enabled', (_event, enabled: boolean) => {
    notificationsEnabled = enabled
    return true
  })
}
