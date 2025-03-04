import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { PortsInfo, DeviceData } from '../electron/main/index'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [portsInfo, setPortsInfo] = useState<PortsInfo[]>([{
    path: '',
    manufacturer: '',
    serialNumber: '',
    pnpId: '',
    locationId: '',
    friendlyName: '',
    vendorId: '',
    productId: ''
  }]);
  const [deviceData, setDeviceData] = useState<DeviceData>({ data1: [], data2: [], data3: [], data4: [] })
  const [btAvailable, setAvailable] = useState<boolean>(false)
  const getPortsInfo = async () => {
    const portsInfo: PortsInfo[] = await window.ipcRenderer.invoke('portScan')
    setPortsInfo(portsInfo)
  }
  const openPort = () => {
    window.ipcRenderer.send('openPort', 'FX2348N')
  }
  const readData = async () => {
    const data: DeviceData = await window.ipcRenderer.invoke('readData')
    setDeviceData(data)
  }
  const closePort = () => {
    window.ipcRenderer.send('closePort')
  }
  const saveFile = () => {
    window.ipcRenderer.send('saveFile')
  }
  const confirmSave = (sign: boolean) => {
    window.ipcRenderer.send('confirmSave', sign)
    setAvailable(false)
  }
  // useEffect(() => {
  //   console.log('useEffect is running');
  //   window.ipcRenderer.on('responseMessage', (_, message) => {
  //     if (message == ResponseCode.SaveConfirmation) {
  //       setAvailable(true)
  //     }
  //   })
  // },[])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)} className="button">
          count is {count}
        </button>
        <button onClick={getPortsInfo} className="button">
          portScan
        </button>
        <button onClick={openPort} className="button">
          openPort
        </button>
        <button onClick={closePort} className="button">
          closePort
        </button>
        <button onClick={readData} className="button">
          readData
        </button>
        <button onClick={saveFile} className="button">
          saveFile
        </button>
        <button onClick={() => confirmSave(true)} disabled={btAvailable} className="button">
          confirmTrue
        </button>
        <button onClick={() => confirmSave(false)} disabled={btAvailable} className="button">
          confirmFalse
        </button>
      </div>
      <div>
        <div>
          <h1>Numbers</h1>
          <p><strong>data.1:</strong> {deviceData.data1[0]} {deviceData.data1[249]} {deviceData.data1[499]}</p>
          <p><strong>data.2:</strong> {deviceData.data2[0]} {deviceData.data2[249]} {deviceData.data2[499]}</p>
          <p><strong>data.3:</strong> {deviceData.data3[0]} {deviceData.data3[249]} {deviceData.data3[499]}</p>
          <p><strong>data.4:</strong> {deviceData.data4[0]} {deviceData.data4[249]} {deviceData.data4[499]}</p>
          <p><strong>length:</strong> {deviceData.data1.length}</p>
        </div>
        <div>
          <h1>Port Information</h1>
          <p><strong>Path:</strong> {portsInfo[0].path}</p>
          <p><strong>Manufacturer:</strong> {portsInfo[0].manufacturer}</p>
          <p><strong>Serial Number:</strong> {portsInfo[0].serialNumber}</p>
          <p><strong>PNP ID:</strong> {portsInfo[0].pnpId}</p>
          <p><strong>Location ID:</strong> {portsInfo[0].locationId}</p>
          <p><strong>Friendly Name:</strong> {portsInfo[0].friendlyName}</p>
          <p><strong>Vendor ID:</strong> {portsInfo[0].vendorId}</p>
          <p><strong>Product ID:</strong> {portsInfo[0].productId}</p>
        </div>

      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
