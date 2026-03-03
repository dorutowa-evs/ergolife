import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 首次渲染（含 SSR）始终返回 initialValue，保证服务端与客户端一致
  const [stored, setStored] = useState<T>(initialValue)

  // 挂载后读取 localStorage，不触发 Hydration Mismatch
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) setStored(JSON.parse(item) as T)
    } catch {
      // 解析失败保持 initialValue
    }
  }, [key])

  const setValue = useCallback((value: T) => {
    setStored(value)
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略写入失败（隐私模式等）
    }
  }, [key])

  return [stored, setValue] as const
}
