import { DeleteOutlined, DownloadOutlined, PlayCircleOutlined, StopOutlined } from "@ant-design/icons"
import { Button, Card, ConfigProvider, Flex, Popconfirm } from "antd"

interface ActionCardProps {
  deviceStatus?: boolean
  isMonitoring?: boolean
  isCacheFull?: boolean
  hasGotData?: boolean
  startMonitoring: () => void
  stopMonitoring: () => void
  saveData: () => void
  deleteData: () => void
}

function ActionCard({
                      deviceStatus = false,
                      isMonitoring = false,
                      isCacheFull = false,
                      hasGotData = false,
                      startMonitoring,
                      stopMonitoring,
                      saveData,
                      deleteData
                    }: ActionCardProps) {
  return (
    <ConfigProvider theme={{
      components: {
        Card: {
          bodyPadding: 12,
        }
      }
    }}>
      <Card>
        <Flex vertical justify="space-between" align="center" style={{height: 142}}>
          {!isCacheFull ?
            <Button onClick={startMonitoring} icon={<PlayCircleOutlined />} style={{width: "100%", height: "30%"}}
                    type="primary" disabled={!deviceStatus || isMonitoring}>开始监测</Button> :
            <Popconfirm
              title="确认要清空数据吗？"
              description="请确保数据已经保存完毕，以防丢失数据。"
              okText="确认"
              cancelText="取消"
              onConfirm={deleteData}
              placement="bottomRight">
              <Button danger icon={<DeleteOutlined />} style={{width: "100%", height: "30%"}}
                      type="primary" disabled={!deviceStatus || isMonitoring}>清空数据</Button>
            </Popconfirm>
          }
          {(isMonitoring || !hasGotData) ?
            <Button onClick={stopMonitoring} icon={<StopOutlined />} style={{width: "100%", height: "30%"}}
                    disabled={!deviceStatus || !isMonitoring}>停止监测</Button> :
            <Popconfirm
              title="确认要清空数据吗？"
              description="请确保数据已经保存完毕，以防丢失数据。"
              okText="确认"
              cancelText="取消"
              onConfirm={deleteData}
              placement="bottomRight">
              <Button danger icon={<DeleteOutlined />} style={{width: "100%", height: "30%"}}
                      type="primary" disabled={!deviceStatus || isMonitoring}>清空数据</Button>
            </Popconfirm>
          }

          <Button onClick={saveData} icon={<DownloadOutlined />} style={{width: "100%", height: "30%"}}
                  disabled={isMonitoring || !hasGotData}>保存数据</Button>
        </Flex>
      </Card>
    </ConfigProvider>
  )
}

export default ActionCard