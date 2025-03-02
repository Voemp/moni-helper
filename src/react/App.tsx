import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { PortsInfo } from '../electron/main/index'
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
  const getPortsInfo = async () => {
    const portsInfo: PortsInfo[] = await window.ipcRenderer.invoke('portScan')
    setPortsInfo(portsInfo)
  }

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
          test
        </button>
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
