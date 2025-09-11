import appIcon from '@/renderer/assets/app_icon.svg'
import CloseIcon from '@/renderer/assets/window_close_icon.svg?react'
import MaximizeIcon from '@/renderer/assets/window_maximize_icon.svg?react'
import MinimizeIcon from '@/renderer/assets/window_minimize_icon.svg?react'
import RestoreIcon from '@/renderer/assets/window_restore_icon.svg?react'
import { useEffect, useState } from 'react'

const TitleBar = () => {
  const [platform, setPlatform] = useState<string>()
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.ipcRenderer.invoke('get-platform').then(r => setPlatform(r))
    window.ipcRenderer.on('window-state-changed', (_, state: string) => setIsMaximized(state === 'maximized'))
  }, [])

  const minimize = () => window.ipcRenderer.send('window-minimize')
  const maximize = () => {
    window.ipcRenderer.send('window-maximize')
    setIsMaximized(!isMaximized)
  }
  const close = () => window.ipcRenderer.send('window-close')

  if (platform === 'darwin') {
    return (
      <div
        className="
            select-none app-region-drag h-10
            flex items-center justify-center
            bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200
          "
      >
        <h4 className="mt-5">Moni</h4>
        <img src={appIcon} alt="appIcon" className="w-5 h-5 mx-2" />
        <h4 className="mt-5">Helper</h4>
      </div>
    )
  } else {
    return (
      <div
        className="
            select-none app-region-drag h-10
            flex items-center justify-between
            bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200
          "
      >
        {/* 左侧 Logo + 标题 */}
        <div className="mt-1 ml-1 flex items-center">
          <img src={appIcon} alt="appIcon" className="w-5 h-5 m-2" />
          <span className="mt-0.5 font-bold">MoniHelper</span>
        </div>

        {/* 右侧窗口控制按钮 */}
        <div className="w-28 mt-1 mr-2 flex items-center justify-between">
          {/* 最小化按钮 */}
          <div
            onClick={minimize}
            className="app-region-no-drag w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
          >
            <MinimizeIcon className="w-4 h-4 fill-neutral-900 dark:fill-neutral-200" />
          </div>

          {/* 最大化/还原按钮 */}
          <div
            onClick={maximize}
            className="app-region-no-drag w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
          >
            {isMaximized ? (
              <RestoreIcon className="w-4 h-4 fill-neutral-900 dark:fill-neutral-200" />
            ) : (
              <MaximizeIcon className="w-4 h-4 fill-neutral-900 dark:fill-neutral-200" />
            )}
          </div>

          {/* 关闭按钮 */}
          <div
            onClick={close}
            className="group app-region-no-drag w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-600 cursor-pointer transition-colors"
          >
            <CloseIcon
              className="w-4 h-4 fill-neutral-900 group-hover:fill-white dark:fill-neutral-200 dark:group-hover:fill-white transition-colors" />
          </div>
        </div>
      </div>
    )
  }
}

export default TitleBar
