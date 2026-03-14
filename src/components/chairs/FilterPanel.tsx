'use client'
import { useState } from 'react'
import { useFilter } from '@/contexts/FilterContext'
import { getMaterials, getColors, getPriceBounds } from '@/lib/catalog'
import { TriState, FilterState } from '@/types/catalog'
import { PriceRangeSlider } from './PriceRangeSlider'
import { RangeSlider } from './RangeSlider'
import { TileSelect } from './TileSelect'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const HEADREST_OPTIONS = ['无', '3D', '5D', '6D']
const ARMREST_OPTIONS  = ['无', '3D', '4D', '5D', '6D', '7D', '8D']

// Static catalog data — read once at module level, not on every render
const allMaterials = getMaterials()
const allColors = getColors()
const priceBounds = getPriceBounds()

function TriStateGroup({
  label, value, onChange, onClear,
}: {
  label: string
  value: TriState
  onChange: (v: TriState) => void
  onClear: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {value !== 'all' && (
          <button type="button" onClick={onClear} aria-label={`清除${label}筛选`} className="text-xs text-gray-400 hover:text-gray-600">×</button>
        )}
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => { if (v) onChange(v as TriState) }}
        variant="outline"
        className="w-full"
      >
        <ToggleGroupItem value="all" className="flex-1 text-xs data-[state=on]:bg-gray-950 data-[state=on]:text-white">不限</ToggleGroupItem>
        <ToggleGroupItem value="yes" className="flex-1 text-xs data-[state=on]:bg-gray-950 data-[state=on]:text-white">有</ToggleGroupItem>
        <ToggleGroupItem value="no"  className="flex-1 text-xs data-[state=on]:bg-gray-950 data-[state=on]:text-white">无</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

function SectionHeader({ label, hasActive, onClear }: { label: string; hasActive: boolean; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hasActive && (
        <button type="button" onClick={onClear} aria-label={`清除${label}筛选`} className="text-xs text-gray-400 hover:text-gray-600">×</button>
      )}
    </div>
  )
}

