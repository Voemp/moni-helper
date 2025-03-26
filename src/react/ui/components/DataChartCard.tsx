import { Card } from 'antd'
import * as echarts from 'echarts'
import { useEffect, useRef, useState } from 'react'


interface DataChartProps {
  title?: string
  data?: number[] | undefined
}

const DataChartCard = ({title = '未命名', data = undefined}: DataChartProps) => {
  // 当前主题状态
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem('lastTheme') === 'true' || false)

  useEffect(() => {
    // 监听主题更新事件
    window.ipcRenderer.on('theme-updated', (_, isDarkMode: boolean) => {
      setDarkTheme(isDarkMode)
    })
  }, [])

  // 图表容器引用
  const chartRef = useRef(null)
  // 外层容器引用，用于监听尺寸变化
  const containerRef = useRef<HTMLDivElement>(null)
  // 图表实例
  const chartInstance = useRef<echarts.ECharts | null>(null)

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current)
    return () => chartInstance.current?.dispose()
  }, [])

  // 更新图表
  useEffect(() => {
    if (!chartInstance.current) return
    const option = {
      title: {
        text: title,
        textStyle: {
          color: darkTheme ? '#CDCDCD' : '#1F1F1F'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: darkTheme ? '#141414' : '#ffffff',
        borderColor: darkTheme ? '#141414' : '#ffffff',
        textStyle: {
          color: darkTheme ? '#CDCDCD' : '#1F1F1F'
        },
        formatter: (params: { marker: string, data: number }[]) => {
          return `${params[0].marker} ${params[0].data}`
        }
      },
      xAxis: {
        type: 'category',
        animationDurationUpdate: 100,
        axisTick: {
          interval: (data!.length / 5) - 1
        },
        axisLabel: {
          interval: (data!.length / 5) - 1
        }
      },
      yAxis: {
        type: 'value',
        animationDurationUpdate: 100,
        splitLine: {
          lineStyle: {
            color: darkTheme ? '#303641' : '#E0E6F1'
          }
        }
      },
      series: [
        {
          type: 'line',
          symbol: 'none',
          smooth: true,
          animationDuration: 0,
          lineStyle: {
            color: 'rgb(22, 119, 255, 0.5)',
            width: 1
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(22, 119, 255, 1)'
              },
              {
                offset: 1,
                color: 'rgba(22, 119, 255, 0)'
              }
            ])
          },
          data: data
        }
      ]
    }
    chartInstance.current.setOption(option)
  }, [data, title, darkTheme])

  // 使用 ResizeObserver 监听外层容器尺寸变化
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize()
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // 根据窗口大小计算图表高度
  const getChartHeight = () => (window.innerHeight - 240) * 0.5
  const [chartHeight, setChartHeight] = useState(getChartHeight())

  // 监听窗口 resize 事件，更新高度状态
  useEffect(() => {
    const handleWindowResize = () => {
      setChartHeight(getChartHeight())
    }
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  return (
    <div ref={containerRef} style={{height: chartHeight}}>
      <Card style={{padding: 0, height: '100%'}}>
        <div ref={chartRef} style={{width: '104%', height: chartHeight}} />
      </Card>
    </div>
  )
}

export default DataChartCard