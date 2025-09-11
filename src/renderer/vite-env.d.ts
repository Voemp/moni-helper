/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface Window {
  ipcRenderer: import('electron').IpcRenderer
}