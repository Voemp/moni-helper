import { useEffect, useState } from "react"
import appIcon from "../../assets/app_icon.svg"
import "./TitleBar.css"
import CloseIcon from "../../assets/window_close_icon.svg?react"
import MaximizeIcon from "../../assets/window_maximize_icon.svg?react"
import MinimizeIcon from "../../assets/window_minimize_icon.svg?react"
import RestoreIcon from "../../assets/window_restore_icon.svg?react"

export const TitleBar = ({isDarkMode = false}: { isDarkMode: boolean }) => {
  const onBackgroundColor = isDarkMode ? "#DCDCDC" : "#1F1F1F"
  const [platform, setPlatform] = useState()
  window.ipcRenderer.invoke("get-platform").then(r => setPlatform(r))

  const [isMaximized, setIsMaximized] = useState(false)

  const minimize = () => {
    window.ipcRenderer.send("window-minimize")
  }
  const maximize = () => {
    window.ipcRenderer.send("window-maximize")
    setIsMaximized(!isMaximized)
  }
  const close = () => {
    window.ipcRenderer.send("window-close")
  }

  const [controllerIcon, setControllerIcon] = useState("controllerIcon light")

  useEffect(() => {
    if (isDarkMode) {
      setControllerIcon("controllerIcon dark")
    } else {
      setControllerIcon("controllerIcon light")
    }
  }, [isDarkMode])

  return (
    <>
      {platform === "darwin" ? (
        <div className={"titleBar isDarwin"}>
          <h4 className={"titleText"} style={{color: onBackgroundColor}}>Moni</h4>
          <img src={appIcon} alt={"appIcon"} className={"appIcon"} />
          <h4 className={"titleText"} style={{color: onBackgroundColor}}>Helper</h4>
        </div>
      ) : (
        <div className={"titleBar"}>
          <div className={"titleBarLogo"}>
            <img src={appIcon} alt={"appIcon"} className={"appIcon"} />
            <h4 className={"titleText"} style={{color: onBackgroundColor}}>Moni Helper</h4>
          </div>
          <div className={"windowController"}>
            <MinimizeIcon onClick={minimize} fill={onBackgroundColor} className={controllerIcon} />
            {isMaximized ? (
              <RestoreIcon onClick={maximize} fill={onBackgroundColor} className={controllerIcon} />
            ) : (
              <MaximizeIcon onClick={maximize} fill={onBackgroundColor} className={controllerIcon} />
            )}
            <CloseIcon onClick={close} fill={onBackgroundColor} className={controllerIcon} />
          </div>
        </div>
      )}
    </>
  )

}