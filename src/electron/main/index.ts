import { app, BrowserWindow, nativeImage } from 'electron'
import path from 'node:path'

const isDev = process.env.NODE_ENV === 'development'

const preloadPath = path.join(app.getAppPath(), './dist/electron/preload/index.mjs')
const indexHtmlPath = isDev
  ? process.env.VITE_DEV_SERVER_URL as string
  : path.join(app.getAppPath(), './dist/react/index.html')
const iconPath = isDev
  ? path.resolve('./src/electron/assets/app_icon.png')
  : path.join(app.getAppPath(), './dist/electron/assets/app_icon.png')
const appIcon = nativeImage.createFromPath(iconPath)


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    title: 'Moni Helper',
    icon: appIcon,
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
    },
    show: false,
  })

  mainWindow.loadURL(indexHtmlPath);

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