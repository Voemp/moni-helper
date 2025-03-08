import { ConfigProvider, theme } from "antd"
import zhCN from "antd/locale/zh_CN"
import { useEffect, useState } from "react"
import { TitleBar } from "./ui/components/TitleBar.tsx"
import HomePage from "./ui/pages/HomePage.tsx"
import "./App.css"

function App() {
  // 当前主题状态
  const [darkTheme, setDarkTheme] = useState(false)

  useEffect(() => {
    // 监听主题更新事件
    window.ipcRenderer.on("theme-updated", (_, isDarkMode: boolean) => {
      setDarkTheme(isDarkMode)
      console.log("Theme updated:", isDarkMode)
    })
  }, [])

  useEffect(() => {
    // 根据当前主题状态给 body 添加相应的 class
    document.body.classList.remove("light", "dark")
    document.body.classList.add(darkTheme ? "dark" : "light")
  }, [darkTheme])

  return (
    <>
      <TitleBar isDarkMode={darkTheme}></TitleBar>
      <div className="pager">
        <ConfigProvider
          locale={zhCN}
          theme={{
            cssVar: true,
            algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              "borderRadius": 12,
            }
          }}>
          <HomePage></HomePage>
        </ConfigProvider>
      </div>
    </>

  )
}

export default App
