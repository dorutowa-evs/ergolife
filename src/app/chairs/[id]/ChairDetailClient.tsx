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
  { key: 'pdd'    as const, label: '拼多多' },
  { key: 'taobao' as const, label: '淘宝' },
  { key: 'jd'     as const, label: '京东' },
]

export function ChairDetailClient({ chair, materials, colors }: Props) {
  const { compareList, addToCompare, removeFromCompare, clearAll, isInCompare, isFull } = useCompare()
  const { showToast } = useToast()
  const [imgHovered, setImgHovered] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  // Stub gallery: index 0 = real image, 1 & 2 = white placeholders
  const STUB_COUNT = 3

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
    ? (btnHovered ? '移除对比' : '✓ 已加入')
    : '＋ 加入对比'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-14 items-stretch">

          {/* 左侧：主图 + 缩略图 */}
          <div className="w-[380px] shrink-0 self-start flex flex-col gap-3">
            {/* 主图 */}
            <div
              className="rounded-2xl overflow-hidden bg-white border border-gray-100 aspect-square relative"
              onMouseEnter={() => setImgHovered(true)}
              onMouseLeave={() => { setImgHovered(false); setBtnHovered(false) }}
            >
              {activeImg === 0 && chair.imageUrl ? (
                <Image
                  src={chair.imageUrl}
                  alt={chair.name}
                  fill
                  className={chair.imageFit === 'contain' ? 'object-contain p-8' : 'object-cover'}
                />
              ) : activeImg === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Armchair className="w-28 h-28 text-gray-200" strokeWidth={1} />
                </div>
              ) : null /* stubs: plain white bg */}
              {/* 加入对比 hover 按钮 */}
              <button
                type="button"
                onClick={handleCompareClick}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                className={[
                  'absolute top-3 right-3 text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                  imgHovered ? 'opacity-100' : 'opacity-0 pointer-events-none',
                  'bg-gray-900/80 text-white hover:bg-gray-900',
                ].join(' ')}
              >
                {btnLabel}
              </button>
            </div>

            {/* 缩略图行 */}
            <div className="flex gap-2">
              {Array.from({ length: STUB_COUNT }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={[
                    'flex-1 aspect-square rounded-lg overflow-hidden bg-white border-2 transition-colors',
                    activeImg === i ? 'border-gray-900' : 'border-transparent hover:border-gray-300',
                  ].join(' ')}
                >
                  {i === 0 && chair.imageUrl && (
                    <div className="relative w-full h-full">
                      <Image
                        src={chair.imageUrl}
                        alt={chair.name}
                        fill
                        className={chair.imageFit === 'contain' ? 'object-contain p-1' : 'object-cover'}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：标题 + 价格 + 规格（统一 grid） */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-snug">
              {chair.name}
            </h1>

            {/* 平台价格 + 规格参数 — 同一个 4 列 grid，第 4 列对齐 */}
            <div
              className="grid items-center"
              style={{ gridTemplateColumns: 'auto 1fr auto auto', columnGap: '1rem' }}
            >
              {/* 平台价格行 */}
              {PLATFORMS.flatMap(({ key, label }, i) => {
                const price = chair.platformPrices?.[key]
                const border = i > 0 ? 'border-t border-gray-100' : ''
                return [
                  <span key={`${key}-l`} className={`text-sm text-gray-500 py-3 ${border}`}>{label}</span>,
                  <span key={`${key}-p`} className={`text-sm text-gray-900 py-3 ${border}`}>{price != null ? formatPrice(price) : '—'}</span>,
                  <span key={`${key}-e`} className={`py-3 ${border}`} />,
                  <button key={`${key}-b`} type="button" disabled className={`text-xs px-3 py-1 rounded-md border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed justify-self-end ${border}`}>购买</button>,
                ]
              })}

              {/* 分隔线 */}
              <div className="col-span-4 h-px bg-gray-100 my-5" />

              {/* 规格参数标题 */}
              <p className="col-span-4 text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">规格参数</p>

              {/* 规格行：每两个 spec 占一行，label→col1, value→col2, label→col3, value→col4 */}
              {SPECS.flatMap(({ label, getValue }) => [
                <span key={`${label}-l`} className="text-xs text-gray-400 py-1">{label}</span>,
                <span key={`${label}-v`} className="text-sm text-gray-900 py-1">{getValue(chair, materials, colors)}</span>,
              ])}
            </div>
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
