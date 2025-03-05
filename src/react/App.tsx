import { ConfigProvider } from "antd"
import HomePage from "./ui/pages/HomePage.tsx"


function App() {
  return (
    <div style={{margin: 8}}>
      <ConfigProvider
        theme={{
          token: {
            "borderRadius": 12,
          }
        }}>
        <HomePage></HomePage>
      </ConfigProvider>
    </div>
  )
}

export default App
