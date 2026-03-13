'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Armchair } from 'lucide-react'
import { getMaterials, getColors } from '@/lib/catalog'
import type { Chair } from '@/types/catalog'

const materials = getMaterials()
const colors = getColors()

interface Props {
  chair: Chair
  isInCompare: boolean
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}


export function ChairCard({ chair, isInCompare, onAdd, onRemove }: Props) {
  const [hovered, setHovered] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  return (
    <div className={`rounded-xl overflow-hidden border-2 transition-all bg-white shadow-sm hover:shadow-md ${
      isInCompare ? 'border-gray-900' : 'border-transparent hover:border-gray-200'
    }`}>
      {/* 图片区域 */}
      <Link
        href={`/chairs/${chair.id}`}
        data-testid="card-image-area"
        className={`relative aspect-square overflow-hidden block ${chair.imageUrl ? 'bg-white' : 'bg-gray-100'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setBtnHovered(false) }}
      >
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

        {/* 角落对比按钮 */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); isInCompare ? onRemove(chair.id) : onAdd(chair.id) }}
          onMouseEnter={(e) => { e.stopPropagation(); setBtnHovered(true) }}
          onMouseLeave={(e) => { e.stopPropagation(); setBtnHovered(false) }}
          className={[
            'absolute top-2 right-2 text-xs px-2.5 py-1 rounded-lg font-medium transition-all',
            hovered ? 'opacity-100' : 'opacity-0 pointer-events-none',
            'bg-gray-900/80 text-white hover:bg-gray-900',
          ].join(' ')}
        >
          {isInCompare ? (btnHovered ? '移除对比' : '✓ 已加入') : '+ 加入对比'}
        </button>
      </Link>

      {/* 卡片内容区 */}
      <div className={`p-4 ${isInCompare ? 'bg-gray-50' : ''}`}>
        <p className="text-sm font-medium text-gray-900 line-clamp-3 leading-snug min-h-[3.75rem] mb-0.5">
          {chair.name}
        </p>

        {/* 次级信息：材质 · 颜色 */}
        <p className="text-xs text-gray-400 mb-2">
          {materials.find(m => m.id === chair.material)?.label ?? chair.material} · {colors.find(c => c.id === chair.color)?.name ?? chair.color}
        </p>

        {/* 价格区域 */}
        <div className="mt-1">
          <span className="text-base font-semibold text-gray-900">
            ${chair.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
