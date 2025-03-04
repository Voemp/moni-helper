import { Col, Empty, Flex, Row } from 'antd'
import { useEffect, useState } from 'react'
import { DeviceData } from '../../../types/DeviceData'
import { DeviceInfo } from '../../../types/DeviceInfo'
import ActionCard from '../components/ActionCard.tsx'
import DataAreaCard from '../components/DataAreaCard.tsx'
import DeviceInfoCard from '../components/DeviceInfoCard.tsx'

function HomePage() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | undefined>(undefined)
  const [deviceData, setDeviceData] = useState<DeviceData | undefined>(undefined)
  const [shouldMonitor, setShouldMonitor] = useState(false)

  // 获取设备数据
  useEffect(() => {
    if (!shouldMonitor || !deviceInfo?.status) return
    const dataInterval = setInterval(() => {
      handleGetDeviceData()
    }, 1000)
    return () => clearInterval(dataInterval)
  }, [shouldMonitor, deviceInfo?.status]);


  return (
    <>
      <Flex vertical style={{margin: 8}}>
        <Row gutter={8}>
          <Col span={18}>
            <DeviceInfoCard deviceName={deviceInfo?.name} deviceStatus={deviceInfo?.status}
                            devicePort={deviceInfo?.port}
                            connectDevice={handleConnectDevice}
                            disconnectDevice={handleDisconnectDevice} />
          </Col>
          <Col span={6}>
            <ActionCard startMonitoring={handleStartMonitoring} stopMonitoring={handleStopMonitoring}
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

  function handleConnectDevice() {
    window.ipcRenderer.invoke('connect-device').then(r => {
      if (r.status) {
        setDeviceInfo({
          name: r.name,
          status: r.status,
          port: r.port
        })
      }
    })
  }

  function handleDisconnectDevice() {
    window.ipcRenderer.invoke('disconnect-device').then(r => {
      if (r) {
        cleanDeviceInfo()
      }
    })
  }

  function cleanDeviceInfo() {
    setDeviceInfo({
      name: '',
      status: false,
      port: ''
    })
  }

  function handleStartMonitoring() {
    setShouldMonitor(true)
  }

  function handleStopMonitoring() {
    setShouldMonitor(false)
  }

  function handleSaveData() {
    window.ipcRenderer.invoke('save-data', deviceData).then(r => {
      if (r) {
        console.log('保存成功')
      }
    })
  }

  function handleGetDeviceData() {
    window.ipcRenderer.invoke('get-device-data').then(r => {
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