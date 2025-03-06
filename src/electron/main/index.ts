import path from "node:path"
import * as fs from "node:fs"
import { app, BrowserWindow, dialog, ipcMain, nativeImage } from "electron"
import { updateElectronApp, UpdateSourceType } from "update-electron-app"
import { SerialPort } from "serialport"
import { DelimiterParser } from "@serialport/parser-delimiter"
import { DeviceData } from "../../types/DeviceData"
import { DeviceInfo } from "../../types/DeviceInfo"
import { ResponseCode } from "../../types/ResponseCode"

updateElectronApp({
  updateSource: {
    type: UpdateSourceType.ElectronPublicUpdateService,
    repo: "Voemp/moni-helper"
  }
})

const isDev = process.env.NODE_ENV === "development"

const preloadPath = path.join(app.getAppPath(), "dist/electron/preload/index.mjs")
const indexHtmlPath = path.join(app.getAppPath(), "dist/react")
const iconPath = isDev
  ? path.resolve("src/electron/assets/app_icon.png")
  : path.join(app.getAppPath(), "dist/electron/assets/app_icon.png")
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

export class PortData {
  private dataCache: DeviceData
  private maxSize: number
  private sign: boolean

  constructor() {
    this.dataCache = {data1: [], data2: [], data3: [], data4: []}
    this.maxSize = 2000
    this.sign = true
  }

  // 初始化数据缓存
  public initData() {
    this.dataCache = {data1: [], data2: [], data3: [], data4: []}
    this.sign = true
  }

  // 设置数据缓存容量
  public setCacheSize(cacheSize: number) {
    this.maxSize = cacheSize
  }

  // 添加新的数据
  public add(data: number[]): number {
    const dataLength = this.getLength()
    if (dataLength >= this.maxSize) {
      // 数据量超过maxSize,弹出警告
      this.sign = true
      return 2
    } else if ((dataLength >= this.maxSize * 0.8) && (this.sign)) {
      // 数据量即将超过maxSize,停止接受数据
      this.sign = false
      return 1
    }
    // 添加新数据到数组末尾
    this.dataCache.data1.push(data[0])
    this.dataCache.data2.push(data[1])
    this.dataCache.data3.push(data[2])
    this.dataCache.data4.push(data[3])
    return 0
  }

  // 获取当前数组的最后500条数据,不足500条在前方补0
  public getPromiseData() {
    const dataToRenderer: DeviceData = {data1: [], data2: [], data3: [], data4: []}
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
    return this.dataCache.data1.length
  }

  // 获取当前缓存的全部数据
  public getAllData(): DeviceData {
    return this.dataCache
  }
}

export class Detector {
  private sp: SerialPort | null
  private timerId: NodeJS.Timeout | null
  private isPause: boolean
  private dInfo: DeviceInfo

  constructor() {
    this.sp = null
    this.timerId = null
    this.isPause = false
    this.dInfo = {name: "", port: "", status: false}
  }

