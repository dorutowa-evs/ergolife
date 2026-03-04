'use client'
import { useState } from 'react'
import type { Chair } from '@/types/catalog'

interface Props {
  compareIds: string[]
  chairs: Chair[]
  onRemove: (id: string) => void
}

export function CompareFAB({ compareIds, chairs, onRemove }: Props) {
  const [open, setOpen] = useState(false)

  if (compareIds.length === 0) return null

  const compareChairs = compareIds
    .map((id) => chairs.find((c) => c.id === id))
    .filter(Boolean) as Chair[]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
          <p className="text-xs text-gray-500 font-medium mb-2">对比列表</p>
          <ul className="space-y-2 max-h-[180px] overflow-y-auto">
            {compareChairs.map((chair) => (
              <li key={chair.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-800 truncate">{chair.name}</span>
                <button
                  aria-label={`移除 ${chair.name}`}
                  onClick={() => onRemove(chair.id)}
                  className="text-gray-400 hover:text-gray-700 shrink-0 leading-none text-base"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        aria-label={`对比 (${compareIds.length})`}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors font-medium text-sm"
      >
        <span>⚖</span>
        <span>对比</span>
        <span className="bg-white text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {compareIds.length}
        </span>
      </button>
    </div>
  )
}
