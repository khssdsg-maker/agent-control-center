import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import StatusBar from './StatusBar'

function MainLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <Header />

      {/* 中间内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧 Agent 列表 */}
        <Sidebar />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>

      {/* 底部状态栏 */}
      <StatusBar />
    </div>
  )
}

export default MainLayout
