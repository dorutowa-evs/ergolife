'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Armchair, ChevronLeft } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { CompareFAB } from '@/components/compare/CompareFAB'
import { useCompare } from '@/contexts/CompareContext'
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

const PLATFORMS = [
  { key: 'taobao' as const, label: '淘宝',  domain: 'taobao.com' },
  { key: 'jd'     as const, label: '京东',  domain: 'jd.com' },
  { key: 'pdd'    as const, label: '拼多多', domain: 'pinduoduo.com' },
]

function getBestPrice(chair: Chair) {
  let bestPlatform = ''
  let bestPrice = Infinity
  for (const { key, label } of PLATFORMS) {
    const p = chair.platformPrices?.[key]
    if (p != null && p < bestPrice) {
      bestPrice = p
      bestPlatform = label
    }
  }
  return bestPrice === Infinity ? null : { price: bestPrice, platform: bestPlatform }
}

export function ChairDetailClient({ chair, materials, colors }: Props) {
  const { compareList, removeFromCompare, clearAll } = useCompare()

  if (!chair) {
    return (
      <div className="min-h-screen bg-page">
        <Header />
        <div className="flex items-center justify-center py-40 text-gray-400 text-sm">
          商品不存在
        </div>
      </div>
    )
  }

  const best = getBestPrice(chair)

  return (
    <div className="min-h-screen bg-page">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 左右分栏 */}
        <div className="flex gap-12 items-stretch">

          {/* 左侧：图片 */}
          <div className="flex-1 min-w-0 rounded-xl overflow-hidden bg-white aspect-square relative">
            <Link href="/chairs" className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 text-xs text-gray-500 bg-white/80 px-2.5 py-1.5 rounded-lg hover:bg-white transition-colors shadow-sm">
              <ChevronLeft className="w-3 h-3" />
              返回
            </Link>
            {chair.imageUrl ? (
              <Image
                src={chair.imageUrl}
                alt={chair.name}
                fill
                className={chair.imageFit === 'contain' ? 'object-contain p-8' : 'object-cover'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Armchair className="w-24 h-24 text-gray-200" strokeWidth={1} />
              </div>
            )}
          </div>

          {/* 右侧：信息 */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* 名称 */}
            <h1 className="font-display text-5xl font-bold text-gray-950 mb-5 leading-tight tracking-tight">
              {chair.name}
            </h1>

            {/* 最低平台价 */}
            {best && (
              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase mb-1">最低平台价</p>
                <p className="text-3xl text-gray-950 tracking-tight">
                  {formatPrice(best.price)}
                </p>
              </div>
            )}

            {/* 平台价格列表 */}
            <div className="divide-y divide-gray-100 mb-10">
              {PLATFORMS.map(({ key, label, domain }) => {
                const price = chair.platformPrices?.[key]
                if (price == null) return null
                return (
                  <div key={key} className="flex items-center py-2">
                    <div className="flex items-center gap-2 w-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                        alt={label}
                        width={16}
                        height={16}
                        className="rounded-sm"
                      />
                      <span className="text-sm text-gray-500">{label}</span>
                    </div>
                    <span className="text-sm text-gray-900 flex-1">{formatPrice(price)}</span>
                    <button
                      disabled
                      title="该功能暂时未开放"
                      className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-500 cursor-not-allowed"
                    >
                      购买
                    </button>
                  </div>
                )
              })}
            </div>

            {/* 规格参数 — mt-auto 让底部和图片底部对齐 */}
            <div className="mt-auto w-full">
              <div className="grid grid-cols-3 gap-y-5">
                <SpecItem label="靠背高度" value={`${chair.backHeight} cm`} />
                <SpecItem label="座高" value={`${chair.seatHeight} cm`} />
                <SpecItem label="后仰角度" value={`${chair.recliningAngle}°`} />
                <SpecItem label="材质" value={formatMaterialLabel(chair.material, materials)} />
                <SpecItem label="颜色" value={colors.find((c) => c.id === chair.color)?.name ?? chair.color} />
                <SpecItem label="扶手" value={formatAdjustment(chair.armrestAdjustment)} />
                <SpecItem label="头枕" value={formatAdjustment(chair.headrestAdjustment)} />
                <SpecItem label="腰靠" value={formatBool(chair.hasLumbar)} />
                <SpecItem label="腰靠可调节" value={formatBool(chair.isLumbarAdjustable)} />
              </div>
            </div>
          </div>
        </div>

        {/* 评测 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-6">评测</h2>
          <div className="rounded-xl overflow-hidden aspect-video">
            <iframe
              src="https://www.youtube.com/embed/UV0mhY2Dxr0"
              title="椅子评测视频"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
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

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-base text-gray-950 leading-tight">{value}</p>
    </div>
  )
}
