import {
  ClockCircleOutlined, DisconnectOutlined, FrownOutlined, InfoCircleOutlined, LinkOutlined
} from "@ant-design/icons"
import {
  Badge, Button, Card, Col, ConfigProvider, Flex, Popconfirm, Row, Select, Space, Statistic, Tag, Tooltip, Typography
} from "antd"
import { useEffect, useState } from "react"
import { DeviceInfo } from "../../../types/DeviceInfo"

const {Text} = Typography

interface DeviceInfoProps {
  deviceInfo?: DeviceInfo
  setDeviceInfo: (deviceInfo: DeviceInfo) => void
  cacheSize: number
  setCacheSize: (cacheSize: number) => void
  isConnecting: boolean
  connectDevice: () => void
  disconnectDevice: () => void
}

function DeviceInfoCard({
                          deviceInfo = {
                            name: "设备信息",
                            port: "未知",
                            status: false
                          },
                          setDeviceInfo,
                          cacheSize,
                          setCacheSize,
                          isConnecting,
                          connectDevice,
                          disconnectDevice
                        }: DeviceInfoProps) {
  const [time, setTime] = useState(new Date())
  const [versionCode, setVersionCode] = useState("")
  const [deviceList, setDeviceList] = useState<string[]>([])
  const [hasGetDeviceList, setHasGetDeviceList] = useState(false)
  const [dataAccuracy, setDataAccuracy] = useState(parseInt(localStorage.getItem("dataAccuracy")!) || 500)

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
          <Text copyable={deviceInfo.status} style={{fontSize: 20, marginTop: 4}}>{deviceInfo.name}</Text>
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
            extra={!deviceInfo.status ?
              deviceInfo.name === "设备信息" ?
                <Select defaultActiveFirstOption={false} placeholder="选择设备"
                        notFoundContent={
                          <Flex style={{justifyContent: "space-between"}}>
                            <FrownOutlined />
                            <span>没有设备</span>
                          </Flex>}
                        options={deviceList?.map((d) => ({
                          value: d,
                          label: d
                        }))} onFocus={getDeviceList} onBlur={() => setHasGetDeviceList(false)} onChange={setDeviceName}
                        style={{width: 110}}></Select> :
                <Button type="primary" onClick={() => {
                  connectDevice()
                  window.ipcRenderer.send("set-data-accuracy", dataAccuracy)
                }} icon={<LinkOutlined />}
                        loading={isConnecting}>连接设备</Button> :
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
              <Flex justify="flex-start" align="center">
                {deviceInfo.status ? "已连接" : "未连接"}
                <Badge
                  status={deviceInfo.status ? "success" : "error"}
                  style={{marginLeft: 8}}
                />
              </Flex>
            )} />
          </Col>
          <Col span={6}>
            <Statistic title="串口号" valueRender={() => (
              deviceInfo.port?.length > 10 ?
                <Tooltip title={deviceInfo.port}>
                  <span>{truncate(deviceInfo.port)}</span>
                </Tooltip> :
                <span>{deviceInfo.port}</span>
            )} />
          </Col>
          <Col span={6}>
            <Statistic title="数据上限" valueRender={() => (
              <Text editable={!deviceInfo.status ? {
                maxLength: 5,
                onChange: (value) => {
                  if (Number.isNaN(parseInt(value)) || parseInt(value) < 0) return
                  else if (parseInt(value) > 50000) value = "50000"
                  setCacheSize(parseInt(value))
                  localStorage.setItem("cacheSize", value)
                },
                text: cacheSize.toString()
              } : undefined} style={{fontSize: 24, margin: 0}}>{cacheSize}</Text>
            )} />
          </Col>
          <Col span={6}>
            <Statistic title="图表精度" valueRender={() => (
              <Text editable={{
                maxLength: 4,
                onChange: (value) => {
                  if (Number.isNaN(parseInt(value)) || parseInt(value) < 10) return
                  else if (parseInt(value) > 2000) value = "2000"
                  window.ipcRenderer.send("set-data-accuracy", parseInt(value))
                  setDataAccuracy(parseInt(value))
                  localStorage.setItem("dataAccuracy", value)
                },
                text: dataAccuracy.toString()
              }} style={{fontSize: 24, margin: 0}}>{dataAccuracy}</Text>
            )} />
          </Col>
        </Row>
      </Card>
    </ConfigProvider>
  )

  // 截取字符串
  function truncate(str: string, maxLength = 10) {
    if (str.startsWith("/dev/")) str = str.substring(5, str.length)
    return str.length > maxLength ? str.substring(0, maxLength / 2) + "..." + str.substring(str.length - maxLength / 2) : str
  }

  // 获取设备列表
  async function getDeviceList() {
    if (hasGetDeviceList) return
    setHasGetDeviceList(true)
    await window.ipcRenderer.invoke("get-device-list").then(r => {
      if (r) {
        setDeviceList(r)
      }
    })
  }

  function setDeviceName(deviceName: string) {
    setDeviceInfo({
      name: deviceName,
      port: "未知",
      status: false
    })
  }
}


export default DeviceInfoCard