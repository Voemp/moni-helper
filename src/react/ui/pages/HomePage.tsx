import { Col, Empty, Flex, Row } from 'antd'
import { useEffect, useState } from 'react'
import { DeviceData } from '../../../types/DeviceData'
import { DeviceInfo } from '../../../types/DeviceInfo'
import ActionCard from '../components/ActionCard.tsx'
import DataAreaCard from '../components/DataAreaCard.tsx'
import DeviceConnectErrorAlert from '../components/DeviceConnectErrorAlert.tsx'
import DeviceInfoCard from '../components/DeviceInfoCard.tsx'

function HomePage() {
  const myDeviceName = 'FX2348N'
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | undefined>(undefined)
  const [deviceData, setDeviceData] = useState<DeviceData | undefined>(undefined)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [showConnectErrorAlert, setShowConnectErrorAlert] = useState(false)

  // 获取设备数据
  useEffect(() => {
    if (!isMonitoring || !deviceInfo?.status) return
    const dataInterval = setInterval(() => {
      handleGetDeviceData()
    }, 1000)
    return () => clearInterval(dataInterval)
  }, [isMonitoring, deviceInfo?.status]);


  return (
    <>
      <Flex vertical style={{margin: 8}}>
        <DeviceConnectErrorAlert visible={showConnectErrorAlert} onClose={() => setShowConnectErrorAlert(false)} />
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
                        hasGotData={deviceData !== undefined}
                        startMonitoring={handleStartMonitoring}
                        stopMonitoring={handleStopMonitoring}
                        saveData={handleSaveData} />
          </Col>
        </Row>
        {deviceData ?
          <Row gutter={[8, 8]} style={{marginTop: 8}}>
            <Col span={12}>
              <DataAreaCard title={'通道 1'} value={deviceData?.data1} />
            </Col>
            <Col span={12}>
              <DataAreaCard title={'通道 2'} value={deviceData?.data2} />
            </Col>
            <Col span={12}>
              <DataAreaCard title={'通道 3'} value={deviceData?.data3} />
            </Col>
            <Col span={12}>
              <DataAreaCard title={'通道 4'} value={deviceData?.data4} />
            </Col>
          </Row> :
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'暂无数据'} style={{marginTop: 200}} />
        }
      </Flex>
    </>
  )

  async function handleConnectDevice() {
    await window.ipcRenderer.invoke('connect-device', myDeviceName).then(r => {
      if (r.status) {
        setDeviceInfo({
          name: r.name,
          port: r.port,
          status: r.status
        })
      } else {
        setShowConnectErrorAlert(true)
      }
    })
  }

  function handleDisconnectDevice() {
    window.ipcRenderer.send('disconnect-device')
    setDeviceInfo(undefined)
    setDeviceData(undefined)
    setIsMonitoring(false)
  }

  function handleStartMonitoring() {
    window.ipcRenderer.send('start-monitoring')
    setIsMonitoring(true)
  }

  function handleStopMonitoring() {
    window.ipcRenderer.send('stop-monitoring')
    setIsMonitoring(false)
  }

  function handleSaveData() {
    window.ipcRenderer.invoke('save-data', deviceData).then(r => {
      if (r) {
        console.log('保存成功')
      }
    })
  }

  async function handleGetDeviceData() {
    await window.ipcRenderer.invoke('get-device-data').then(r => {
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