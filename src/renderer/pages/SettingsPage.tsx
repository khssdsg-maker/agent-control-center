import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, Palette, Globe, Image, Info, Upload, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { t, setLanguage, type Language } from '@/lib/i18n'

interface AppSettings {
  theme: 'dark' | 'light'
  language: 'zh' | 'en'
  agentIcons: Record<string, string>
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'zh',
  agentIcons: {},
}

const agentNames: Record<string, string> = {
  mimocode: 'MiMo Code',
  claude: 'Claude Code',
  codex: 'OpenAI Codex',
  coffee: 'Coffee CLI',
  doubao: '豆包',
  kimi: 'Kimi',
  qianwen: '千问',
  yuanbao: '腾讯元宝',
  claw: '龙虾 (Claw)',
  antigravity: 'Antigravity',
}

function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(theme)
}

function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings({ ...defaultSettings, ...parsed })
      applyTheme(parsed.theme || 'dark')
      setLanguage(parsed.language || 'zh')
    }
  }, [])

  useEffect(() => {
    applyTheme(settings.theme)
    setLanguage(settings.language)
  }, [settings.theme, settings.language])

  const handleSave = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('app-settings')
  }

  const handleIconUpload = (agentId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setSettings((prev) => ({
        ...prev,
        agentIcons: { ...prev.agentIcons, [agentId]: dataUrl },
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveIcon = (agentId: string) => {
    setSettings((prev) => {
      const newIcons = { ...prev.agentIcons }
      delete newIcons[agentId]
      return { ...prev, agentIcons: newIcons }
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground text-sm mt-1">应用设置与配置</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('settings.reset')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? t('settings.saved') : t('app.save')}
          </Button>
        </div>
      </div>

      {/* 主题设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('settings.theme')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSettings({ ...settings, theme: 'dark' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                settings.theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="w-full h-20 bg-[#0a0a0b] rounded mb-3 flex items-center justify-center">
                <span className="text-white text-sm">{t('settings.theme.dark')}</span>
              </div>
              <p className="text-sm font-medium">{t('settings.theme.dark')}</p>
            </button>
            <button
              onClick={() => setSettings({ ...settings, theme: 'light' })}
              className={`p-4 rounded-lg border-2 transition-colors ${
                settings.theme === 'light'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="w-full h-20 bg-white rounded mb-3 flex items-center justify-center border">
                <span className="text-black text-sm">{t('settings.theme.light')}</span>
              </div>
              <p className="text-sm font-medium">{t('settings.theme.light')}</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 语言设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSettings({ ...settings, language: 'zh' })
                forceUpdate((n) => n + 1)
              }}
              className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                settings.language === 'zh'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <span className="text-2xl">🇨🇳</span>
              <p className="text-sm mt-1">{t('settings.language.zh')}</p>
            </button>
            <button
              onClick={() => {
                setSettings({ ...settings, language: 'en' })
                forceUpdate((n) => n + 1)
              }}
              className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                settings.language === 'en'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <span className="text-2xl">🇺🇸</span>
              <p className="text-sm mt-1">{t('settings.language.en')}</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Agent 图标自定义 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            {t('settings.icons')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t('settings.icons.desc')}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(agentNames).map(([id, name]) => (
              <div key={id} className="flex flex-col items-center p-3 border rounded-lg">
                {settings.agentIcons[id] ? (
                  <div className="relative mb-2">
                    <img
                      src={settings.agentIcons[id]}
                      alt={name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <button
                      onClick={() => handleRemoveIcon(id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-blue-500 mb-2">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleIconUpload(id, file)
                      }}
                    />
                  </label>
                )}
                <span className="text-xs text-center text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('settings.about')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.version')}</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.tech')}</span>
            <span className="font-medium">Electron + React + TypeScript</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('settings.github')}</span>
            <a href="https://github.com/khssdsg-maker/agent-control-center" target="_blank" className="text-blue-400 hover:underline">GitHub</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
