import { Col, Empty, Flex, message, Row } from "antd"
import { useEffect, useState } from "react"
import { DeviceData } from "../../../types/DeviceData"
import { DeviceInfo } from "../../../types/DeviceInfo"
import { ResponseCode } from "../../../types/ResponseCode.ts"
import ActionCard from "../components/ActionCard.tsx"
import CenterAlert from "../components/CenterAlert.tsx"
import DataAreaCard from "../components/DataAreaCard.tsx"
import DeviceInfoCard from "../components/DeviceInfoCard.tsx"

function HomePage() {
  const myDeviceName = "FX2348N"
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | undefined>(undefined)
  const [deviceData, setDeviceData] = useState<DeviceData | undefined>(undefined)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isCacheFull, setIsCacheFull] = useState(false)
  const [showConnectErrorAlert, setShowConnectErrorAlert] = useState(false)
  const [showUnexpectDisconnectAlert, setUnexpectDisconnectAlert] = useState(false)
  const [showCacheAlreadyFulledAlert, setShowCacheAlreadyFulledAlert] = useState(false)

  // 获取设备数据
  useEffect(() => {
    if (!isMonitoring || !deviceInfo?.status) return
    const dataInterval = setInterval(() => {
      handleGetDeviceData()
    }, 500)
    return () => clearInterval(dataInterval)
  }, [isMonitoring, deviceInfo?.status])

  // 监听设备意外断开事件
  window.ipcRenderer.on("responseMessage", (_, message) => {
    if (message === ResponseCode.DeviceDisconnected) {
      setUnexpectDisconnectAlert(true)
      setDeviceInfo(undefined)
      setIsMonitoring(false)
    }
  })

  // 监听缓存已满事件
  window.ipcRenderer.on("responseMessage", (_, message) => {
    if (message === ResponseCode.CacheAlreadyFulled) {
      setShowCacheAlreadyFulledAlert(true)
      setIsMonitoring(false)
      setIsCacheFull(true)
    }
  })

  return (
    <>
      <>
        <CenterAlert visible={showConnectErrorAlert} message={"连接失败"}
                     description={"请检查设备是否正确插入，如果仍有问题，请尝试重新拔插设备或重启程序。"}
                     type={"error"} onClose={() => setShowConnectErrorAlert(false)} />
        <CenterAlert visible={showUnexpectDisconnectAlert} message={"意外断开"}
                     description={"检测到设备意外断开，你仍可以保存已记录的数据。\n注意：重新连接设备后数据会丢失。"}
                     type={"error"} onClose={() => setUnexpectDisconnectAlert(false)} />
        <CenterAlert visible={showCacheAlreadyFulledAlert} message={"数据已达上限"}
                     description={"由于性能考虑，数据量已达缓存上限，请保存并清空数据后再重新开始监测数据。"}
                     type={"error"} onClose={() => setShowCacheAlreadyFulledAlert(false)} />
      </>
      <Flex vertical style={{margin: 8}}>
        <Row gutter={8}>
          <Col span={18}>
            <DeviceInfoCard deviceName={deviceInfo?.name}
                            devicePort={deviceInfo?.port}
                            deviceStatus={deviceInfo?.status}
                            connectDevice={handleConnectDevice}
                            disconnectDevice={handleDisconnectDevice} />
          </Col>
          <Col span={6}>
            <ActionCard deviceStatus={deviceInfo?.status}
                        isMonitoring={isMonitoring}
                        isCacheFull={isCacheFull}
                        hasGotData={deviceData !== undefined}
                        startMonitoring={handleStartMonitoring}
                        stopMonitoring={handleStopMonitoring}
                        saveData={handleSaveData}
                        deleteData={handleDeleteData} />
          </Col>
        </Row>
        {
          deviceData ?
            <Row gutter={[8, 8]} style={{marginTop: 8}}>
              <Col span={12}>
                <DataAreaCard title={"通道 1"} value={deviceData?.data1} />
              </Col>
              <Col span={12}>
                <DataAreaCard title={"通道 2"} value={deviceData?.data2} />
              </Col>
              <Col span={12}>
                <DataAreaCard title={"通道 3"} value={deviceData?.data3} />
              </Col>
              <Col span={12}>
                <DataAreaCard title={"通道 4"} value={deviceData?.data4} />
              </Col>
            </Row> :
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"暂无数据"} style={{marginTop: 200}} />
        }
      </Flex>
    </>
  )

  async function handleConnectDevice() {
    await window.ipcRenderer.invoke("connect-device", myDeviceName).then(r => {
      if (r.status) {
        setDeviceInfo({
          name: r.name,
          port: r.port,
          status: r.status
        })
        setDeviceData(undefined)
        setIsCacheFull(false)
        message.success({content: "连接成功", duration: 1, style: {marginTop: 30}})
      } else {
        setShowConnectErrorAlert(true)
      }
    })
  }

  function handleDisconnectDevice() {
    window.ipcRenderer.send("disconnect-device")
    setDeviceInfo(undefined)
    setDeviceData(undefined)
    setIsMonitoring(false)
    setIsCacheFull(false)
  }

  function handleStartMonitoring() {
    window.ipcRenderer.send("start-monitoring")
    setIsMonitoring(true)
  }

  function handleStopMonitoring() {
    window.ipcRenderer.send("stop-monitoring")
    setIsMonitoring(false)
  }

  function handleSaveData() {
    window.ipcRenderer.invoke("save-data", deviceData).then(r => {
      if (r) {
        console.log("保存成功")
      }
    })
  }

  function handleDeleteData() {
    window.ipcRenderer.send("delete-data")
    setDeviceData(undefined)
    setIsCacheFull(false)
  }

  async function handleGetDeviceData() {
    await window.ipcRenderer.invoke("get-device-data").then(r => {
      if (r) {
        setDeviceData({
          data1: r.data1,
          data2: r.data2,
          data3: r.data3,
          data4: r.data4
        })
      }
    })
  }
}

export default HomePage