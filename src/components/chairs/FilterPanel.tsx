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
      <div className="flex bg-gray-100 p-1 rounded-lg gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
              value === opt.value
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
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
  const { filter, setFilter } = useFilter()
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

  return (
    <aside className="w-64 shrink-0">
      <div className="space-y-0">
        {/* 价格 */}
        <div className="py-5">
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

        <hr className="border-gray-100" />

        {/* 材质 */}
        <div className="py-5">
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

        <hr className="border-gray-100" />

        {/* 颜色 */}
        <div className="py-5">
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
                    ? 'border-white ring-2 ring-gray-900'
                    : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: c.rgb }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* 头枕 / 腰靠 / 腰靠可调节 */}
        <hr className="border-gray-100" />
        <div className="py-5">
          <TriStateGroup label="Headrest" value={filter.headrest}
            onChange={(v) => setFilter({ ...filter, headrest: v })}
            onClear={() => setFilter({ ...filter, headrest: 'all' })} />
        </div>
        <hr className="border-gray-100" />
        <div className="py-5">
          <TriStateGroup label="Lumbar Support" value={filter.lumbar}
            onChange={(v) => setFilter({ ...filter, lumbar: v })}
            onClear={() => setFilter({ ...filter, lumbar: 'all' })} />
        </div>
        <hr className="border-gray-100" />
        <div className="py-5">
          <TriStateGroup label="Adjustable" value={filter.lumbarAdjustable}
            onChange={(v) => setFilter({ ...filter, lumbarAdjustable: v })}
            onClear={() => setFilter({ ...filter, lumbarAdjustable: 'all' })} />
        </div>
      </div>
    </aside>
  )
}
