import TitleBar from '@/react/ui/components/TitleBar'
import HomePage from '@/react/ui/pages/HomePage.tsx'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  // 当前主题状态
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem('lastTheme') === 'true' || false)

  useEffect(() => {
    // 监听主题更新事件
    window.ipcRenderer.on('theme-updated', (_, isDarkMode: boolean) => {
      setDarkTheme(isDarkMode)
      localStorage.setItem('lastTheme', isDarkMode ? 'true' : 'false')
    })
  }, [])

  return (
    <>
      <TitleBar></TitleBar>
      <div className="pager">
        <ConfigProvider
          locale={zhCN}
          theme={{
            cssVar: true,
            algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              borderRadius: 12,
            }
          }}>
          <HomePage></HomePage>
        </ConfigProvider>
      </div>
    </>

  )
}

export default App
