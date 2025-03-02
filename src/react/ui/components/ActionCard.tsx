import { DownloadOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons'
import { Button, Card, ConfigProvider, Flex } from 'antd'

function ActionCard() {
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
          <Button icon={<PlayCircleOutlined />} style={{width: '100%', height: '30%'}} type="primary">开始监测</Button>
          <Button icon={<StopOutlined />} style={{width: '100%', height: '30%'}}>停止监测</Button>
          <Button icon={<DownloadOutlined />} style={{width: '100%', height: '30%'}}>保存数据</Button>
        </Flex>
      </Card>
    </ConfigProvider>
  )
}

export default ActionCard