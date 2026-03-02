'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Chair } from '@/types/catalog'

interface Props {
  chair: Chair
  isInCompare: boolean
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

const BADGE_LABEL: Record<string, string> = {
  TOP_PICK: 'TOP PICK',
  SALE: 'SALE',
}

export function ChairCard({ chair, isInCompare, onAdd, onRemove }: Props) {
  const [hovered, setHovered] = useState(false)
  const placeholder = `https://placehold.co/400x300/f1f5f9/94a3b8?text=${encodeURIComponent(chair.name)}`

  return (
    <div className={`rounded-xl overflow-hidden border transition-all bg-white hover:shadow-md ${
      isInCompare ? 'border-gray-900 border-2' : 'border-gray-100 hover:border-gray-200'
    }`}>
      {/* 图片区域 */}
      <div
        data-testid="card-image-area"
        className="relative aspect-[4/3] bg-gray-50 overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/chairs/${chair.id}`} tabIndex={-1}>
          <Image
            src={chair.imageUrl || placeholder}
            alt={chair.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Badge（TOP PICK / SALE） */}
        {chair.badge && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded-sm">
              {BADGE_LABEL[chair.badge] ?? chair.badge}
            </Badge>
          </div>
        )}

        {/* Hover 遮罩 */}
        {hovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {isInCompare ? (
              <button
                onClick={(e) => { e.preventDefault(); onRemove(chair.id) }}
                className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                ✓ 移出对比
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); onAdd(chair.id) }}
                className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                + 加入对比
              </button>
            )}
          </div>
        )}
      </div>

      {/* 卡片内容区 */}
      <div className="p-4">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1">
          {chair.name}
        </p>

        {/* 已加入对比常驻指示 */}
        {isInCompare && (
          <p className="text-xs text-gray-500 mb-2">✓ 已加入对比</p>
        )}

        {/* 价格区域 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-gray-900">
              ${chair.price.toFixed(2)}
            </span>
            {chair.badge === 'SALE' && chair.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${chair.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Link
            href={`/chairs/${chair.id}`}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  )
}
