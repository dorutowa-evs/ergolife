'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Armchair } from 'lucide-react'
import type { Chair } from '@/types/catalog'

interface Props {
  chair: Chair
  onRemove: (id: string) => void
}

export function CompareChairColumn({ chair, onRemove }: Props) {
  const [hovered, setHovered] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chair.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-52 shrink-0 px-4 pt-4 pb-3 cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...attributes}
      {...listeners}
    >
      <div className="h-40 w-full relative rounded-lg overflow-hidden bg-gray-50 mb-3">
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
      <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{chair.name}</p>
      <button
        aria-label={`移除 ${chair.name}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(chair.id)}
        className={`absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xs ${
          hovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        ×
      </button>
    </div>
  )
}
