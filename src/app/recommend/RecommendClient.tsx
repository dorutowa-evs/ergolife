'use client'
import { useCallback, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

type LumbarState = 'none' | 'moderate' | 'severe'
const LUMBAR_OPTIONS: { value: LumbarState; label: string }[] = [
  { value: 'none', label: '无' },
  { value: 'moderate', label: '轻微' },
  { value: 'severe', label: '严重' },
]

function getMatchBadge(score: number): { label: string; className: string } {
  if (score >= 80) return { label: '高度匹配', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' }
  if (score >= 60) return { label: '较匹配', className: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' }
  return { label: '可考虑', className: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200' }
}

function FieldLabel({ htmlFor, text, unit, required }: { htmlFor: string; text: string; unit?: string; required?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5 mb-2">
      <label htmlFor={htmlFor} className="text-xs font-semibold tracking-wide text-gray-700">
        {text}
      </label>
      {unit && <span className="text-[10px] text-gray-400 uppercase tracking-wide">({unit})</span>}
      {required
        ? <span className="text-[10px] text-gray-400 ml-auto">必填</span>
        : <span className="text-[10px] text-gray-400 ml-auto">选填</span>
      }
    </div>
  )
}

const inputCls = 'w-full bg-white border border-gray-200 px-4 py-3 text-gray-900 text-sm placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

export function RecommendClient() {
  const { compareList, addToCompare, removeFromCompare, clearAll, isInCompare, isFull } = useCompare()
  const { showToast } = useToast()

  const [heightStr, setHeightStr] = useState('')
  const [weightStr, setWeightStr] = useState('')
  const [thighLengthStr, setThighLengthStr] = useState('')
  const [shoulderWidthStr, setShoulderWidthStr] = useState('')
  const [sittingHours, setSittingHours] = useState<SittingHours | ''>('')
  const [lumbar, setLumbar] = useState<LumbarState>('none')
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
      hasBackPain: lumbar !== 'none',
    }
    const errs = validateParams(raw)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const params = raw as UserParams
    setResults(recommendChairs(allChairs, params))
    setDescription(generateDescription(params))
  }

  const hasHighMatch = results?.some((r) => r.score >= 80) ?? false
  const matchCount = results?.filter((r) => r.score > 0).length ?? 0

  return (
    <div className="min-h-screen bg-[#f0efed]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Top section: form left, illustration right */}
        <div className="flex gap-16 items-stretch mb-20">

          {/* Left: heading + form */}
          <div className="flex-1 min-w-0">
            <h1 className="text-5xl font-black leading-[1.05] text-gray-950 tracking-tight mb-3">
              找到属于你的椅子
            </h1>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">
              输入你的身高和体重，帮你找到最适合的椅子。填写更多参数可获得更精准的推荐。
            </p>

            {/* Row 1: height + weight */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FieldLabel htmlFor="height" text="身高" unit="cm" required />
                <input id="height" type="number" value={heightStr} onChange={(e) => setHeightStr(e.target.value)} placeholder="175" className={inputCls} />
                {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
              </div>
              <div>
                <FieldLabel htmlFor="weight" text="体重" unit="kg" required />
                <input id="weight" type="number" value={weightStr} onChange={(e) => setWeightStr(e.target.value)} placeholder="70" className={inputCls} />
                {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
              </div>
            </div>

            {/* Row 2: thighLength + shoulderWidth */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FieldLabel htmlFor="thighLength" text="大腿长" unit="cm" required={false} />
                <input id="thighLength" type="number" value={thighLengthStr} onChange={(e) => setThighLengthStr(e.target.value)} placeholder="45" className={inputCls} />
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">坐姿时从座面到大腿根部</p>
                {errors.thighLength && <p className="text-xs text-red-500 mt-0.5">{errors.thighLength}</p>}
              </div>
              <div>
                <FieldLabel htmlFor="shoulderWidth" text="肩宽" unit="cm" required={false} />
                <input id="shoulderWidth" type="number" value={shoulderWidthStr} onChange={(e) => setShoulderWidthStr(e.target.value)} placeholder="44" className={inputCls} />
                {errors.shoulderWidth && <p className="text-xs text-red-500 mt-1">{errors.shoulderWidth}</p>}
              </div>
            </div>

            {/* Row 3: sittingHours */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-xs font-semibold tracking-wide text-gray-700">每日久坐时长</span>
                <span className="text-[10px] text-gray-400 ml-auto">选填</span>
              </div>
              <Select value={sittingHours} onValueChange={(v) => setSittingHours(v as SittingHours | '')}>
                <SelectTrigger id="sittingHours" className="w-full bg-white border-gray-200 rounded-none h-[46px] text-sm focus:ring-0 focus:border-gray-900">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<4">少于 4 小时</SelectItem>
                  <SelectItem value="4-8">4–8 小时</SelectItem>
                  <SelectItem value=">8">超过 8 小时</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 4: lumbar 3-state */}
            <div className="mb-8">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-xs font-semibold tracking-wide text-gray-700">腰部状况</span>
                <span className="text-[10px] text-gray-400 ml-auto">选填</span>
              </div>
              <div className="flex">
                {LUMBAR_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLumbar(value)}
                    className={`flex-1 py-3 text-xs font-bold tracking-[0.1em] uppercase border transition-colors ${
                      lumbar === value
                        ? 'bg-gray-950 text-white border-gray-950'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                    } ${value !== 'none' ? '-ml-px' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gray-950 text-white py-4 text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 active:scale-[0.99] transition-all"
            >
              查找匹配
            </button>
          </div>

          {/* Right: illustration + description */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Body silhouette placeholder — fills space between top and description */}
            <div className="relative bg-gray-200 flex items-center justify-center flex-1 overflow-hidden">
              {/* Crosshair lines */}
              <div className="absolute left-10 right-10 h-px bg-gray-300" />
              <div className="absolute top-10 bottom-10 left-1/2 w-px bg-gray-300" />
              {/* Body silhouette — fills ~70% of box height */}
              <svg width="130" height="280" viewBox="0 0 72 160" fill="none" className="relative z-10 opacity-20">
                <circle cx="36" cy="14" r="11" fill="#333" />
                <rect x="21" y="29" width="30" height="42" rx="3" fill="#333" />
                <rect x="1" y="31" width="19" height="8" rx="4" fill="#333" />
                <rect x="52" y="31" width="19" height="8" rx="4" fill="#333" />
                <rect x="21" y="73" width="13" height="52" rx="3" fill="#333" />
                <rect x="38" y="73" width="13" height="52" rx="3" fill="#333" />
                <rect x="17" y="121" width="19" height="8" rx="3" fill="#333" />
                <rect x="36" y="121" width="19" height="8" rx="3" fill="#333" />
              </svg>
            </div>

            {/* Description panel */}
            <div className={`border-l-2 pl-5 mt-6 transition-opacity duration-300 ${description ? 'border-gray-950 opacity-100' : 'border-gray-300 opacity-60'}`}>
              <p className="text-[10px] font-bold tracking-[0.12em] text-gray-500 uppercase mb-2">体型分析</p>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                {description
                  ? `"${description}"`
                  : '"填写左侧参数后，这里将显示你的专属坐姿分析。"'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Results section */}
        {results !== null && (
          <div>
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-xl font-black tracking-tight text-gray-950 uppercase">
                {hasHighMatch ? '推荐结果' : '以下为相对接近的推荐'}
              </h2>
              {matchCount > 0 && (
                <span className="text-[10px] font-bold tracking-[0.12em] text-gray-400 uppercase">
                  共 {matchCount} 件匹配
                </span>
              )}
            </div>
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
