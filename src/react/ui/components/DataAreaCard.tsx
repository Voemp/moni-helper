import { Area } from "@ant-design/charts"
import { Card, ConfigProvider } from "antd"
import { useEffect, useState } from "react"

interface DataAreaProps {
  title?: string
  value?: number[] | undefined
}

function DataAreaCard({title = '未命名', value = undefined}: DataAreaProps) {
  // 初始化数据
  const data = value?.map((value, index) => ({value, index}))

  // 计算窗口可用高度
  const getChartHeight = () => (window.innerHeight - 262) * 0.5

  const [chartHeight, setChartHeight] = useState(getChartHeight())

  // 监听窗口变化
  useEffect(() => {
    const handleResize = () => {
      setChartHeight(getChartHeight())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const areaConfig = {
    data: data,
    title: title,
    xField: 'index',
    yField: 'value',
    animate: false,
    shapeField: 'smooth',
    smooth: true,
    height: chartHeight,
    marginBottom: 0,
    style: {
      fill: 'linear-gradient(-90deg, white 0%, #1677FF 100%)',
    }
  }

  return (
    <ConfigProvider theme={{
      components: {
        Card: {
          bodyPadding: 4,
        }
      }
    }}>
      <Card hoverable>
        <Area {...areaConfig} />
      </Card>
    </ConfigProvider>
  )
}

export default DataAreaCard