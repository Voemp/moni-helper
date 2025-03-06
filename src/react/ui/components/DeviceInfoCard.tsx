import { ClockCircleOutlined, DisconnectOutlined, InfoCircleOutlined, LinkOutlined } from "@ant-design/icons"
import {
  Badge, Button, Card, Col, ConfigProvider, Flex, Popconfirm, Row, Space, Statistic, Tag, Tooltip, Typography
} from "antd"
import { useEffect, useState } from "react"

const {Text} = Typography

interface DeviceInfoProps {
  deviceName?: string
  devicePort?: string
  deviceStatus?: boolean
  cacheSize: number
  setCacheSize: (cacheSize: number) => void
  connectDevice: () => void
  disconnectDevice: () => void
}

function DeviceInfoCard({
                          deviceName = "设备信息",
                          devicePort = "未知",
                          deviceStatus = false,
                          cacheSize,
                          setCacheSize,
                          connectDevice,
                          disconnectDevice
                        }: DeviceInfoProps) {
  const [time, setTime] = useState(new Date())
  const [versionCode, setVersionCode] = useState("")

  // 获取系统时间
  useEffect(() => {
    const timeInterval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timeInterval)
  }, [])

  // 获取软件版本号
  useEffect(() => {
    window.ipcRenderer.invoke("get-version-code").then((r) => {
      setVersionCode("v" + r)
    })
  }, [])

  // 截取字符串
  function truncate(str: string, maxLength = 10) {
    if (str.startsWith("/dev/")) str = str.substring(5, str.length)
    return str.length > maxLength ? str.substring(0, maxLength / 2) + "..." + str.substring(str.length - maxLength / 2) : str
  }


  return (
    <ConfigProvider theme={{
      components: {
        Card: {
          headerFontSize: 20
        }
      }
    }}>
      <Card title={
        <Flex style={{justifyContent: "space-between"}}>
          <Text copyable={deviceStatus} style={{fontSize: 20, marginTop: 4}}>{deviceName}</Text>
          <Space style={{marginBottom: 7, marginRight: 8}}>
            <Tooltip title={"系统时间"} placement={"bottom"}>
              <Tag icon={<ClockCircleOutlined />}>
                {new Intl.DateTimeFormat(undefined, {timeStyle: "medium"}).format(time)}
              </Tag>
            </Tooltip>
            <Tooltip title={"软件版本"} placement={"bottom"}>
              <Tag icon={<InfoCircleOutlined />}>{versionCode}</Tag>
            </Tooltip>
          </Space>
        </Flex>
      }
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
          <Col span={6}>
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
          <Col span={6}>
            <Statistic title="串口号" valueRender={() => (
              devicePort?.length > 10 ?
                <Tooltip title={devicePort}>
                  <span>{truncate(devicePort)}</span>
                </Tooltip> :
                <span>{devicePort}</span>
            )} />
          </Col>
          <Col span={6}>
            <Statistic title="数据上限" valueRender={() => (
              <Text editable={!deviceStatus ? {
                maxLength: 5,
                tooltip: false,
                onChange: (value) => {
                  setCacheSize(parseInt(value))
                },
                text: cacheSize.toString()
              } : undefined} style={{fontSize: 24, margin: 0}}>{cacheSize}</Text>
            )} />
          </Col>
        </Row>
      </Card>
    </ConfigProvider>
  )
}

export default DeviceInfoCard