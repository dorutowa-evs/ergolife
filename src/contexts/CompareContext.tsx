'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const MAX_COMPARE = 5

interface CompareContextValue {
  compareList: string[]
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  isInCompare: (id: string) => boolean
  isFull: boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useLocalStorage<string[]>('compare-list', [])

  const addToCompare = (id: string) => {
    if (compareList.includes(id)) return
    if (compareList.length >= MAX_COMPARE) return
    setCompareList([...compareList, id])
  }

  const removeFromCompare = (id: string) =>
    setCompareList(compareList.filter((i) => i !== id))

  const isInCompare = (id: string) => compareList.includes(id)
  const isFull = compareList.length >= MAX_COMPARE

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, isFull }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
