import { DisconnectOutlined, LinkOutlined } from "@ant-design/icons"
import { Badge, Button, Card, Col, ConfigProvider, Flex, Popconfirm, Row, Statistic, Tooltip } from "antd"
import { useEffect, useState } from "react"

interface DeviceInfoProps {
  deviceName?: string
  devicePort?: string
  deviceStatus?: boolean
  connectDevice: () => void
  disconnectDevice: () => void
}

function DeviceInfoCard({
                          deviceName = "设备信息",
                          devicePort = "未知",
                          deviceStatus = false,
                          connectDevice,
                          disconnectDevice
                        }: DeviceInfoProps) {
  // 显示时间
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timeInterval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timeInterval)
  }, [])

  // 截取字符串
  const truncate = (str: string, maxLength = 10) =>
    str.length > maxLength ? str.substring(0, maxLength / 2) + "..." + str.substring(str.length - maxLength / 2) : str

  return (
    <ConfigProvider theme={{
      components: {
        Card: {
          headerFontSize: 20
        }
      }
    }}>
      <Card title={deviceName}
            extra={!deviceStatus ?
              <Button onClick={connectDevice} icon={<LinkOutlined />}>连接设备</Button> :
              <Popconfirm
                title="确认要断开连接吗？"
                description="请确保数据已经保存完毕，以防丢失数据。"
                okText="确认"
                cancelText="取消"
                onConfirm={disconnectDevice}>
                <Button icon={<DisconnectOutlined />} danger>断开设备</Button>
              </Popconfirm>

            }>
        <Row gutter={4}>
          <Col span={7}>
            <Statistic title="连接状态" valueRender={() => (
              <Flex justify={"flex-start"} align="center">
                {deviceStatus ? "已连接" : "未连接"}
                <Badge
                  status={deviceStatus ? "success" : "error"}
                  style={{marginLeft: 8}}
                />
              </Flex>
            )} />
          </Col>
          <Col span={7}>
            <Statistic title="串口号" valueRender={() => (
              devicePort?.length > 10 ?
                <Tooltip title={devicePort}>
                  <span>{truncate(devicePort)}</span>
                </Tooltip> :
                <span>{devicePort}</span>
            )} />
          </Col>
          <Col span={7}>
            <Statistic title="系统时间"
                       value={new Intl.DateTimeFormat(undefined, {timeStyle: "medium"}).format(time)} />
          </Col>
        </Row>
      </Card>
    </ConfigProvider>
  )
}

export default DeviceInfoCard