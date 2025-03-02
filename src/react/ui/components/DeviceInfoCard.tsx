import { LinkOutlined } from '@ant-design/icons'
import { Badge, Button, Card, Col, ConfigProvider, Flex, Row, Statistic } from 'antd'
import { useEffect, useState } from 'react'

interface DeviceInfoProps {
  deviceName?: string
  deviceStatus?: boolean
  devicePort?: string
  connectDevice: () => boolean
}

function DeviceInfoCard({
                          deviceName = '设备信息',
                          deviceStatus = false,
                          devicePort = '未知',
                          connectDevice
                        }: DeviceInfoProps) {
  // 显示时间
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timeInterval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timeInterval)
  }, [])

  return (
    <ConfigProvider theme={{
      components: {
        Card: {
          headerFontSize: 20
        }
      }
    }}>
      <Card title={deviceName}
            extra={<Button icon={<LinkOutlined />} onClick={connectDevice}>连接设备</Button>}>
        <Row gutter={4}>
          <Col span={6}>
            <Statistic title="连接状态" valueRender={() => (
              <Flex justify={'flex-start'} align="center">
                {deviceStatus ? '已连接' : '未连接'}
                <Badge
                  status={deviceStatus ? 'success' : 'error'}
                  style={{marginLeft: 8}}
                />
              </Flex>
            )} />
          </Col>
          <Col span={6}>
            <Statistic title='串口号' value={devicePort} />
          </Col>
          <Col span={6}>
            <Statistic title='系统时间'
                       value={new Intl.DateTimeFormat(undefined, {timeStyle: 'medium'}).format(time)} />
          </Col>
        </Row>
      </Card>
    </ConfigProvider>
  )
}

export default DeviceInfoCard