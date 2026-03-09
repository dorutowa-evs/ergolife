'use client'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { CompareChairColumn } from './CompareChairColumn'
import { AddChairModal } from './AddChairModal'
import { formatPrice, formatMaterialLabel, formatBool, formatValue } from '@/lib/formatters'
import type { Chair, Material, Color } from '@/types/catalog'

const PARAMS: {
  label: string
  getValue: (c: Chair, materials: Material[], colors: Color[]) => React.ReactNode
}[] = [
  {
    label: '价格',
    getValue: (c) => (
      <span className="text-xl font-semibold text-gray-900">{formatPrice(c.price)}</span>
    ),
  },
  { label: '材质', getValue: (c, m) => formatValue(formatMaterialLabel(c.material, m)) },
  { label: '颜色', getValue: (c, _m, cols) => formatValue(cols.find((col) => col.id === c.color)?.name) },
  { label: '头枕', getValue: (c) => formatBool(c.hasHeadrest) },
  { label: '腰靠', getValue: (c) => formatBool(c.hasLumbar) },
  { label: '腰靠可调节', getValue: (c) => formatBool(c.isLumbarAdjustable) },
]

// Label column width — shared between header spacer, section row, and param rows
const LABEL_W = 'w-56'
// Chair column width — shared between header cells and param cells
const CHAIR_W = 'w-52'
// Add column width
const ADD_W = 'w-44'

interface Props {
  chairs: Chair[]
  allChairs: Chair[]
  compareIds: string[]
  materials: Material[]
  colors: Color[]
  isFull: boolean
  onRemove: (id: string) => void
  onReorder: (newOrder: string[]) => void
  onAdd: (id: string) => void
}

export function CompareTable({
  chairs,
  allChairs,
  compareIds,
  materials,
  colors,
  isFull,
  onRemove,
  onReorder,
  onAdd,
}: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function handleMove(id: string, direction: 'left' | 'right') {
    const idx = compareIds.indexOf(id)
    if (idx === -1) return
    const next = direction === 'left' ? idx - 1 : idx + 1
    if (next < 0 || next >= compareIds.length) return
    const newOrder = [...compareIds]
    ;[newOrder[idx], newOrder[next]] = [newOrder[next], newOrder[idx]]
    onReorder(newOrder)
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-max">

          {/* ── Sticky header row ── */}
          <div
            className={`sticky top-0 z-20 bg-white flex transition-shadow ${
              scrolled ? 'border-b border-gray-200' : ''
            }`}
          >
            <div className={`${LABEL_W} shrink-0`} />
            {chairs.map((chair, i) => (
              <CompareChairColumn
                key={chair.id}
                chair={chair}
                isFirst={i === 0}
                isLast={i === chairs.length - 1}
                onMoveLeft={() => handleMove(chair.id, 'left')}
                onMoveRight={() => handleMove(chair.id, 'right')}
                onRemove={onRemove}
              />
            ))}
            {!isFull && (
              <div className={`${ADD_W} shrink-0 flex items-end px-4 pb-5`}>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加商品
                </button>
              </div>
            )}
          </div>

          {/* ── Section header ── */}
          <div className="flex bg-gray-50 border-t border-b border-gray-100">
            <div className={`${LABEL_W} shrink-0 px-6 py-3`}>
              <span className="text-sm font-medium text-gray-600">基础参数</span>
            </div>
            {chairs.map((chair) => (
              <div key={chair.id} className={`${CHAIR_W} shrink-0`} />
            ))}
            {!isFull && <div className={`${ADD_W} shrink-0`} />}
          </div>

          {/* ── Parameter rows ── */}
          {PARAMS.map((param, i) => (
            <div
              key={param.label}
              className={`flex border-b border-gray-100 transition-colors ${
                hoveredRow === i ? 'bg-gray-50' : 'bg-white'
              }`}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className={`${LABEL_W} shrink-0 px-6 py-5 text-sm text-gray-500 flex items-center`}>
                {param.label}
              </div>
              {chairs.map((chair) => (
                <div
                  key={chair.id}
                  className={`${CHAIR_W} shrink-0 px-4 py-5 text-sm text-gray-800 flex items-center`}
                >
                  {param.getValue(chair, materials, colors)}
                </div>
              ))}
              {!isFull && <div className={`${ADD_W} shrink-0`} />}
            </div>
          ))}

        </div>
      </div>

      <AddChairModal
        open={modalOpen}
        chairs={allChairs}
        compareIds={compareIds}
        onAdd={onAdd}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
