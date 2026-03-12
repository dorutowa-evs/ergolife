'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { FilterState, makeDefaultFilter } from '@/types/catalog'
import { getPriceBounds } from '@/lib/catalog'

interface FilterContextValue {
  filter: FilterState
  setFilter: (f: FilterState) => void
  resetFilter: () => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const { min, max } = getPriceBounds()
  const defaultFilter = makeDefaultFilter(min, max)
  const [filterRaw, setFilterRaw] = useLocalStorage<FilterState>('chair-filter', defaultFilter)
  const filter: FilterState = { ...defaultFilter, ...filterRaw }

  const setFilter = (f: FilterState) => setFilterRaw(f)
  const resetFilter = () => setFilterRaw(defaultFilter)

  return (
    <FilterContext.Provider value={{ filter, setFilter, resetFilter }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilter must be used within FilterProvider')
  return ctx
}
