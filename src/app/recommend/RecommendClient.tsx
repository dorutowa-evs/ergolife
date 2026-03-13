'use client'
import { useCallback, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ChairCard } from '@/components/chairs/ChairCard'
import { CompareFAB } from '@/components/compare/CompareFAB'
import { useCompare } from '@/contexts/CompareContext'
import { useToast } from '@/hooks/useToast'
import { getChairs } from '@/lib/catalog'
import {
  validateParams,
  recommendChairs,
  generateDescription,
  type UserParams,
  type ScoredChair,
  type SittingHours,
  type FormErrors,
} from '@/lib/recommendChairs'

const allChairs = getChairs()

function getMatchBadge(score: number): { label: string; className: string } {
  if (score >= 80) return { label: '高度匹配', className: 'bg-green-100 text-green-700' }
  if (score >= 60) return { label: '较匹配', className: 'bg-blue-100 text-blue-700' }
  return { label: '可考虑', className: 'bg-gray-100 text-gray-600' }
}

export function RecommendClient() {
  const { compareList, addToCompare, removeFromCompare, clearAll, isInCompare, isFull } = useCompare()
  const { showToast } = useToast()

  const [heightStr, setHeightStr] = useState('')
  const [weightStr, setWeightStr] = useState('')
  const [thighLengthStr, setThighLengthStr] = useState('')
  const [shoulderWidthStr, setShoulderWidthStr] = useState('')
  const [sittingHours, setSittingHours] = useState<SittingHours | ''>('')
  const [hasBackPain, setHasBackPain] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [results, setResults] = useState<ScoredChair[] | null>(null)
  const [description, setDescription] = useState<string | null>(null)

  const handleAddToCompare = useCallback((id: string) => {
    if (isFull) { showToast('最多对比 5 个商品'); return }
    addToCompare(id)
  }, [isFull, showToast, addToCompare])

  const parseNum = (s: string): number | undefined => {
    if (!s) return undefined
    const n = Number(s)
    return isNaN(n) ? undefined : n
  }

  const handleSubmit = () => {
    const raw: Partial<UserParams> = {
      height: parseNum(heightStr),
      weight: parseNum(weightStr),
      thighLength: parseNum(thighLengthStr),
      shoulderWidth: parseNum(shoulderWidthStr),
      sittingHours: sittingHours || undefined,
      hasBackPain,
    }
    const errs = validateParams(raw)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const params = raw as UserParams
    setResults(recommendChairs(allChairs, params))
    setDescription(generateDescription(params))
  }

  const hasHighMatch = results?.some((r) => r.score >= 80) ?? false

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* 上半部分：左右分栏 */}
        <div className="flex gap-12 items-start mb-16">
          {/* 左侧：表单 */}
          <div className="w-80 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">必填</p>
            <div className="space-y-4 mb-8">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">身高</label>
                <div className="relative">
                  <input
                    id="height"
                    type="number"
                    value={heightStr}
                    onChange={(e) => setHeightStr(e.target.value)}
                    placeholder="例如 175"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                </div>
                {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">体重</label>
                <div className="relative">
                  <input
                    id="weight"
                    type="number"
                    value={weightStr}
                    onChange={(e) => setWeightStr(e.target.value)}
                    placeholder="例如 70"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">kg</span>
                </div>
                {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">选填</p>
            <div className="space-y-4 mb-8">
              <div>
                <label htmlFor="thighLength" className="block text-sm font-medium text-gray-700 mb-0.5">大腿长</label>
                <p className="text-xs text-gray-400 mb-1">坐姿时从座面到大腿根部的距离</p>
                <div className="relative">
                  <input
                    id="thighLength"
                    type="number"
                    value={thighLengthStr}
                    onChange={(e) => setThighLengthStr(e.target.value)}
                    placeholder="例如 45"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                </div>
                {errors.thighLength && <p className="text-xs text-red-500 mt-1">{errors.thighLength}</p>}
              </div>
              <div>
                <label htmlFor="shoulderWidth" className="block text-sm font-medium text-gray-700 mb-1">肩宽</label>
                <div className="relative">
                  <input
                    id="shoulderWidth"
                    type="number"
                    value={shoulderWidthStr}
                    onChange={(e) => setShoulderWidthStr(e.target.value)}
                    placeholder="例如 44"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                </div>
                {errors.shoulderWidth && <p className="text-xs text-red-500 mt-1">{errors.shoulderWidth}</p>}
              </div>
              <div>
                <label htmlFor="sittingHours" className="block text-sm font-medium text-gray-700 mb-1">久坐时长</label>
                <select
                  id="sittingHours"
                  value={sittingHours}
                  onChange={(e) => setSittingHours(e.target.value as SittingHours | '')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">请选择</option>
                  <option value="<4">少于 4 小时</option>
                  <option value="4-8">4–8 小时</option>
                  <option value=">8">超过 8 小时</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span id="backPainLabel" className="text-sm font-medium text-gray-700">有腰部问题</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasBackPain}
                  aria-labelledby="backPainLabel"
                  onClick={() => setHasBackPain((v) => !v)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${hasBackPain ? 'bg-gray-900' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasBackPain ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              查找适合我的椅子
            </button>
          </div>

          {/* 右侧：描述区 */}
          <div className="flex-1 min-w-0 pt-2">
            {description ? (
              <>
                <p className="text-gray-700 text-base leading-relaxed mb-8">{description}</p>
                <div className="rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center h-48">
                  <p className="text-sm text-gray-400">示意图即将上线</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center h-full min-h-[200px]">
                <p className="text-2xl font-semibold text-gray-900 mb-3">找到适合你的椅子</p>
                <p className="text-gray-500 text-sm leading-relaxed">输入你的身高和体重，帮你找到最适合的椅子。填写更多参数可获得更精准的推荐。</p>
              </div>
            )}
          </div>
        </div>

        {/* 下半部分：推荐结果 */}
        {results !== null && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-6">
              {hasHighMatch ? '推荐结果' : '以下为相对接近的推荐'}
            </h2>
            {results.every((r) => r.score === 0) ? (
              <p className="text-gray-500 text-sm">暂未找到匹配的椅子，建议调整参数后重试</p>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {results.map(({ chair, score }) => {
                  const badge = getMatchBadge(score)
                  return (
                    <div key={chair.id} className="relative">
                      <ChairCard
                        chair={chair}
                        isInCompare={isInCompare(chair.id)}
                        onAdd={handleAddToCompare}
                        onRemove={removeFromCompare}
                      />
                      <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
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
