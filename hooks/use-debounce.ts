"use client"

import { useState, useEffect } from "react"

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Gecikme süresi sonunda debouncedValue'yu güncelle
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Bir sonraki effect çalışmadan önce veya component unmount olduğunda timeout'u temizle
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Sadece value veya delay değiştiğinde yeniden çalıştır

  return debouncedValue
}