export function FilterPanel() {
  const { filter, setFilter } = useFilter()
  const { min: absMin, max: absMax } = priceBounds
  const materials = allMaterials
  const colors = allColors

  const [draft, setDraft] = useState<FilterState>(filter)

  const matLabelToId = Object.fromEntries(materials.map((m) => [m.label, m.id]))
  const matIdToLabel = Object.fromEntries(materials.map((m) => [m.id, m.label]))
  const selectedMaterialLabels = draft.materials.map((id) => matIdToLabel[id]).filter(Boolean)

  const toggleColor = (id: string) => {
    const next = draft.colors.includes(id)
      ? draft.colors.filter((c) => c !== id)
      : [...draft.colors, id]
    setDraft({ ...draft, colors: next })
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
            {(draft.priceMin > absMin || draft.priceMax < absMax) && (
              <button type="button" onClick={() => setDraft({ ...draft, priceMin: absMin, priceMax: absMax })}
                aria-label="清除价格筛选" className="text-xs text-gray-400 hover:text-gray-600">×</button>
            )}
          </div>
          <PriceRangeSlider
            min={absMin} max={absMax}
            value={[draft.priceMin, draft.priceMax]}
            onChange={([mn, mx]) => setDraft({ ...draft, priceMin: mn, priceMax: mx })}
          />
        </div>

        <hr className="border-gray-100" />

        {/* 材质 */}
        <div className="py-5">
          <SectionHeader label="材质" hasActive={draft.materials.length > 0}
            onClear={() => setDraft({ ...draft, materials: [] })} />
          <TileSelect
            options={materials.map((m) => m.label)}
            selected={selectedMaterialLabels}
            onChange={(labels) => setDraft({ ...draft, materials: labels.map((l) => matLabelToId[l]).filter(Boolean) })}
          />
        </div>

        <hr className="border-gray-100" />

        {/* 靠背高度 */}
        <div className="py-5">
          <SectionHeader label="靠背高度"
            hasActive={draft.backHeightMin > 40 || draft.backHeightMax < 70}
            onClear={() => setDraft({ ...draft, backHeightMin: 40, backHeightMax: 70 })} />
          <RangeSlider min={40} max={70} unit="cm"
            value={[draft.backHeightMin, draft.backHeightMax]}
            onChange={([a, b]) => setDraft({ ...draft, backHeightMin: a, backHeightMax: b })} />
        </div>

        <hr className="border-gray-100" />

        {/* 座高 */}
        <div className="py-5">
          <SectionHeader label="座高"
            hasActive={draft.seatHeightMin > 40 || draft.seatHeightMax < 55}
            onClear={() => setDraft({ ...draft, seatHeightMin: 40, seatHeightMax: 55 })} />
          <RangeSlider min={40} max={55} unit="cm"
            value={[draft.seatHeightMin, draft.seatHeightMax]}
            onChange={([a, b]) => setDraft({ ...draft, seatHeightMin: a, seatHeightMax: b })} />
        </div>

        <hr className="border-gray-100" />

        {/* 后仰角度 */}
        <div className="py-5">
          <SectionHeader label="后仰角度"
            hasActive={draft.recliningAngleMin > 30 || draft.recliningAngleMax < 160}
            onClear={() => setDraft({ ...draft, recliningAngleMin: 30, recliningAngleMax: 160 })} />
          <RangeSlider min={30} max={160} unit="°"
            value={[draft.recliningAngleMin, draft.recliningAngleMax]}
            onChange={([a, b]) => setDraft({ ...draft, recliningAngleMin: a, recliningAngleMax: b })} />
        </div>

        <hr className="border-gray-100" />

        {/* 颜色 */}
        <div className="py-5">
          <SectionHeader label="颜色" hasActive={draft.colors.length > 0}
            onClear={() => setDraft({ ...draft, colors: [] })} />
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.name}
                onClick={() => toggleColor(c.id)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  draft.colors.includes(c.id)
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
          <SectionHeader label="扶手" hasActive={draft.armrestAdjustment.length > 0}
            onClear={() => setDraft({ ...draft, armrestAdjustment: [] })} />
          <TileSelect options={ARMREST_OPTIONS}
            selected={toUI(draft.armrestAdjustment)}
            onChange={(ui) => setDraft({ ...draft, armrestAdjustment: toFilter(ui) })} />
        </div>

        <hr className="border-gray-100" />

        {/* 头枕 */}
        <div className="py-5">
          <SectionHeader label="头枕" hasActive={draft.headrestAdjustment.length > 0}
            onClear={() => setDraft({ ...draft, headrestAdjustment: [] })} />
          <TileSelect options={HEADREST_OPTIONS}
            selected={toUI(draft.headrestAdjustment)}
            onChange={(ui) => setDraft({ ...draft, headrestAdjustment: toFilter(ui) })} />
        </div>

        <hr className="border-gray-100" />

        {/* 腰靠 */}
        <div className="py-5">
          <TriStateGroup label="腰靠" value={draft.lumbar}
            onChange={(v) => setDraft({ ...draft, lumbar: v })}
            onClear={() => setDraft({ ...draft, lumbar: 'all' })} />
        </div>

        <hr className="border-gray-100" />

        {/* 腰靠可调节 */}
        <div className="py-5">
          <TriStateGroup label="腰靠可调节" value={draft.lumbarAdjustable}
            onChange={(v) => setDraft({ ...draft, lumbarAdjustable: v })}
            onClear={() => setDraft({ ...draft, lumbarAdjustable: 'all' })} />
        </div>

      </div>

      {/* 检索按钮 */}
      <div className="pt-5">
        <button
          type="button"
          onClick={() => setFilter(draft)}
          className="w-full bg-gray-950 text-white py-2.5 rounded-md text-xs font-bold tracking-[0.12em] uppercase hover:bg-gray-800 active:scale-[0.99] transition-all"
        >
          检索
        </button>
      </div>
    </aside>
  )
}
