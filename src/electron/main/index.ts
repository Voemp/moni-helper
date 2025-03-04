import { app, BrowserWindow, nativeImage } from 'electron'
import path from 'node:path'

const isDev = process.env.NODE_ENV === 'development'

const preloadPath = path.join(app.getAppPath(), 'dist/electron/preload/index.mjs')
const indexHtmlPath = path.join(app.getAppPath(), 'dist/react')
const iconPath = isDev
  ? path.resolve('src/electron/assets/app_icon.png')
  : path.join(app.getAppPath(), 'dist/electron/assets/app_icon.png')
const appIcon = nativeImage.createFromPath(iconPath)


const createWindow = () => {
  const mainWindow = new BrowserWindow({
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
  })

  if (isDev) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!)
  else mainWindow.loadFile(path.join(indexHtmlPath, 'index.html'))

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