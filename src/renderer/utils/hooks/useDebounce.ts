import { useCallback, useRef } from 'react'

/**
 * useDebounce - 创建一个防抖 Hook
 * @param callback - 需要被防抖执行的回调函数
 * @param delay - 防抖延迟时间（单位：毫秒）
 * @returns 防抖后的回调函数
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T
}
