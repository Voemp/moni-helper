import TitleBar from '@/renderer/components/TitleBar'
import HomePage from '@/renderer/pages/HomePage.tsx'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useState } from 'react'

function App() {
  const [darkTheme, setDarkTheme] = useState(
    localStorage.getItem('lastTheme') === 'true' || false
  )

  useEffect(() => {
    window.ipcRenderer.on('theme-updated', (_, isDarkMode: boolean) => {
      setDarkTheme(isDarkMode)
      localStorage.setItem('lastTheme', isDarkMode ? 'true' : 'false')
    })
  }, [])

  return (
    <>
      <TitleBar />
      <div
        className="m-2 transition-colors duration-300 bg-white text-neutral-900 dark:bg-[#141414] dark:text-neutral-200 min-h-[calc(100vh-40px)]">
        <ConfigProvider
          locale={zhCN}
          theme={{
            cssVar: true,
            algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              borderRadius: 12
            }
          }}
        >
          <HomePage />
        </ConfigProvider>
      </div>
    </>
  )
}

export default App
