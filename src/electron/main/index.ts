import { app, BrowserWindow, ipcMain } from 'electron'
import path from "node:path";

const preload = path.join(app.getAppPath(), './dist/electron/preload/index.mjs')
const indexHtml = path.join(app.getAppPath(), './dist/react/index.html')

const createWindow = () => {
  const win = new BrowserWindow({
    title: 'Moni Helper',
    autoHideMenuBar: true,
    webPreferences: {
      preload: preload,
    },
    show: false,
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(indexHtml);
  }

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