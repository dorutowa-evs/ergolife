'use client'
import Image from 'next/image'
import { Armchair } from 'lucide-react'
import type { Chair } from '@/types/catalog'

interface Props {
  chair: Chair
  onRemove: (id: string) => void
}

export function CompareChairColumn({ chair, onRemove }: Props) {
  return (
    <div className="relative w-48 shrink-0 px-4 pt-5 pb-4 group">
      <div className="h-36 w-full relative rounded-lg overflow-hidden bg-white mb-4">
        {chair.imageUrl ? (
          <Image
            src={chair.imageUrl}
            alt={chair.name}
            fill
            draggable={false}
            className={chair.imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Armchair className="w-10 h-10 text-gray-200" strokeWidth={1} />
          </div>
        )}
      </div>

      <p className="text-base font-semibold text-gray-900 text-center line-clamp-2 leading-snug">
        {chair.name}
      </p>

      <button
        aria-label={`移除 ${chair.name}`}
        onClick={() => onRemove(chair.id)}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm opacity-0 group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}
