import { DownloadOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import { Button, Card, ConfigProvider, Flex } from 'antd'

interface ActionCardProps {
  startMonitoring: () => void
  stopMonitoring: () => void
  saveData: () => void
}

function ActionCard({
                      startMonitoring,
                      stopMonitoring,
                      saveData
                    }: ActionCardProps) {
  return (
    <ConfigProvider theme={{
      components: {
        Card: {
          bodyPadding: 12,
        }
      }
    }}>
      <Card>
        <Flex vertical justify="space-between" align="center" style={{height: 142}}>
          <Button onClick={startMonitoring} icon={<PlayCircleOutlined />} style={{width: '100%', height: '30%'}}
                  type="primary">开始监测</Button>
          <Button onClick={stopMonitoring} icon={<StopOutlined />}
                  style={{width: '100%', height: '30%'}}>停止监测</Button>
          <Button onClick={saveData} icon={<DownloadOutlined />}
                  style={{width: '100%', height: '30%'}}>保存数据</Button>
        </Flex>
      </Card>
    </ConfigProvider>
  )
}

export default ActionCard