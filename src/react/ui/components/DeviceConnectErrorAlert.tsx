import { Alert } from 'antd'

interface DeviceConnectErrorAlertProps {
  visible?: boolean
  onClose: () => void
}

function DeviceConnectErrorAlert({visible = false, onClose}: DeviceConnectErrorAlertProps) {
  if (!visible) return null

  return (
    <div style={{
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 2,
    }}>
      <Alert
        message="连接失败"
        showIcon
        description="请检查设备是否正确插入，如果仍有问题，请尝试重新拔插设备或重启程序。"
        type="error"
        closable
        onClose={onClose}
      />
    </div>
  )
}

export default DeviceConnectErrorAlert