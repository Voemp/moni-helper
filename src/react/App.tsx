import { ConfigProvider } from 'antd'
import HomePage from './ui/pages/HomePage.tsx'


function App() {


  return (
    <ConfigProvider
      theme={{
        token: {
          "borderRadius": 12,
        }
      }}
    >
      <HomePage></HomePage>
    </ConfigProvider>
  )
}

export default App
