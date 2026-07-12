import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Clock, Tag, CheckCircle } from 'lucide-react'

const changelog = [
  {
    version: '1.0.0',
    date: '2026-07-12',
    changes: [
      { type: 'feature', text: 'Agent 自动扫描检测' },
      { type: 'feature', text: 'Agent 状态监控（CPU/内存）' },
      { type: 'feature', text: '磁盘空间占用显示' },
      { type: 'feature', text: '技能管理系统（22个预置技能）' },
      { type: 'feature', text: '聊天记录扫描（Claude Code/MiMo Code）' },
      { type: 'feature', text: 'Agent 调用终端' },
      { type: 'feature', text: '任务中心' },
      { type: 'feature', text: '设置页面（主题/语言/图标自定义）' },
      { type: 'feature', text: '应用打包（Windows）' },
      { type: 'fix', text: '修复启动时扫描卡顿问题' },
      { type: 'fix', text: '修复主题切换不生效问题' },
      { type: 'fix', text: '修复聊天记录显示假数据问题' },
      { type: 'improve', text: '优化仪表盘 UI 布局' },
      { type: 'improve', text: '添加手动扫描按钮' },
      { type: 'improve', text: '扫描结果缓存，加快启动速度' },
    ],
  },
]

const typeConfig: Record<string, { label: string; color: string }> = {
  feature: { label: '新功能', color: 'bg-blue-500/20 text-blue-400' },
  fix: { label: '修复', color: 'bg-green-500/20 text-green-400' },
  improve: { label: '优化', color: 'bg-purple-500/20 text-purple-400' },
}

function ChangelogPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">更新日志</h1>
        <p className="text-muted-foreground text-sm mt-1">版本更新记录</p>
      </div>

      <div className="space-y-6">
        {changelog.map((release) => (
          <Card key={release.version}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  v{release.version}
                </CardTitle>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {release.date}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {release.changes.map((change, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Badge className={typeConfig[change.type]?.color}>
                      {typeConfig[change.type]?.label}
                    </Badge>
                    <span className="text-sm">{change.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ChangelogPage
