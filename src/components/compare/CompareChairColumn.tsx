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
      className="relative w-52 shrink-0 px-4 pt-5 pb-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="h-36 w-full relative rounded-lg overflow-hidden bg-gray-50 mb-4">
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

      {/* Name */}
      <p className="text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug mb-3">
        {chair.name}
      </p>

      {/* Controls — visible on hover */}
      <div className={`flex items-center justify-between transition-opacity ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* ← → reorder */}
        <div className="flex gap-1">
          <button
            aria-label="左移"
            onClick={onMoveLeft}
            disabled={isFirst}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            aria-label="右移"
            onClick={onMoveRight}
            disabled={isLast}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Remove */}
        <button
          aria-label={`移除 ${chair.name}`}
          onClick={() => onRemove(chair.id)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          移除
        </button>
      </div>
    </div>
  )
}
