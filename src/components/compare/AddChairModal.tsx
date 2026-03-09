'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Chair } from '@/types/catalog'

interface Props {
  open: boolean
  chairs: Chair[]
  compareIds: string[]
  onAdd: (id: string) => void
  onClose: () => void
}

export function AddChairModal({ open, chairs, compareIds, onAdd, onClose }: Props) {
  const [query, setQuery] = useState('')

  // Reset search on close
  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  // Close on Esc
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const filtered = chairs.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        data-testid="modal-overlay"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">添加商品</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="搜索椅子名称…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 transition-colors"
            autoFocus
          />
        </div>
        <ul className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-gray-400">没有找到相关商品</li>
          ) : (
            filtered.map((chair) => {
              const added = compareIds.includes(chair.id)
              return (
                <li key={chair.id}>
                  <button
                    disabled={added}
                    onClick={() => { onAdd(chair.id); onClose() }}
                    className={`w-full text-left px-5 py-3 flex items-center justify-between text-sm transition-colors ${
                      added
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>{chair.name}</span>
                    {added && <span className="text-xs text-gray-300">已添加</span>}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
