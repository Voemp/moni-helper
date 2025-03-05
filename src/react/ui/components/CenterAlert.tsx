import { Alert } from "antd"

interface CenterAlertProps {
  visible: boolean
  message: string
  description: string
  type: "success" | "info" | "warning" | "error"
  onClose: () => void
}

function CenterAlert({visible = false, message, description, type, onClose}: CenterAlertProps) {
  if (!visible) return null

  return (
    <div style={{
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 2,
    }}>
      <Alert
        message={message}
        showIcon
        description={description}
        type={type}
        closable
        onClose={onClose}
      />
    </div>
  )
}

export default CenterAlert