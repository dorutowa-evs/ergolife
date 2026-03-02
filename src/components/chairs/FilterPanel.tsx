'use client'
import { useFilter } from '@/contexts/FilterContext'
import { getMaterials, getColors, getPriceBounds } from '@/lib/catalog'
import { TriState } from '@/types/catalog'
import { PriceRangeSlider } from './PriceRangeSlider'
import { Checkbox } from '@/components/ui/checkbox'

function TriStateGroup({
  label, value, onChange, onClear,
}: {
  label: string
  value: TriState
  onChange: (v: TriState) => void
  onClear: () => void
}) {
  const options: { value: TriState; label: string }[] = [
    { value: 'all', label: '不限' },
    { value: 'yes', label: '有' },
    { value: 'no', label: '无' },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {value !== 'all' && (
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">×</button>
        )}
      </div>
      <div className="flex rounded-md border border-gray-200 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              value === opt.value
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterPanel() {
  const { filter, setFilter, resetFilter } = useFilter()
  const { min: absMin, max: absMax } = getPriceBounds()
  const materials = getMaterials()
  const colors = getColors()

  const toggleMaterial = (id: string) => {
    const next = filter.materials.includes(id)
      ? filter.materials.filter((m) => m !== id)
      : [...filter.materials, id]
    setFilter({ ...filter, materials: next })
  }

  const toggleColor = (id: string) => {
    const next = filter.colors.includes(id)
      ? filter.colors.filter((c) => c !== id)
      : [...filter.colors, id]
    setFilter({ ...filter, colors: next })
  }

  const hasActive =
    filter.priceMin > absMin || filter.priceMax < absMax ||
    filter.materials.length > 0 || filter.colors.length > 0 ||
    filter.headrest !== 'all' || filter.lumbar !== 'all' || filter.lumbarAdjustable !== 'all'

  return (
    <aside className="w-64 shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">筛选条件</h2>
        {hasActive && (
          <button onClick={resetFilter} className="text-xs text-blue-600 hover:text-blue-800">
            重置全部
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* 价格 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Price Range</span>
            {(filter.priceMin > absMin || filter.priceMax < absMax) && (
              <button
                onClick={() => setFilter({ ...filter, priceMin: absMin, priceMax: absMax })}
                className="text-xs text-gray-400 hover:text-gray-600"
              >×</button>
            )}
          </div>
          <PriceRangeSlider
            min={absMin} max={absMax}
            value={[filter.priceMin, filter.priceMax]}
            onChange={([mn, mx]) => setFilter({ ...filter, priceMin: mn, priceMax: mx })}
          />
        </div>

        {/* 材质 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Material</span>
            {filter.materials.length > 0 && (
              <button
                onClick={() => setFilter({ ...filter, materials: [] })}
                className="text-xs text-gray-400 hover:text-gray-600"
              >×</button>
            )}
          </div>
          <div className="space-y-2">
            {materials.map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id={`mat-${m.id}`}
                  checked={filter.materials.includes(m.id)}
                  onCheckedChange={() => toggleMaterial(m.id)}
                />
                <span className="text-sm text-gray-600">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 颜色 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Color</span>
            {filter.colors.length > 0 && (
              <button
                onClick={() => setFilter({ ...filter, colors: [] })}
                className="text-xs text-gray-400 hover:text-gray-600"
              >×</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.id}
                aria-label={c.name}
                onClick={() => toggleColor(c.id)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  filter.colors.includes(c.id)
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent hover:border-gray-400'
                }`}
                style={{ backgroundColor: c.rgb }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* 头枕 / 腰靠 / 腰靠可调节 */}
        <TriStateGroup label="Headrest" value={filter.headrest}
          onChange={(v) => setFilter({ ...filter, headrest: v })}
          onClear={() => setFilter({ ...filter, headrest: 'all' })} />
        <TriStateGroup label="Lumbar Support" value={filter.lumbar}
          onChange={(v) => setFilter({ ...filter, lumbar: v })}
          onClear={() => setFilter({ ...filter, lumbar: 'all' })} />
        <TriStateGroup label="Adjustable" value={filter.lumbarAdjustable}
          onChange={(v) => setFilter({ ...filter, lumbarAdjustable: v })}
          onClear={() => setFilter({ ...filter, lumbarAdjustable: 'all' })} />
      </div>
    </aside>
  )
}
