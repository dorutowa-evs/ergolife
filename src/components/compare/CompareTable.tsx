'use client'
import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
      <span className="text-xl font-bold text-gray-900">{formatPrice(c.price)}</span>
    ),
  },
  { label: '材质', getValue: (c, m) => formatValue(formatMaterialLabel(c.material, m)) },
  { label: '颜色', getValue: (c, _m, cols) => formatValue(cols.find((col) => col.id === c.color)?.name) },
  { label: '头枕', getValue: (c) => formatBool(c.hasHeadrest) },
  { label: '腰靠', getValue: (c) => formatBool(c.hasLumbar) },
  { label: '腰靠可调节', getValue: (c) => formatBool(c.isLumbarAdjustable) },
]

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const validIds = chairs.map((c) => c.id)
    const oldIndex = validIds.indexOf(String(active.id))
    const newIndex = validIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(
      arrayMove(
        compareIds,
        compareIds.indexOf(String(active.id)),
        compareIds.indexOf(String(over.id))
      )
    )
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-max">
            {/* Sticky header row — image + name for each chair */}
            <div
              className={`sticky top-0 z-20 bg-white flex transition-shadow ${
                scrolled ? 'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' : ''
              }`}
            >
              {/* Label column spacer */}
              <div className="w-40 shrink-0" />

              {/* Sortable chair header cells */}
              <SortableContext items={compareIds} strategy={horizontalListSortingStrategy}>
                {chairs.map((chair) => (
                  <CompareChairColumn key={chair.id} chair={chair} onRemove={onRemove} />
                ))}
              </SortableContext>

              {/* Add column */}
              {!isFull && (
                <div className="w-44 shrink-0 flex items-center justify-center px-3 py-4">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex flex-col items-center justify-center w-full h-full min-h-[196px] rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">添加商品</span>
                  </button>
                </div>
              )}
            </div>

            {/* Parameter rows — each row spans the full width */}
            {PARAMS.map((param, i) => (
              <div
                key={param.label}
                className={`flex border-t border-gray-100 transition-colors ${
                  hoveredRow === i ? 'bg-gray-50' : ''
                }`}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Label */}
                <div className="w-40 shrink-0 px-4 py-3 text-xs font-medium text-gray-400 flex items-center">
                  {param.label}
                </div>
                {/* Values — one cell per chair, width matches chair column */}
                {chairs.map((chair) => (
                  <div
                    key={chair.id}
                    className="w-52 shrink-0 px-4 py-3 text-sm text-gray-800 flex items-center"
                  >
                    {param.getValue(chair, materials, colors)}
                  </div>
                ))}
                {/* Add column spacer keeps row full-width */}
                {!isFull && <div className="w-44 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </DndContext>

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
