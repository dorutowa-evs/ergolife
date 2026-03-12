'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CompareChairColumn } from './CompareChairColumn'
import { AddChairModal } from './AddChairModal'
import { formatPrice, formatMaterialLabel, formatBool, formatValue, formatAdjustment } from '@/lib/formatters'
import { getChairs } from '@/lib/catalog'
import type { Chair, Material, Color } from '@/types/catalog'

const PARAMS: {
  label: string
  getValue: (c: Chair, materials: Material[], colors: Color[]) => React.ReactNode
}[] = [
  { label: '价格',       getValue: (c) => formatPrice(c.price) },
  { label: '材质',       getValue: (c, m) => formatValue(formatMaterialLabel(c.material, m)) },
  { label: '颜色',       getValue: (c, _m, cols) => formatValue(cols.find((col) => col.id === c.color)?.name) },
  { label: '靠背高度',   getValue: (c) => `${c.backHeight} cm` },
  { label: '座高',       getValue: (c) => `${c.seatHeight} cm` },
  { label: '后仰角度',   getValue: (c) => `${c.recliningAngle}°` },
  { label: '扶手',       getValue: (c) => formatAdjustment(c.armrestAdjustment) },
  { label: '头枕',       getValue: (c) => formatAdjustment(c.headrestAdjustment) },
  { label: '腰靠',       getValue: (c) => formatBool(c.hasLumbar) },
  { label: '腰靠可调节', getValue: (c) => formatBool(c.isLumbarAdjustable) },
]

const allChairs = getChairs()

const LABEL_W = 'w-56'
const COL_W   = 'w-48'   // keep in sync with CompareChairColumn's w-48

interface Props {
  chairs: Chair[]
  compareIds: string[]
  materials: Material[]
  colors: Color[]
  isFull: boolean
  onRemove: (id: string) => void
  onAdd: (id: string) => void
}

export function CompareTable({
  chairs,
  compareIds,
  materials,
  colors,
  isFull,
  onRemove,
  onAdd,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* ── Sticky header ── */}
      <div
        className={cn('sticky top-0 z-20 bg-white flex transition-all', scrolled && 'border-b border-gray-200')}
      >
        <div className={`${LABEL_W} shrink-0 px-6 flex items-start pt-5`}>
          <Link
            href="/chairs"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
        </div>
        {chairs.map((chair) => (
          <CompareChairColumn key={chair.id} chair={chair} onRemove={onRemove} />
        ))}
        {!isFull && (
          <button
            onClick={() => setModalOpen(true)}
            className={`${COL_W} shrink-0 px-4 pt-5 pb-4 flex flex-col items-center group`}
          >
            <div className="h-36 w-full rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center mb-4 group-hover:border-gray-400 transition-colors">
              <Plus className="w-7 h-7 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <span className="text-sm text-gray-400 group-hover:text-gray-600 transition-colors">
              添加商品
            </span>
          </button>
        )}
      </div>

      {/* ── Section header ── */}
      <div className="flex bg-gray-50 border-t border-b border-gray-100">
        <div className={`${LABEL_W} shrink-0 px-6 py-3`}>
          <span className="text-sm font-medium text-gray-600">基础参数</span>
        </div>
        {chairs.map((chair) => (
          <div key={chair.id} className={`${COL_W} shrink-0`} />
        ))}
        {!isFull && <div className={`${COL_W} shrink-0`} />}
      </div>

      {/* ── Parameter rows ── */}
      {PARAMS.map((param) => (
        <div
          key={param.label}
          className="flex border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className={`${LABEL_W} shrink-0 px-6 py-5 text-sm text-gray-500 flex items-center`}>
            {param.label}
          </div>
          {chairs.map((chair) => (
            <div
              key={chair.id}
              className={`${COL_W} shrink-0 px-4 py-5 text-sm text-gray-800 flex items-center justify-center`}
            >
              {param.getValue(chair, materials, colors)}
            </div>
          ))}
          {!isFull && <div className={`${COL_W} shrink-0`} />}
        </div>
      ))}

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
