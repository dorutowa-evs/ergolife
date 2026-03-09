'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Armchair, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Chair } from '@/types/catalog'

interface Props {
  chair: Chair
  isFirst: boolean
  isLast: boolean
  onMoveLeft: () => void
  onMoveRight: () => void
  onRemove: (id: string) => void
}

export function CompareChairColumn({ chair, isFirst, isLast, onMoveLeft, onMoveRight, onRemove }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative w-52 shrink-0 px-4 pt-4 pb-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

      <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">{chair.name}</p>

      {/* Remove button */}
      <button
        aria-label={`移除 ${chair.name}`}
        onClick={() => onRemove(chair.id)}
        className={`absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-xs ${
          hovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        ×
      </button>

      {/* Left / right reorder buttons */}
      <div className={`flex justify-between gap-1 transition-opacity ${hovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button
          aria-label="左移"
          onClick={onMoveLeft}
          disabled={isFirst}
          className="flex-1 flex items-center justify-center h-7 rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          aria-label="右移"
          onClick={onMoveRight}
          disabled={isLast}
          className="flex-1 flex items-center justify-center h-7 rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
