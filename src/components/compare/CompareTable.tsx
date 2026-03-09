'use client'
import { useState } from 'react'
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
import type { Chair, Material, Color } from '@/types/catalog'

const PARAM_LABELS = ['价格', '材质', '颜色', '头枕', '腰靠', '腰靠可调节']

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

export function CompareTable({ chairs, allChairs, compareIds, materials, colors, isFull, onRemove, onReorder, onAdd }: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // Use rendered chairs (stale-ID-safe) for index lookup
    const validIds = chairs.map((c) => c.id)
    const oldIndex = validIds.indexOf(String(active.id))
    const newIndex = validIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(compareIds, compareIds.indexOf(String(active.id)), compareIds.indexOf(String(over.id))))
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 items-start min-w-max">
            {/* Sticky label column */}
            <div className="sticky left-0 z-20 flex flex-col min-w-[100px] shrink-0 bg-gray-50">
              <div className="h-[calc(4/3*100px+5rem)]" />
              {PARAM_LABELS.map((label, i) => (
                <div
                  key={label}
                  className={`px-3 py-3 text-xs font-medium text-gray-400 border-t border-gray-100 transition-colors ${
                    hoveredRow === i ? 'bg-gray-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Sortable chair columns */}
            <SortableContext items={compareIds} strategy={horizontalListSortingStrategy}>
              {chairs.map((chair) => (
                <CompareChairColumn
                  key={chair.id}
                  chair={chair}
                  materials={materials}
                  colors={colors}
                  hoveredRow={hoveredRow}
                  onHoverRow={setHoveredRow}
                  onRemove={onRemove}
                />
              ))}
            </SortableContext>

            {/* Add column */}
            {!isFull && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex flex-col items-center justify-center min-w-[160px] flex-1 min-h-[400px] rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors gap-2 self-stretch"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm">添加商品</span>
              </button>
            )}
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
