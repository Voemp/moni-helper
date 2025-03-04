import { DelimiterParser } from '@serialport/parser-delimiter'
import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import * as fs from 'node:fs'
import path from 'node:path'
import { SerialPort } from 'serialport'

const isDev = process.env.NODE_ENV === 'development'

const preloadPath = path.join(app.getAppPath(), 'dist/electron/preload/index.mjs')
const indexHtmlPath = path.join(app.getAppPath(), 'dist/react')
const iconPath = isDev
  ? path.resolve('src/electron/assets/app_icon.png')
  : path.join(app.getAppPath(), 'dist/electron/assets/app_icon.png')
const appIcon = nativeImage.createFromPath(iconPath)

export interface PortsInfo {
  path: string
  manufacturer: string
  serialNumber: string
  pnpId: string
  locationId: string
  friendlyName: string
  vendorId: string
  productId: string
}

export interface DeviceData {
  data1: number[]
  data2: number[]
  data3: number[]
  data4: number[]
}

export enum ResponseCode {
  PortOpened,
  PortClosed,
  PortScanFailed,
  PortOpenFailed,
  PortCloseFailed,
  SaveFileFailed,
  SaveFileFinished,
  SaveConfirmation,
  CacheAlmostFulled,
  CacheAlreadyFulled,
  DeviceDisconnected
}

export class PortData {
  private dataCache: DeviceData
  private maxSize: number
  private sign: boolean

  constructor() {
    this.dataCache = { data1: [], data2: [], data3: [], data4: [] }
    this.maxSize = 2000
    this.sign = true
  }

  // 初始化数据缓存
  public init() {
    this.dataCache = { data1: [], data2: [], data3: [], data4: [] }
    this.maxSize = 2000
    this.sign = true
  }

  // 添加新的数据，保证长度不超过1000000
  public add(data: number[]): number {
    const dataLength = this.getLength()
    if (dataLength >= this.maxSize) {
      // 数据量超过maxSize,弹出警告
      this.sign = true
      return 2
    } else if ((dataLength >= this.maxSize - 1000) && (this.sign)) {
      // 数据量即将超过maxSize,停止接受数据
      this.sign = false
      return 1
    }
    // 添加新数据到数组末尾
    this.dataCache.data1.push(data[0]);
    this.dataCache.data2.push(data[1]);
    this.dataCache.data3.push(data[2]);
    this.dataCache.data4.push(data[3]);
    return 0
  }
  // 获取当前数组的最后500条数据,不足500条在前方补0
  public getPromiseData() {
    const dataToRenderer: DeviceData = { data1: [], data2: [], data3: [], data4: [] }
    const lenOfSlice = this.getLength() >= 500 ? 500 : this.getLength()
    dataToRenderer.data1 = this.dataCache.data1.slice(-lenOfSlice)
    dataToRenderer.data2 = this.dataCache.data2.slice(-lenOfSlice)
    dataToRenderer.data3 = this.dataCache.data3.slice(-lenOfSlice)
    dataToRenderer.data4 = this.dataCache.data4.slice(-lenOfSlice)
    if (lenOfSlice < 500) {
      dataToRenderer.data1 = Array(500 - lenOfSlice).fill(0).concat(dataToRenderer.data1)
      dataToRenderer.data2 = Array(500 - lenOfSlice).fill(0).concat(dataToRenderer.data2)
      dataToRenderer.data3 = Array(500 - lenOfSlice).fill(0).concat(dataToRenderer.data3)
      dataToRenderer.data4 = Array(500 - lenOfSlice).fill(0).concat(dataToRenderer.data4)
    }
    return Promise.resolve(dataToRenderer)
  }
  // 获取当前缓存数据的长度
  public getLength(): number {
    return this.dataCache.data1.length;
  }
  // 获取当前缓存的全部数据
  public getAllData(): DeviceData {
    return this.dataCache
  }
}

const portData = new PortData
let isReading = false
let portsInfo: PortsInfo[]
let timerId: NodeJS.Timeout
let sp: SerialPort | null
let mainWindow: BrowserWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    title: 'MoniHelper',
    icon: appIcon,
    width: 900,
    height: 700,
    minWidth: 900,
    minHeight: 700,
    show: false,
    webPreferences: {
      preload: preloadPath,
    },
    // remove the default titleBar
    titleBarStyle: 'hidden',
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? {
      titleBarOverlay: {
        color: '#FFFFFF',
        height: 20
      }
    } : {}),
  })

  if (isDev) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
  else mainWindow.loadFile(path.join(indexHtmlPath, 'index.html'))

  ipcMain.on('openPort', (_, deviceName) => startRead(deviceName))
  ipcMain.on('closePort', stopRead)
  ipcMain.on('saveFile', saveToCSV)
  ipcMain.handle('portScan', getPortsInfo)
  ipcMain.handle('readData', getData)

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
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

