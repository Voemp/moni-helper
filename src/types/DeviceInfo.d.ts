/**
 * 设备信息
 * @param {string} name 设备名称
 * @param {string} port 端口号
 * @param {boolean} status 设备状态 true:在线 false:离线
 */
export interface DeviceInfo {
  name: string
  port: string
  status: boolean
}