  // 重置设备信息
  public initDeviceInfo() {
    this.dInfo = {name: "", port: "", status: false}
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

  // 新建监听端口
  public initSP(portPath: string) {
    if (this.getSPInitStat()) {
      console.log("SP alr Init")
      return
    }
    this.isPause = false
    this.sp = new SerialPort({path: portPath, baudRate: 115200, autoOpen: false})
    // 创建心跳检测器, 持续检测设备连接状态
    this.initTimer(this.dInfo.port)
  }

  // 关闭并销毁监听端口
  public closeAndDeleteSP() {
    if (!this.getSPInitStat()) {
      console.log("SP has not Init")
      return
    }
    // 关闭监听端口
    this.sp?.removeAllListeners()
    this.sp?.close((err) => {
      if (err) {
        mainWindow.webContents.send("responseMessage", ResponseCode.PortCloseFailed)
      }
    })
    // 清除端口与连接检测器
    this.sp = null
    this.isPause = false
    this.stopTimer()
  }

  // 打开监听端口, 若被暂停则恢复
  public openOrResumeSP() {
    // 防止重复打开端口
    if (this.sp?.isOpen) {
      console.log("SP alr Open")
      if (this.isPause) {
        console.log("SP is Resume")
        this.isPause = false
      } else {
        console.log("SP has not Paused")
      }
      return
    }
    this.sp?.open((err) => {
      if (err) {
        mainWindow.webContents.send("responseMessage", ResponseCode.PortOpenFailed)
        return
      }
      // 创建数据流管道并开始读入数据
      makePipe(this.sp as SerialPort)
    })
  }

  // 暂停监听端口
  public pauseSP() {
    if (this.sp?.isOpen) {
      if (this.isPause) {
        console.log("SP alr Paused")
      } else {
        console.log("SP is Pause")
        this.isPause = true
      }
    }
  }

  // 获取端口初始化状态
  public getSPInitStat(): boolean {
    return !!this.sp
  }

  // 获取端口暂停状态
  public getSPPauseStat(): boolean {
    return this.isPause
  }

  // 初始化心跳检测器
  public initTimer(portPath: string) {
    this.timerId = setInterval(async () => {
      const psInfo = await SerialPort.list()
      const sign = psInfo.some(pInfo => pInfo.path === portPath)
      if (!sign) {
        mainWindow.webContents.send("responseMessage", ResponseCode.DeviceDisconnected)
        console.log("Device disconnected unexpectedly")
        this.initDeviceInfo()
        this.closeAndDeleteSP()
      } else {
        console.log("Device connecting")
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
    title: "MoniHelper",
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
    titleBarStyle: "hidden",
    // expose window controls in Windows/Linux
    ...(process.platform !== "darwin" ? {
      titleBarOverlay: {
        color: "#FFFFFF",
        height: 20
      }
    } : {}),
  })

  if (isDev) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
  else mainWindow.loadFile(path.join(indexHtmlPath, "index.html"))

  ipcMain.handle("connect-device", (_, deviceName, cacheSize) => getDeviceInfo(deviceName, cacheSize))
  ipcMain.on("disconnect-device", disconnectDevice)

  ipcMain.handle("get-device-data", getData)
  ipcMain.on("start-monitoring", startRead)
  ipcMain.on("stop-monitoring", stopRead)

  ipcMain.on("save-data", saveToCSV)
  ipcMain.on("delete-data", clearCache)

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

// 获取串口信息, 若获得信息则初始化监听端口
async function getDeviceInfo(deviceName: string, cacheSize: number) {
  try {
    const portsInfo = await SerialPort.list()
    const portPath = getPath(deviceName, portsInfo)
    if (portPath.length == 0) {
      console.log("name: ", detector.getDeviceInfo().name, "port: ", detector.getDeviceInfo().port)
      return detector.getDeviceInfo()
    } else {
      detector.setDeviceInfo({name: deviceName, port: portPath, status: true})
      console.log("name: ", detector.getDeviceInfo().name, "port: ", detector.getDeviceInfo().port)
      // 初始化数据缓存并创建监听端口
      portData.initData()
      portData.setCacheSize(cacheSize)
      detector.initSP(detector.getDeviceInfo().port)
      return detector.getDeviceInfo()
    }
  } catch (error) {
    console.log(error)
    mainWindow.webContents.send("responseMessage", ResponseCode.PortScanFailed)
  }
}

// 从缓存中读取数据
async function getData() {
  return await portData.getPromiseData()
}

// 为已创建的端口绑定管道
function makePipe(sp: SerialPort) {
  const parser = sp.pipe(new DelimiterParser({delimiter: "\n"}))
  parser.on("data", (chunk: Buffer) => {
    // 若当前端口为暂停状态, 放弃当前Buffer内的数据
    if (detector.getSPPauseStat()) {
      chunk.fill("")
      return
    }
    const callback = portData.add(convertStringToArray(chunk.toString()))
    if (callback == 1) {
      mainWindow.webContents.send("responseMessage", ResponseCode.CacheAlmostFulled)
      console.log("Data cache nearly full!!!!!")
    } else if (callback == 2) {
      mainWindow.webContents.send("responseMessage", ResponseCode.CacheAlreadyFulled)
      console.log("Data cache fulled, read stopped!!!!!!")
      stopRead()
    }
  })
}

// 从已初始化的串口中读取数据
function startRead() {
  // 防止串口未初始化
  if (!detector.getSPInitStat()) {
    console.log("SP has not init")
    return
  }
  // 创建或继续监听端口
  detector.openOrResumeSP()
}

// 停止串口读取数据
function stopRead() {
  // 防止串口未初始化
  if (!detector.getSPInitStat()) {
    console.log("SP has not init")
    return
  }
  // 暂停监听窗口
  detector.pauseSP()
}

// 销毁监听端口并断开设备, 同时清除数据缓存
function disconnectDevice() {
  clearCache()
  detector.initDeviceInfo()
  detector.closeAndDeleteSP()
}

// 清空缓存数据
function clearCache() {
  portData.initData()
}

function convertStringToArray(input: string): number[] {
  return input.split(",").map(item => Number(item))
}

function getPath(deviceName: string, portsInfo: PortsInfo[]) {
  if (portsInfo.length == 0) {
    return ""
  }
  for (const pInfo of portsInfo) {
    if (pInfo.serialNumber == deviceName)
      return pInfo.path
  }
  return ""
}

// 将缓存数据保存至CSV文件
async function saveToCSV(): Promise<void> {
  // 停止继续读取
  stopRead()
  // 弹出窗口等待用户指定保存位置
  const savePath = await showSaveDialog()
  console.log("path to save:", savePath)
  console.log("length of cache:", portData.getLength())
  try {
    await new Promise<void>((resolve, reject) => {
      // 若用户取消保存, 直接返回
      if (savePath.length == 0) return
      // 创建文件的写入流
      const writeStream = fs.createWriteStream(savePath)
      // 获取当前的缓存数据
      const dataCache = portData.getAllData()
      // 写入CSV的标题行
      writeStream.write("data1,data2,data3,data4\n")
      // 异步逐行写入数据
      for (let i = 0; i < portData.getLength(); i++) {
        const row = [
          dataCache.data1[i],
          dataCache.data2[i],
          dataCache.data3[i],
          dataCache.data4[i]
        ]
        writeStream.write(`${row.join(",")}\n`)
      }
      // 完成写入后，关闭流
      writeStream.end()
      // 监听文件流完成事件
      writeStream.on("finish", () => resolve())
      // 监听文件流错误事件
      writeStream.on("error", () => reject())
    })
    return mainWindow.webContents.send("responseMessage", ResponseCode.SaveFileFinished)
  } catch {
    return mainWindow.webContents.send("responseMessage", ResponseCode.SaveFileFailed)
  }
}

// 确认是否保存,保存成功后会自动清除缓存
async function showSaveDialog(): Promise<string> {
  const savePath = await dialog.showSaveDialog({
    filters: [
      {name: "CSV Files", extensions: ["csv"]},
      {name: "TXT Files", extensions: ["txt"]}],
    properties: ["showHiddenFiles", "createDirectory"],
    defaultPath: "saveData.csv"
  })
  return savePath.filePath
}
