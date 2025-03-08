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