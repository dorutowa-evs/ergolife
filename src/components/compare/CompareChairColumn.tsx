'use client'
import Image from 'next/image'
import { Armchair } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Chair } from '@/types/catalog'

interface Props {
  chair: Chair
  onRemove: (id: string) => void
}

export function CompareChairColumn({ chair, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chair.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-52 shrink-0 px-4 pt-5 pb-4 group"
    >
      {/* Image — drag handle */}
      <div
        className="h-36 w-full relative rounded-lg overflow-hidden bg-white mb-4 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {chair.imageUrl ? (
          <Image
            src={chair.imageUrl}
            alt={chair.name}
            fill
            className={chair.imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Armchair className="w-10 h-10 text-gray-200" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Name — centered, larger */}
      <p className="text-base font-semibold text-gray-900 text-center line-clamp-2 leading-snug">
        {chair.name}
      </p>

      {/* Remove button — top-right, visible on hover */}
      <button
        aria-label={`移除 ${chair.name}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(chair.id)}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm opacity-0 group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}
