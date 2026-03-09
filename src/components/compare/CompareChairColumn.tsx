'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Armchair } from 'lucide-react'
import { formatPrice, formatMaterialLabel, formatBool, formatValue } from '@/lib/formatters'
import type { Chair, Material, Color } from '@/types/catalog'

interface Props {
  chair: Chair
  materials: Material[]
  colors: Color[]
  hoveredRow: number | null
  onHoverRow: (row: number | null) => void
  onRemove: (id: string) => void
}

export function CompareChairColumn({ chair, materials, colors, hoveredRow, onHoverRow, onRemove }: Props) {
  const [headerHovered, setHeaderHovered] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chair.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const colorName = formatValue(colors.find((c) => c.id === chair.color)?.name)
  const materialLabel = formatValue(formatMaterialLabel(chair.material, materials))

  const rows = [
    <span key={0} className="text-xl font-bold text-gray-900">{formatPrice(chair.price)}</span>,
    <span key={1}>{materialLabel}</span>,
    <span key={2}>{colorName}</span>,
    <span key={3}>{formatBool(chair.hasHeadrest)}</span>,
    <span key={4}>{formatBool(chair.hasLumbar)}</span>,
    <span key={5}>{formatBool(chair.isLumbarAdjustable)}</span>,
  ]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col min-w-[180px] flex-1 bg-white rounded-xl shadow-sm border border-gray-100"
    >
      {/* Sticky header */}
      <div
        className={`sticky top-0 z-10 bg-white rounded-t-xl px-4 pt-4 pb-3 cursor-grab active:cursor-grabbing transition-shadow ${
          scrolled ? 'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' : ''
        }`}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        {...attributes}
        {...listeners}
      >
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 mb-3">
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
            headerHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          ×
        </button>
      </div>

      {/* Parameter rows */}
      <div className="flex flex-col">
        {rows.map((cell, i) => (
          <div
            key={i}
            className={`px-4 py-3 text-sm text-gray-800 border-t border-gray-50 transition-colors ${
              hoveredRow === i ? 'bg-gray-50' : ''
            }`}
            onMouseEnter={() => onHoverRow(i)}
            onMouseLeave={() => onHoverRow(null)}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  )
}
