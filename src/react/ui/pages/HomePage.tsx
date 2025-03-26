import ActionCard from '@/react/ui/components/ActionCard.tsx'
import CenterAlert from '@/react/ui/components/CenterAlert.tsx'
import DataChartCard from '@/react/ui/components/DataChartCard.tsx'
import DeviceInfoCard from '@/react/ui/components/DeviceInfoCard.tsx'
import SaveStatusCard from '@/react/ui/components/SaveStatusCard.tsx'
import { DeviceData } from '@/types/DeviceData'
import { DeviceInfo } from '@/types/DeviceInfo'
import { ResponseCode } from '@/types/ResponseCode.ts'
import { Col, Empty, Flex, message, Row } from 'antd'
import { useEffect, useState } from 'react'

const HomePage = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | undefined>(undefined)
  const [deviceData, setDeviceData] = useState<DeviceData | undefined>(undefined)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isCacheFull, setIsCacheFull] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectErrorAlert, setShowConnectErrorAlert] = useState(false)
  const [showUnexpectDisconnectAlert, setUnexpectDisconnectAlert] = useState(false)
  const [showCacheAlreadyFulledAlert, setShowCacheAlreadyFulledAlert] = useState(false)
  const [showSaveResult, setShowSaveResult] = useState(false)
  const [saveResult, setSaveResult] = useState<boolean | undefined>(undefined)
  const [cacheSize, setCacheSize] = useState(parseInt(localStorage.getItem('cacheSize')!) || 10000)

  // 获取设备数据
  useEffect(() => {
    if (!isMonitoring || !deviceInfo?.status) return
    const dataInterval = setInterval(() => {
      handleGetDeviceData()
    }, 100)
    return () => clearInterval(dataInterval)
  }, [isMonitoring, deviceInfo?.status])

  // 监听消息
  useEffect(() => {
    window.ipcRenderer.on('responseMessage', (_, msg) => {
      switch (msg) {
        // 设备意外断开
        case ResponseCode.DeviceDisconnected:
          setUnexpectDisconnectAlert(true)
          setDeviceInfo(undefined)
          setIsMonitoring(false)
          break
        // 数据缓存已满
        case ResponseCode.CacheAlreadyFulled:
          setShowCacheAlreadyFulledAlert(true)
          setIsMonitoring(false)
          setIsCacheFull(true)
          break
        // 数据即将到达缓存上限
        case ResponseCode.CacheAlmostFulled:
          message.warning({content: '数据即将达到缓存上限（80%）', style: {marginTop: 30}})
          break
        // 保存文件完成
        case ResponseCode.SaveFileFinished:
          setShowSaveResult(true)
          setSaveResult(true)
          break
        // 保存文件失败
        case ResponseCode.SaveFileFailed:
          setShowSaveResult(true)
          setSaveResult(false)
          break
      }
    })
    return () => {
      window.ipcRenderer.removeAllListeners('responseMessage')
    }
  }, [])


  return (
    <>
      <Flex vertical>
        <>
          <CenterAlert visible={showConnectErrorAlert} message="连接失败"
                       description="可能是不支持的设备或设备未正确插入，如果仍有问题，请尝试重新拔插设备或重启程序。"
                       type="error" onClose={() => setShowConnectErrorAlert(false)} />
          <CenterAlert visible={showUnexpectDisconnectAlert} message="意外断开"
                       description="检测到设备意外断开，你仍可以保存已记录的数据。注意：重新连接设备后数据会丢失。"
                       type="error" onClose={() => setUnexpectDisconnectAlert(false)} />
          <CenterAlert visible={showCacheAlreadyFulledAlert} message="数据已达上限"
                       description="出于性能考量，数据量已达缓存上限，请保存并清空数据后再重新开始监测数据，你可以选择断开设备后更改数据上限。"
                       type="error" onClose={() => setShowCacheAlreadyFulledAlert(false)} />
        </>
        <Row gutter={8}>
          <Col span={18}>
            <DeviceInfoCard deviceInfo={deviceInfo}
                            setDeviceInfo={setDeviceInfo}
                            cacheSize={cacheSize}
                            setCacheSize={setCacheSize}
                            isConnecting={isConnecting}
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
          showSaveResult ?
            <SaveStatusCard saveResult={saveResult!} onClose={() => {
              setShowSaveResult(false)
              setSaveResult(undefined)
            }} />
            :
            deviceData ?
              <Row gutter={[8, 8]} style={{marginTop: 8}}>
                <Col span={12}>
                  <DataChartCard title="通道 1" data={deviceData?.data1} />
                </Col>
                <Col span={12}>
                  <DataChartCard title="通道 2" data={deviceData?.data2} />
                </Col>
                <Col span={12}>
                  <DataChartCard title="通道 3" data={deviceData?.data3} />
                </Col>
                <Col span={12}>
                  <DataChartCard title="通道 4" data={deviceData?.data4} />
                </Col>
              </Row>
              :
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{marginTop: 200}} />

        }
      </Flex>
    </>
  )

  // 连接设备
  function handleConnectDevice() {
    setIsConnecting(true)
    window.ipcRenderer.invoke('connect-device', deviceInfo?.name, cacheSize).then(r => {
      if (r.status) {
        setDeviceInfo({
          name: r.name,
          port: r.port,
          status: r.status
        })
        setDeviceData(undefined)
        setIsCacheFull(false)
        message.success({content: '连接成功', duration: 1, style: {marginTop: 30}})
      } else {
        setShowConnectErrorAlert(true)
        setDeviceInfo(undefined)
      }
      setIsConnecting(false)
    })
  }

  // 断开设备
  function handleDisconnectDevice() {
    window.ipcRenderer.send('disconnect-device')
    setDeviceInfo(undefined)
    setDeviceData(undefined)
    setIsMonitoring(false)
    setIsCacheFull(false)
  }

  // 开始监测数据
  function handleStartMonitoring() {
    window.ipcRenderer.send('start-monitoring')
    setIsMonitoring(true)
  }

  // 停止监测数据
  function handleStopMonitoring() {
    window.ipcRenderer.send('stop-monitoring')
    setIsMonitoring(false)
  }

  // 保存数据
  function handleSaveData() {
    window.ipcRenderer.send('save-data', deviceData)
  }

  // 删除数据
  function handleDeleteData() {
    window.ipcRenderer.send('delete-data')
    setDeviceData(undefined)
    setIsCacheFull(false)
  }

  // 获取设备数据
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