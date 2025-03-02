import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import path from 'node:path'
import { SerialPort } from 'serialport'
// import { DelimiterParser } from '@serialport/parser-delimiter'

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

const preloadPath = path.join(app.getAppPath(), './dist/electron/preload/index.mjs')
const indexHtmlPath = VITE_DEV_SERVER_URL
  ? VITE_DEV_SERVER_URL
  : path.join(app.getAppPath(), './dist/react/index.html')
const iconPath = VITE_DEV_SERVER_URL
  ? path.resolve('./src/electron/assets/app_icon.png')
  : path.join(app.getAppPath(), './dist/electron/assets/app_icon.png')
const appIcon = nativeImage.createFromPath(iconPath)

export interface PortsInfo{
  path: string
  manufacturer: string
  serialNumber: string
  pnpId: string
  locationId: string
  friendlyName: string
  vendorId: string
  productId: string
}

const createWindow = () => {
  const win = new BrowserWindow({
    title: 'Moni Helper',
    icon: appIcon,
    frame: true,
    webPreferences: {
      preload: preloadPath,
    },
    show: false,
  })

  win.loadURL(indexHtmlPath);
  ipcMain.handle('portScan', getPortsInfo)

  win.once('ready-to-show', () => {
    win.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


async function getPortsInfo() {
  try {
    const ports: PortsInfo[] = await SerialPort.list()
    return ports
  } catch (error) {
    console.log(error)
  }
}

// getPortsInfo()
// const sp = new SerialPort({ path: 'COM5', baudRate: 115200 })
// const parser = sp.pipe(new DelimiterParser({ delimiter: '\n' }))


// parser.on('data', chunk => {
//   console.log(chunk.toString()); // 打印收到的数据
// });

// 以 paused mode 监听收到的数据，需要主动读取数据
// sp.on('readable', () => {
//     console.log(sp.read()); // 使用read方法读取数据，可以指定读取字节数
// });

// 以 flowing mode 监听收到的数据
// sp.on('data', (data) => {
//     console.log(data);
// });
