import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import path from 'node:path'

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

const preloadPath = path.join(app.getAppPath(), './dist/electron/preload/index.mjs')
const indexHtmlPath = VITE_DEV_SERVER_URL
  ? VITE_DEV_SERVER_URL
  : path.join(app.getAppPath(), './dist/react/index.html')
const iconPath = VITE_DEV_SERVER_URL
  ? path.resolve('./src/electron/assets/app_icon.png')
  : path.join(app.getAppPath(), './dist/electron/assets/app_icon.png')
const appIcon = nativeImage.createFromPath(iconPath)


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

  win.once('ready-to-show', () => {
    win.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.on('ping', () => console.log('pong'))

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})