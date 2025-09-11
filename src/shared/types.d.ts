/**
 * 设备数据类型
 * @interface DeviceData
 * @property {number[]} data1 - 数据1
 * @property {number[]} data2 - 数据2
 * @property {number[]} data3 - 数据3
 * @property {number[]} data4 - 数据4
 */
export interface DeviceData {
  data1: number[]
  data2: number[]
  data3: number[]
  data4: number[]
}

/**
 * 设备信息
 * @interface DeviceInfo
 * @property {string} [name] - 设备名称
 * @property {string} [port] - 设备端口
 * @property {boolean} [status] - 设备状态 true: 在线 false: 离线
 */
export interface DeviceInfo {
  name: string
  port: string
  status: boolean
}
