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
  if (score >= 80) return { label: '高度匹配', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' }
  if (score >= 60) return { label: '较匹配', className: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' }
  return { label: '可考虑', className: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200' }
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[10px] font-semibold tracking-[0.15em] text-stone-400 uppercase whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  )
}

function NumberField({
  id, label, hint, value, onChange, placeholder, unit, error,
}: {
  id: string; label: string; hint?: string; value: string
  onChange: (v: string) => void; placeholder: string; unit: string; error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-800 mb-0.5">
        {label}
      </label>
      {hint && <p className="text-xs text-stone-400 mb-1">{hint}</p>}
      <div className="relative">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm pr-10 text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium">{unit}</span>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      )}
    </div>
  )
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
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Top section: form left, description right */}
        <div className="flex gap-12 items-start mb-16">

          {/* Left: form panel */}
          <div className="w-72 shrink-0">
            <div className="mb-6">
              <SectionDivider label="必填" />
              <div className="space-y-4">
                <NumberField id="height" label="身高" value={heightStr} onChange={setHeightStr} placeholder="175" unit="cm" error={errors.height} />
                <NumberField id="weight" label="体重" value={weightStr} onChange={setWeightStr} placeholder="70" unit="kg" error={errors.weight} />
              </div>
            </div>

            <div className="mb-6">
              <SectionDivider label="选填" />
              <div className="space-y-4">
                <NumberField
                  id="thighLength" label="大腿长"
                  hint="坐姿时从座面到大腿根部的距离"
                  value={thighLengthStr} onChange={setThighLengthStr}
                  placeholder="45" unit="cm" error={errors.thighLength}
                />
                <NumberField id="shoulderWidth" label="肩宽" value={shoulderWidthStr} onChange={setShoulderWidthStr} placeholder="44" unit="cm" error={errors.shoulderWidth} />

                <div>
                  <label htmlFor="sittingHours" className="block text-sm font-medium text-stone-800 mb-1">久坐时长</label>
                  <select
                    id="sittingHours"
                    value={sittingHours}
                    onChange={(e) => setSittingHours(e.target.value as SittingHours | '')}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
                  >
                    <option value="">请选择</option>
                    <option value="<4">少于 4 小时</option>
                    <option value="4-8">4–8 小时</option>
                    <option value=">8">超过 8 小时</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span id="backPainLabel" className="text-sm font-medium text-stone-800">有腰部问题</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasBackPain}
                    aria-labelledby="backPainLabel"
                    onClick={() => setHasBackPain((v) => !v)}
                    className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${hasBackPain ? 'bg-stone-800' : 'bg-stone-200'}`}
                  >
                    <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${hasBackPain ? 'translate-x-5' : 'translate-x-[3px]'}`} />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium tracking-wide hover:bg-stone-700 active:scale-[0.98] transition-all"
            >
              查找适合我的椅子
            </button>
          </div>

          {/* Right: description */}
          <div className="flex-1 min-w-0 pt-1">
            {description ? (
              <>
                <p className="text-stone-700 text-base leading-[1.8] mb-8">{description}</p>
                <div className="rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center h-44 gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-stone-200" />
                  </div>
                  <p className="text-xs text-stone-400 tracking-wide">示意图即将上线</p>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[240px] flex flex-col justify-center">
                <p className="text-[1.75rem] font-semibold leading-snug text-stone-900 mb-4">
                  找到适合你的椅子
                </p>
                <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
                  输入你的身高和体重，帮你找到最适合的椅子。填写更多参数可获得更精准的推荐。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results section */}
        {results !== null && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[10px] font-semibold tracking-[0.15em] text-stone-400 uppercase whitespace-nowrap">
                {hasHighMatch ? '推荐结果' : '以下为相对接近的推荐'}
              </h2>
              <div className="flex-1 h-px bg-stone-200" />
            </div>
            {results.every((r) => r.score === 0) ? (
              <p className="text-stone-500 text-sm">暂未找到匹配的椅子，建议调整参数后重试</p>
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
                      <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${badge.className}`}>
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
