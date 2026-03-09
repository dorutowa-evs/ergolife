'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Chair } from '@/types/catalog'

interface Props {
  compareIds: string[]
  chairs: Chair[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

export function CompareFAB({ compareIds, chairs, onRemove, onClearAll }: Props) {
  const [open, setOpen] = useState(false)

  if (compareIds.length === 0) return null

  const compareChairs = compareIds
    .map((id) => chairs.find((c) => c.id === id))
    .filter(Boolean) as Chair[]

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-medium">对比列表</p>
            <button
              onClick={onClearAll}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              清除全部
            </button>
          </div>
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

      <Link
        href="/compare"
        target="_blank"
        aria-label={`对比 (${compareIds.length})`}
        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors font-medium text-sm"
      >
        <span>⚖</span>
        <span>对比</span>
        <span className="bg-white text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {compareIds.length}
        </span>
      </Link>
    </div>
  )
}
