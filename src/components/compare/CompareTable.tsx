'use client'
import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Plus, Armchair } from 'lucide-react'
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

const LABEL_W = 'w-44'
const COL_W   = 'w-44'   // shared by chair columns, add column, and param cells

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
  onAdd,
}: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = compareIds.indexOf(String(active.id))
    const newIndex = compareIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(compareIds, oldIndex, newIndex))
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-max">

          {/* ── Sticky header row ── */}
          <div
            className={`sticky top-0 z-20 bg-white flex transition-all ${
              scrolled ? 'border-b border-gray-200' : ''
            }`}
          >
            <div className={`${LABEL_W} shrink-0`} />

            {/* Sortable chair columns */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={compareIds} strategy={horizontalListSortingStrategy}>
                {chairs.map((chair) => (
                  <CompareChairColumn key={chair.id} chair={chair} onRemove={onRemove} />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add column — same width and structure as a chair column */}
            {!isFull && (
              <button
                onClick={() => setModalOpen(true)}
                className={`${COL_W} shrink-0 px-4 pt-5 pb-4 flex flex-col items-center group`}
              >
                <div className="h-28 w-full rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center mb-3 group-hover:border-gray-400 transition-colors">
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
                  className={`${COL_W} shrink-0 px-4 py-5 text-sm text-gray-800 flex items-center`}
                >
                  {param.getValue(chair, materials, colors)}
                </div>
              ))}
              {!isFull && <div className={`${COL_W} shrink-0`} />}
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
