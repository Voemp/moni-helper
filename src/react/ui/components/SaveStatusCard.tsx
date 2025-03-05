import { Button, Result } from "antd"

interface SaveStatusCardProps {
  saveResult: boolean,
  onClose: () => void
}

function SaveStatusCard({saveResult, onClose}: SaveStatusCardProps) {
  return (saveResult ?
      <Result
        status="success"
        title="保存成功"
        subTitle="数据文件已经保存到所选择的路径中。"
        extra={[
          <Button type="primary" onClick={onClose}>
            确认
          </Button>
        ]}
      /> :
      <Result
        status="error"
        title="保存失败"
        subTitle="数据文件保存失败，请检查所选择的路径是否有写入权限。"
        extra={[
          <Button type="primary" onClick={onClose}>
            确认
          </Button>
        ]}
      />
  )
}

export default SaveStatusCard