// 获取串口信息
async function getPortsInfo() {
  try {
    portsInfo = await SerialPort.list()
    if (portsInfo.length == 0) {
      portsInfo = [{
        path: '',
        manufacturer: '',
        serialNumber: '',
        pnpId: '',
        locationId: '',
        friendlyName: '',
        vendorId: '',
        productId: ''
      }]
    }
    return portsInfo
  } catch (error) {
    console.log(error)
    mainWindow.webContents.send('responseMessage', ResponseCode.PortScanFailed)
  }
}

// 从缓存中读取数据
async function getData() {
  return await portData.getPromiseData()
}

// 开启串口读取数据
function startRead(deviceName: string) {
  if (isReading || sp) {
    console.log('alrOpened')
    return
  }
  const portPath = getPath(deviceName)
  if (portPath.length == 0) {
    mainWindow.webContents.send('responseMessage', ResponseCode.PortScanFailed)
    return
  }

  sp = new SerialPort({ path: portPath, baudRate: 115200, autoOpen: false })
  sp.open((err) => {
    if (err) {
      mainWindow.webContents.send('responseMessage', ResponseCode.PortOpenFailed)
      return
    }

    // 设备连接情况的心跳检测
    connectDetect(portPath)

    isReading = true;
    const parser = sp?.pipe(new DelimiterParser({ delimiter: '\n' }))
    parser?.on('data', chunk => {
      const callback = portData.add(convertStringToArray(chunk.toString()))
      if (callback == 1) {
        mainWindow.webContents.send('responseMessage', ResponseCode.CacheAlmostFulled)
        console.log("要满了!!!!!!!!!!!!")
      } else if (callback == 2) {
        mainWindow.webContents.send('responseMessage', ResponseCode.CacheAlreadyFulled)
        console.log("满了!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        stopRead()
        saveToCSV()
      }
    })
  })
}

// 停止串口读取数据
function stopRead() {
  if (sp) {
    console.log('closeNOW!!!')
    isReading = false
    sp.removeAllListeners()
    sp.close((err) => {
      if (err) {
        mainWindow.webContents.send('responseMessage', ResponseCode.PortCloseFailed)
      }
    });

    // 清除通道与连接检测器
    sp = null
    clearInterval(timerId)
  }
}

function convertStringToArray(input: string): number[] {
  return input.split(',').map(item => Number(item));
}

function getPath(deviceName: string) {
  for (const pInfo of portsInfo) {
    if (pInfo.serialNumber == deviceName)
      return pInfo.path
  }
  return ''
}

async function saveToCSV(): Promise<void> {
  mainWindow.webContents.send('responseMessage', ResponseCode.SaveConfirmation)
  console.log(portData.getLength())
  const ifsave = await confirmSave()
  console.log(portData.getLength())
  if (!ifsave) {
    return
  } else {
    // 停止继续读取
    stopRead()
    return new Promise<void>((resolve, reject) => {
      // 创建文件的写入流
      const filePath = path.join(app.getAppPath(), './saveData.csv')
      const writeStream = fs.createWriteStream(filePath)
      // 获取当前的缓存数据
      const dataCache = portData.getAllData()

      // 写入CSV的标题行
      writeStream.write('data1,data2,data3,data4\n')

      // 异步逐行写入数据
      for (let i = 0; i < portData.getLength(); i++) {
        const row = [
          dataCache.data1[i],
          dataCache.data2[i],
          dataCache.data3[i],
          dataCache.data4[i]
        ];
        writeStream.write(`${row.join(',')}\n`)
      }

      // 完成写入后，关闭流
      writeStream.end()

      // 监听文件流完成事件
      writeStream.on('finish', () => {
        resolve()
      })

      // 监听文件流错误事件
      writeStream.on('error', () => {
        reject()
      })

    }).then(() => afterSave(true))
      .catch(() => afterSave(false))
  }
}

// 保存之后的处理
function afterSave(sign: boolean) {
  if (sign) {
    mainWindow.webContents.send('responseMessage', ResponseCode.SaveFileFinished)
    // 清除数据缓存
    portData.init()
  } else {
    mainWindow.webContents.send('responseMessage', ResponseCode.SaveFileFailed)
  }
}

// 确认是否保存,保存成功后会自动清除缓存
function confirmSave(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    ipcMain.once('confirmSave', (_, sign) => resolve(sign))
  })
}

function connectDetect(portPath: string) {
  timerId = setInterval(async () => {
    const psInfo = await SerialPort.list()
    const sign = psInfo.some(pInfo => pInfo.path === portPath)
    if (!sign) {
      mainWindow.webContents.send('responseMessage', ResponseCode.DeviceDisconnected)
      console.log('???????????????')
      stopRead()
      await saveToCSV()
    } else {
      console.log('嘻嘻')
    }
  }, 1000)
}