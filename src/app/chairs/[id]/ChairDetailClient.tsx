'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Armchair } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { CompareFAB } from '@/components/compare/CompareFAB'
import { useCompare } from '@/contexts/CompareContext'
import { useToast } from '@/hooks/useToast'
import { getChairs } from '@/lib/catalog'
import {
  formatMaterialLabel,
  formatAdjustment,
  formatBool,
  formatPrice,
} from '@/lib/formatters'
import type { Chair, Material, Color } from '@/types/catalog'

const allChairs = getChairs()

interface Props {
  chair: Chair | undefined
  materials: Material[]
  colors: Color[]
}

const SPECS: {
  label: string
  getValue: (c: Chair, m: Material[], cols: Color[]) => string
}[] = [
  { label: '材质',       getValue: (c, m) => formatMaterialLabel(c.material, m) },
  { label: '颜色',       getValue: (c, _, cols) => cols.find((col) => col.id === c.color)?.name ?? c.color },
  { label: '靠背高度',   getValue: (c) => `${c.backHeight} cm` },
  { label: '座高',       getValue: (c) => `${c.seatHeight} cm` },
  { label: '后仰角度',   getValue: (c) => `${c.recliningAngle}°` },
  { label: '扶手',       getValue: (c) => formatAdjustment(c.armrestAdjustment) },
  { label: '头枕',       getValue: (c) => formatAdjustment(c.headrestAdjustment) },
  { label: '腰靠',       getValue: (c) => formatBool(c.hasLumbar) },
  { label: '腰靠可调节', getValue: (c) => formatBool(c.isLumbarAdjustable) },
]

const PLATFORMS = [
  { key: 'taobao' as const, label: '淘宝' },
  { key: 'jd'     as const, label: '京东' },
  { key: 'pdd'    as const, label: '拼多多' },
]

export function ChairDetailClient({ chair, materials, colors }: Props) {
  const { compareList, addToCompare, removeFromCompare, clearAll, isInCompare, isFull } = useCompare()
  const { showToast } = useToast()
  const [btnHovered, setBtnHovered] = useState(false)

  if (!chair) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-40 text-gray-400 text-sm">
          商品不存在
        </div>
      </div>
    )
  }

  const inCompare = isInCompare(chair.id)

  const handleCompareClick = () => {
    setBtnHovered(false)
    if (inCompare) {
      removeFromCompare(chair.id)
    } else if (isFull) {
      showToast('最多对比 5 个商品')
    } else {
      addToCompare(chair.id)
    }
  }

  const btnLabel = inCompare
    ? (btnHovered ? '移除' : '✓ 已加入')
    : '＋ 加入对比'

  const btnClass = inCompare
    ? (btnHovered
        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
        : 'bg-gray-100 text-gray-600 border border-gray-200')
    : 'bg-gray-900 text-white hover:bg-gray-700'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* 左右分栏 */}
        <div className="flex gap-10 items-start">
          {/* 左侧：图片 */}
          <div className="w-96 shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 aspect-square relative">
            {chair.imageUrl ? (
              <Image
                src={chair.imageUrl}
                alt={chair.name}
                fill
                className={chair.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Armchair className="w-24 h-24 text-gray-200" strokeWidth={1} />
              </div>
            )}
          </div>

          {/* 右侧：信息 */}
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6 leading-snug">
              {chair.name}
            </h1>

            {/* 平台价格表 */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              {PLATFORMS.map(({ key, label }, i) => {
                const price = chair.platformPrices?.[key]
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}
                  >
                    <span className="text-sm text-gray-600 w-16">{label}</span>
                    <span className="text-sm font-medium text-gray-900 flex-1">
                      {price != null ? formatPrice(price) : '—'}
                    </span>
                    <button
                      disabled
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                    >
                      购买
                    </button>
                  </div>
                )
              })}
            </div>

            {/* 加入对比 CTA */}
            <button
              type="button"
              onClick={handleCompareClick}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${btnClass}`}
            >
              {btnLabel}
            </button>
          </div>
        </div>

        {/* 规格参数 */}
        <div className="mt-12">
          <h2 className="text-base font-semibold text-gray-900 mb-4">规格参数</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {SPECS.map(({ label, getValue }, i) => (
              <div
                key={label}
                className={`flex items-center px-5 py-3 text-sm ${i > 0 ? 'border-t border-gray-50' : ''}`}
              >
                <span className="w-28 text-gray-500 shrink-0">{label}</span>
                <span className="text-gray-900">{getValue(chair, materials, colors)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CompareFAB
        compareIds={compareList}
        chairs={allChairs}
        onRemove={removeFromCompare}
        onClearAll={clearAll}
      />
    </div>
  )
}
