import { DelimiterParser } from '@serialport/parser-delimiter'
import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import * as fs from 'node:fs'
import path from 'node:path'
import { SerialPort } from 'serialport'
import { DeviceInfo } from '../../types/DeviceInfo'
import { ResponseCode } from '../../types/ResponseCode'

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

export class PortData {
  private dataCache: DeviceData
  private maxSize: number
  private sign: boolean
  private dInfo: DeviceInfo

  constructor() {
    this.dInfo = { name: '', port: '', status: false }
    this.dataCache = { data1: [], data2: [], data3: [], data4: [] }
    this.maxSize = 2000
    this.sign = true
  }

  // 初始化数据缓存
  public init() {
    this.dInfo = { name: '', port: '', status: false }
    this.dataCache = { data1: [], data2: [], data3: [], data4: [] }
    this.maxSize = 2000
    this.sign = true
  }

  // 设置设备信息
  public setDeviceInfo(dInfo: DeviceInfo) {
    this.dInfo.name = dInfo.name
    this.dInfo.port = dInfo.port
    this.dInfo.status = dInfo.status
  }

  // 获取设备信息
  public getDeviceInfo(): DeviceInfo {
    return this.dInfo
  }

  // 获取连接状态
  public getConnectState(): boolean {
    return this.dInfo.port.length != 0
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

export class Detector {
  private sp: SerialPort | null
  private timerId: NodeJS.Timeout | null
  constructor() {
    this.sp = null
    this.timerId = null
  }

  // 新建监听端口
  public initSP(portPath: string) {
    if (this.getSPStat()) {
      console.log('SP alr Init')
      return
    }
    this.sp = new SerialPort({ path: portPath, baudRate: 115200, autoOpen: false })
  }

  // 关闭监听端口
  public stopSP() {
    this.sp?.removeAllListeners()
    this.sp?.close((err) => {
      if (err) {
        mainWindow.webContents.send('responseMessage', ResponseCode.PortCloseFailed)
      }
      // 清除通道与连接检测器
      this.sp = null
      this.stopTimer()
    });
  }

  // 打开监听端口,并开始接受数据
  public openSP() {
    // 防止重复打开端口
    if (this.sp?.isOpen) {
      console.log('SP alr Open')
      return
    }
    this.sp?.open((err) => {
      if (err) {
        mainWindow.webContents.send('responseMessage', ResponseCode.PortOpenFailed)
        return
      }
      // 对设备连接情况进行心跳检测
      this.initTimer(portData.getDeviceInfo().port)
      // 创建数据流管道并开始读入数据
      const parser = this.sp?.pipe(new DelimiterParser({ delimiter: '\n' }))
      parser?.on('data', chunk => {
        const callback = portData.add(convertStringToArray(chunk.toString()))
        if (callback == 1) {
          mainWindow.webContents.send('responseMessage', ResponseCode.CacheAlmostFulled)
          console.log("Data cache nearly full!!!!!")
        } else if (callback == 2) {
          mainWindow.webContents.send('responseMessage', ResponseCode.CacheAlreadyFulled)
          console.log("Data cache fulled, read stopped!!!!!!")
          stopRead()
          saveToCSV()
        }
      })
    })
  }

  // 获取端口状态
  public getSPStat(): boolean {
    return !!this.sp
  }

  // 初始化心跳检测器
  public initTimer(portPath: string) {
    this.timerId = setInterval(async () => {
      const psInfo = await SerialPort.list()
      const sign = psInfo.some(pInfo => pInfo.path === portPath)
      if (!sign) {
        mainWindow.webContents.send('responseMessage', ResponseCode.DeviceDisconnected)
        console.log('Device disconnected unexpectedly')
        stopRead()
        await saveToCSV()
      } else {
        console.log('Device connecting')
      }
    }, 1000)
  }

  // 关闭心跳检测器
  public stopTimer() {
    clearInterval(this.timerId as NodeJS.Timeout)
    this.timerId = null
  }
}

const portData = new PortData
const detector = new Detector
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

  ipcMain.handle('get-device-data', getData)
  ipcMain.handle('connect-device', (_, deviceName) => getDeviceInfo(deviceName))
  ipcMain.on('start-monitoring', startRead)
  ipcMain.on('disconnect-device', stopRead)
  ipcMain.on('saveFile', saveToCSV)

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
async function getDeviceInfo(deviceName: string) {
  try {
    const portsInfo = await SerialPort.list()
    const portPath = getPath(deviceName, portsInfo)
    if (portPath.length == 0) {
      console.log('name: ', portData.getDeviceInfo().name, 'port: ', portData.getDeviceInfo().port)
      return portData.getDeviceInfo()
    } else {
      portData.setDeviceInfo({ name: deviceName, port: portPath, status: true })
      console.log('name: ', portData.getDeviceInfo().name, 'port: ', portData.getDeviceInfo().port)
      // 创建监听端口
      detector.initSP(portData.getDeviceInfo().port)
      return portData.getDeviceInfo()
    }
  } catch (error) {
    console.log(error)
    mainWindow.webContents.send('responseMessage', ResponseCode.PortScanFailed)
  }
}

// 从缓存中读取数据
async function getData() {
  return await portData.getPromiseData()
}

// 从已初始化的串口中读取数据
function startRead() {
  // 防止串口未初始化就读取
  if (!detector.getSPStat()) {
    console.log('SP has not init')
    return
  }
  console.log('name: ', portData.getDeviceInfo().name, 'port: ', portData.getDeviceInfo().port)
  // 创建监听端口
  detector.openSP()
}

// 停止串口读取数据
function stopRead() {
  if (detector.getSPStat()) {
    console.log('closeNOW!!!')
    detector.stopSP()
  }
}

function convertStringToArray(input: string): number[] {
  return input.split(',').map(item => Number(item));
}

function getPath(deviceName: string, portsInfo: PortsInfo[]) {
  if (portsInfo.length == 0) {
    return ''
  }
  for (const pInfo of portsInfo) {
    if (pInfo.serialNumber == deviceName)
      return pInfo.path
  }
  return ''
}

async function saveToCSV(): Promise<void> {
  mainWindow.webContents.send('responseMessage', ResponseCode.SaveConfirmation)
  console.log('lenght of cache:', portData.getLength())
  const saveConfirm = await confirmSave()
  console.log('lenght of cache:', portData.getLength())
  if (!saveConfirm) {
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
