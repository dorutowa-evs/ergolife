'use client'
import { useFilter } from '@/contexts/FilterContext'
import { getMaterials, getColors, getPriceBounds } from '@/lib/catalog'
import { TriState } from '@/types/catalog'
import { PriceRangeSlider } from './PriceRangeSlider'
import { RangeSlider } from './RangeSlider'
import { TileSelect } from './TileSelect'

const HEADREST_OPTIONS = ['无', '3D', '5D', '6D']
const ARMREST_OPTIONS  = ['无', '3D', '4D', '5D', '6D', '7D', '8D']

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
    { value: 'no',  label: '无' },
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {value !== 'all' && (
          <button type="button" onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">×</button>
        )}
      </div>
      <div className="flex bg-gray-100 p-1 rounded-lg gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
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

function SectionHeader({ label, hasActive, onClear }: { label: string; hasActive: boolean; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hasActive && (
        <button type="button" onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">×</button>
      )}
    </div>
  )
}

export function FilterPanel() {
  const { filter, setFilter } = useFilter()
  const { min: absMin, max: absMax } = getPriceBounds()
  const materials = getMaterials()
  const colors = getColors()

  const matLabelToId = Object.fromEntries(materials.map((m) => [m.label, m.id]))
  const matIdToLabel = Object.fromEntries(materials.map((m) => [m.id, m.label]))
  const selectedMaterialLabels = filter.materials.map((id) => matIdToLabel[id]).filter(Boolean)

  const toggleColor = (id: string) => {
    const next = filter.colors.includes(id)
      ? filter.colors.filter((c) => c !== id)
      : [...filter.colors, id]
    setFilter({ ...filter, colors: next })
  }

  // TileSelect uses '无' in UI but FilterState stores 'none'
  const toFilter = (ui: string[]) => ui.map(v => v === '无' ? 'none' : v)
  const toUI = (fs: string[]) => fs.map(v => v === 'none' ? '无' : v)

  return (
    <aside className="w-64 shrink-0">
      <div className="space-y-0">

        {/* 价格 */}
        <div className="pb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">价格</span>
            {(filter.priceMin > absMin || filter.priceMax < absMax) && (
              <button type="button" onClick={() => setFilter({ ...filter, priceMin: absMin, priceMax: absMax })}
                className="text-xs text-gray-400 hover:text-gray-600">×</button>
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
          <SectionHeader label="材质" hasActive={filter.materials.length > 0}
            onClear={() => setFilter({ ...filter, materials: [] })} />
          <TileSelect
            options={materials.map((m) => m.label)}
            selected={selectedMaterialLabels}
            onChange={(labels) => setFilter({ ...filter, materials: labels.map((l) => matLabelToId[l]).filter(Boolean) })}
          />
        </div>

        <hr className="border-gray-100" />

        {/* 靠背高度 */}
        <div className="py-5">
          <SectionHeader label="靠背高度"
            hasActive={filter.backHeightMin > 40 || filter.backHeightMax < 70}
            onClear={() => setFilter({ ...filter, backHeightMin: 40, backHeightMax: 70 })} />
          <RangeSlider min={40} max={70} unit="cm"
            value={[filter.backHeightMin, filter.backHeightMax]}
            onChange={([a, b]) => setFilter({ ...filter, backHeightMin: a, backHeightMax: b })} />
        </div>

        <hr className="border-gray-100" />

        {/* 座高 */}
        <div className="py-5">
          <SectionHeader label="座高"
            hasActive={filter.seatHeightMin > 40 || filter.seatHeightMax < 55}
            onClear={() => setFilter({ ...filter, seatHeightMin: 40, seatHeightMax: 55 })} />
          <RangeSlider min={40} max={55} unit="cm"
            value={[filter.seatHeightMin, filter.seatHeightMax]}
            onChange={([a, b]) => setFilter({ ...filter, seatHeightMin: a, seatHeightMax: b })} />
        </div>

        <hr className="border-gray-100" />

        {/* 后仰角度 */}
        <div className="py-5">
          <SectionHeader label="后仰角度"
            hasActive={filter.recliningAngleMin > 30 || filter.recliningAngleMax < 160}
            onClear={() => setFilter({ ...filter, recliningAngleMin: 30, recliningAngleMax: 160 })} />
          <RangeSlider min={30} max={160} unit="°"
            value={[filter.recliningAngleMin, filter.recliningAngleMax]}
            onChange={([a, b]) => setFilter({ ...filter, recliningAngleMin: a, recliningAngleMax: b })} />
        </div>

        <hr className="border-gray-100" />

        {/* 颜色 */}
        <div className="py-5">
          <SectionHeader label="颜色" hasActive={filter.colors.length > 0}
            onClear={() => setFilter({ ...filter, colors: [] })} />
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
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

        <hr className="border-gray-100" />

        {/* 扶手 */}
        <div className="py-5">
          <SectionHeader label="扶手" hasActive={filter.armrestAdjustment.length > 0}
            onClear={() => setFilter({ ...filter, armrestAdjustment: [] })} />
          <TileSelect options={ARMREST_OPTIONS}
            selected={toUI(filter.armrestAdjustment)}
            onChange={(ui) => setFilter({ ...filter, armrestAdjustment: toFilter(ui) })} />
        </div>

        <hr className="border-gray-100" />

        {/* 头枕 */}
        <div className="py-5">
          <SectionHeader label="头枕" hasActive={filter.headrestAdjustment.length > 0}
            onClear={() => setFilter({ ...filter, headrestAdjustment: [] })} />
          <TileSelect options={HEADREST_OPTIONS}
            selected={toUI(filter.headrestAdjustment)}
            onChange={(ui) => setFilter({ ...filter, headrestAdjustment: toFilter(ui) })} />
        </div>

        <hr className="border-gray-100" />

        {/* 腰靠 */}
        <div className="py-5">
          <TriStateGroup label="腰靠" value={filter.lumbar}
            onChange={(v) => setFilter({ ...filter, lumbar: v })}
            onClear={() => setFilter({ ...filter, lumbar: 'all' })} />
        </div>

        <hr className="border-gray-100" />

        {/* 腰靠可调节 */}
        <div className="py-5">
          <TriStateGroup label="腰靠可调节" value={filter.lumbarAdjustable}
            onChange={(v) => setFilter({ ...filter, lumbarAdjustable: v })}
            onClear={() => setFilter({ ...filter, lumbarAdjustable: 'all' })} />
        </div>

      </div>
    </aside>
  )
}
