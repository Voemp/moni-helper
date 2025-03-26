import { useCallback, useRef } from 'react'

/**
 * useThrottle - 创建一个节流 Hook
 * @param callback - 需要被节流执行的回调函数
 * @param delay - 节流延迟时间（单位：毫秒）
 * @returns 节流后的回调函数
 */
export function useThrottle<T extends (...args: Parameters<T>) => void>(callback: T, delay: number): T {
  const lastCallRef = useRef<number>(0)

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callback(...args)
      }
    },
    [callback, delay]
  ) as T
}
