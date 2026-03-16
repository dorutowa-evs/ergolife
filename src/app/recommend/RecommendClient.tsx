'use client'
import { useCallback, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Header } from '@/components/layout/Header'
import { ChairCard } from '@/components/chairs/ChairCard'
import { CompareFAB } from '@/components/compare/CompareFAB'
import { FilterPanelInner, priceBounds } from '@/components/chairs/FilterPanel'
import { useCompare } from '@/contexts/CompareContext'
import { useToast } from '@/hooks/useToast'
import { getChairs } from '@/lib/catalog'
import { filterChairs } from '@/lib/filterChairs'
import { makeDefaultFilter, type FilterState } from '@/types/catalog'
import {
  validateParams,
  recommendChairs,
  generateDescription,
  type UserParams,
  type ScoredChair,
  type PosturePreference,
  type FormErrors,
} from '@/lib/recommendChairs'

const allChairs = getChairs()
const defaultResultFilter = makeDefaultFilter(priceBounds.min, priceBounds.max)

function getMatchBadge(score: number): { label: string; className: string } {
  if (score >= 80) return { label: '高度匹配', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' }
  if (score >= 60) return { label: '较匹配', className: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' }
  return { label: '可考虑', className: 'bg-stone-100 text-stone-500 ring-1 ring-stone-200' }
}

function FieldLabel({ htmlFor, text, unit, required, tooltip }: { htmlFor: string; text: string; unit?: string; required?: boolean; tooltip?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-gray-600">
        {text}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {unit && <span className="text-[10px] text-gray-400 uppercase tracking-wide">({unit})</span>}
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-300 text-[9px] text-gray-400 cursor-default select-none">?</span>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs max-w-[180px]">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

const fieldControlCls = 'h-14 w-full rounded-md border border-gray-200 bg-white px-4 text-sm text-gray-900'
const inputCls = `${fieldControlCls} placeholder:text-gray-300 focus:outline-none focus:border-gray-900 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`
const selectTriggerCls = `${fieldControlCls} focus:ring-0 focus:border-gray-900`

export function RecommendClient() {
  const { compareList, addToCompare, removeFromCompare, clearAll, isInCompare, isFull } = useCompare()
  const { showToast } = useToast()

  const [heightStr, setHeightStr] = useState('')
  const [weightStr, setWeightStr] = useState('')
  const [legLengthStr, setLegLengthStr] = useState('')
  const [posture, setPosture] = useState<PosturePreference | undefined>()
  const [errors, setErrors] = useState<FormErrors>({})

  const [results, setResults] = useState<ScoredChair[] | null>(null)
  const [description, setDescription] = useState<string | null>(null)

  const [resultFilterDraft, setResultFilterDraft] = useState<FilterState>(defaultResultFilter)
  const [resultFilter, setResultFilter] = useState<FilterState>(defaultResultFilter)

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
      legLength: parseNum(legLengthStr),
      posture,
    }
    const errs = validateParams(raw)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const params = raw as UserParams
    setResults(recommendChairs(allChairs, params))
    setDescription(generateDescription(params))
    // reset result filter when re-running recommendation
    setResultFilterDraft(defaultResultFilter)
    setResultFilter(defaultResultFilter)
  }

  const hasHighMatch = results?.some((r) => r.score >= 80) ?? false

  // Apply result filter to scored chairs
  const filteredResults = results
    ? filterChairs(results.map((r) => r.chair), resultFilter).map((chair) => {
        return results.find((r) => r.chair.id === chair.id)!
      })
    : null

  const matchCount = filteredResults?.filter((r) => r.score > 0).length ?? 0

  return (
    <div className="min-h-screen bg-page">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Top section: form left, illustration right */}
        <div className="flex gap-16 items-stretch mb-20">

          {/* Left: heading + form */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-5xl font-bold leading-[1.05] text-gray-950 tracking-tight mb-3">
              找到属于你的椅子
            </h1>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed">
              输入身体信息，帮你找到最适合的椅子，填写更多参数可获得更精准的推荐。
            </p>

            {/* Row 1: height + weight */}
            <div className="grid grid-cols-2 gap-6 mb-3">
              <div>
                <FieldLabel htmlFor="height" text="身高" unit="cm" required />
                <input id="height" type="number" value={heightStr} onChange={(e) => setHeightStr(e.target.value)} placeholder="175" className={inputCls} />
                <p className="text-xs text-red-500 mt-1 h-4">{errors.height ?? ''}</p>
              </div>
              <div>
                <FieldLabel htmlFor="weight" text="体重" unit="kg" required />
                <input id="weight" type="number" value={weightStr} onChange={(e) => setWeightStr(e.target.value)} placeholder="70" className={inputCls} />
                <p className="text-xs text-red-500 mt-1 h-4">{errors.weight ?? ''}</p>
              </div>
            </div>

            {/* Row 2: legLength + posture */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <FieldLabel htmlFor="legLength" text="腿长" unit="cm" required={false} tooltip="站立时髋部到地面的距离，用于估算最适合的座高" />
                <input id="legLength" type="number" value={legLengthStr} onChange={(e) => setLegLengthStr(e.target.value)} placeholder="88" className={inputCls} />
                <p className="text-xs text-red-500 mt-1 h-4">{errors.legLength ?? ''}</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-xs font-medium text-gray-600">工作姿势</span>
                </div>
                <Select value={posture} onValueChange={(v) => setPosture(v as PosturePreference)}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="upright">习惯挺直坐姿</SelectItem>
                    <SelectItem value="reclined">喜欢后仰放松</SelectItem>
                    <SelectItem value="forward">偏好前倾工作</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 h-4" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gray-950 text-white py-4 rounded-md text-xs font-bold tracking-[0.15em] uppercase hover:bg-gray-800 active:scale-[0.99] transition-all"
            >
              查找匹配
            </button>
          </div>

          {/* Right: illustration + description */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Body silhouette placeholder — fills space between top and description */}
            <div className="relative bg-gray-200 rounded-xl flex items-center justify-center flex-1 overflow-hidden">
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
        {filteredResults !== null && (
          <div className="flex gap-14">
            {/* Filter sidebar */}
            <div className="pt-3">
              <FilterPanelInner
                draft={resultFilterDraft}
                setDraft={setResultFilterDraft}
                onApply={() => setResultFilter(resultFilterDraft)}
              />
            </div>

            {/* Chairs grid */}
            <div className="flex-1 min-w-0">
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
              {filteredResults.every((r) => r.score === 0) ? (
                <p className="text-gray-500 text-sm">暂未找到匹配的椅子，建议调整参数后重试</p>
              ) : filteredResults.length === 0 ? (
                <p className="text-gray-500 text-sm">没有符合筛选条件的椅子，试试调整筛选条件</p>
              ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {filteredResults.map(({ chair, score }) => {
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
