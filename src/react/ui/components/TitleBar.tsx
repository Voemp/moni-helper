import { useState } from 'react'
import appIcon from '../../assets/app_icon.svg'
import './TitleBar.css'
import CloseIcon from '../../assets/window_close_icon.svg?react'
import MaximizeIcon from '../../assets/window_maximize_icon.svg?react'
import MinimizeIcon from '../../assets/window_minimize_icon.svg?react'
import RestoreIcon from '../../assets/window_restore_icon.svg?react'

export const TitleBar = () => {
  const [platform, setPlatform] = useState()
  window.ipcRenderer.invoke('get-platform').then(r => setPlatform(r))

  const [isMaximized, setIsMaximized] = useState(false)

  const minimize = () => {
    window.ipcRenderer.send('window-minimize')
  }
  const maximize = () => {
    window.ipcRenderer.send('window-maximize')
    setIsMaximized(!isMaximized)
  }
  const close = () => {
    window.ipcRenderer.send('window-close')
  }

  return (
    <>
      {platform === 'darwin' ?
        <div className="titleBar isDarwin">
          <h4 className="titleText">Moni</h4>
          <img src={appIcon} alt="appIcon" className="appIcon" />
          <h4 className="titleText">Helper</h4>
        </div>
        :
        <div className="titleBar">
          <div className="titleBarLogo">
            <img src={appIcon} alt="appIcon" className="appIcon" />
            <h4 className="titleText">Moni Helper</h4>
          </div>
          <div className="windowController">
            <MinimizeIcon onClick={minimize} className="controllerIcon" />
            {isMaximized ?
              <RestoreIcon onClick={maximize} className="controllerIcon" />
              :
              <MaximizeIcon onClick={maximize} className="controllerIcon" />
            }
            <CloseIcon onClick={close} className="controllerIcon" />
          </div>
        </div>
      }
    </>
  )
}
