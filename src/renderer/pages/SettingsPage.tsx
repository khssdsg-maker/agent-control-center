import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, FolderOpen, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { initDatabase } from '@/lib/db'

interface AppSettings {
  theme: 'dark' | 'light'
  autoScan: boolean
  scanInterval: number
  defaultAgent: string
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  autoScan: true,
  scanInterval: 5,
  defaultAgent: 'mimocode',
}

function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    initDatabase()
    // 加载保存的设置
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('app-settings')
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            应用设置与配置
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? '已保存' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* 通用设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            通用设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 主题 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">主题</p>
              <p className="text-sm text-muted-foreground">选择应用主题</p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'dark' | 'light' })}
              className="h-10 px-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dark">深色</option>
              <option value="light">浅色</option>
            </select>
          </div>

          {/* 默认 Agent */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">默认 Agent</p>
              <p className="text-sm text-muted-foreground">新建任务时使用的默认 Agent</p>
            </div>
            <select
              value={settings.defaultAgent}
              onChange={(e) => setSettings({ ...settings, defaultAgent: e.target.value })}
              className="h-10 px-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mimocode">MiMo Code</option>
              <option value="claude">Claude Code</option>
              <option value="codex">OpenAI Codex</option>
              <option value="doubao">豆包</option>
              <option value="kimi">Kimi</option>
              <option value="qianwen">千问</option>
              <option value="yuanbao">腾讯元宝</option>
              <option value="claw">龙虾 (Claw)</option>
              <option value="antigravity">Antigravity</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 扫描设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Agent 扫描设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 自动扫描 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">自动扫描</p>
              <p className="text-sm text-muted-foreground">启动时自动扫描已安装的 Agent</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoScan: !settings.autoScan })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.autoScan ? 'bg-blue-500' : 'bg-secondary'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoScan ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 扫描间隔 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">扫描间隔</p>
              <p className="text-sm text-muted-foreground">自动扫描的时间间隔（分钟）</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="30"
                value={settings.scanInterval}
                onChange={(e) => setSettings({ ...settings, scanInterval: parseInt(e.target.value) })}
                className="w-32"
              />
              <span className="w-12 text-center text-sm">{settings.scanInterval} 分钟</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            关于
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">版本</p>
            <p className="font-medium">1.0.0</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">项目地址</p>
            <a
              href="https://github.com/khssdsg-maker/agent-control-center"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              GitHub
            </a>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">技术栈</p>
            <p className="font-medium">Electron + React + TypeScript</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
