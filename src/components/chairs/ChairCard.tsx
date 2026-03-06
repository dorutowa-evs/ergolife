'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Armchair } from 'lucide-react'
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function ChairCard({ chair, isInCompare, onAdd, onRemove }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className={`rounded-xl overflow-hidden border-2 transition-all bg-white shadow-sm hover:shadow-md ${
      isInCompare ? 'border-gray-900' : 'border-transparent hover:border-gray-200'
    }`}>
      {/* 图片区域 */}
      <div
        data-testid="card-image-area"
        className={`relative aspect-[4/3] overflow-hidden ${chair.imageUrl ? 'bg-white' : 'bg-gray-100'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/chairs/${chair.id}`} tabIndex={-1} className="absolute inset-0">
          {chair.imageUrl ? (
            <Image
              src={chair.imageUrl}
              alt={chair.name}
              fill
              className={`${chair.imageFit === 'contain' ? 'object-contain p-3' : 'object-cover'} transition-transform duration-300 hover:scale-105`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Armchair className="w-16 h-16 text-gray-300" strokeWidth={1} />
            </div>
          )}
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
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            {isInCompare ? (
              <button
                onClick={(e) => { e.preventDefault(); onRemove(chair.id) }}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                ✓ 移出对比
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); onAdd(chair.id) }}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                + 加入对比
              </button>
            )}
          </div>
        )}
      </div>

      {/* 卡片内容区 */}
      <div className={`p-4 ${isInCompare ? 'bg-gray-50' : ''}`}>
        <p className="text-sm font-medium text-gray-900 line-clamp-3 leading-snug min-h-[3.75rem] mb-0.5">
          {chair.name}
        </p>

        {/* 次级信息：材质 · 颜色 */}
        <p className="text-xs text-gray-400 mb-2">
          {capitalize(chair.material)} · {capitalize(chair.color)}
        </p>

        {/* 价格区域 */}
        <div className="flex items-center justify-between mt-1">
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
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  )
}
