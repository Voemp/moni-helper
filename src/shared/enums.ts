/**
 * 响应码
 * @enum {number}
 */
export enum ResponseCode {
  PortOpened,
  PortClosed,
  PortScanFailed,
  PortOpenFailed,
  PortCloseFailed,
  SaveFileFailed,
  SaveFileFinished,
  SaveConfirmation,
  CacheAlmostFulled,
  CacheAlreadyFulled,
  DeviceDisconnected
}
