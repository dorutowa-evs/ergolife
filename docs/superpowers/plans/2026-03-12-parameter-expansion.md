# Parameter Expansion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Chair data model with 5 new parameters (靠背高度, 座高, 后仰角度, 扶手, 头枕 D-grade), update filtering and comparison accordingly, and simplify materials from 5 to 3 types.

**Architecture:** Clean-break approach — update types, catalog JSON, filter logic, formatters, and UI in one coherent pass. Two new reusable UI components (RangeSlider, TileSelect) are introduced to keep FilterPanel clean. All changes are covered by tests before implementation.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Vitest + Testing Library

---

## Chunk 1: Data Layer

### Task 1: Update `catalog.ts` types

**Files:**
- Modify: `src/types/catalog.ts`

- [ ] **Step 1: Update `Chair` interface** — remove `hasHeadrest`, add 5 new fields

```typescript
export interface Chair {
  id: string
  name: string
  price: number
  imageUrl: string
  imageFit?: 'cover' | 'contain'
  material: 'mesh' | 'leather' | 'fabric'
  color: string
  hasLumbar: boolean
  isLumbarAdjustable: boolean
  headrestAdjustment: '3D' | '5D' | '6D' | null   // null = no headrest
  armrestAdjustment: '3D' | '4D' | '5D' | '6D' | '7D' | '8D' | null  // null = no armrest
  backHeight: number    // cm, 40–70
  seatHeight: number    // cm, 40–55
  recliningAngle: number // degrees, 30–160
  description: string
  badge?: 'TOP_PICK' | 'SALE'
  originalPrice?: number
}
```

- [ ] **Step 2: Update `FilterState` interface** — remove `headrest` TriState, add new fields

```typescript
export interface FilterState {
  priceMin: number
  priceMax: number
  materials: string[]
  colors: string[]
  headrestAdjustment: string[]   // [] = all; 'none' = null; '3D'|'5D'|'6D' = specific
  armrestAdjustment: string[]    // [] = all; 'none' = null; '3D'–'8D' = specific
  backHeightMin: number
  backHeightMax: number
  seatHeightMin: number
  seatHeightMax: number
  recliningAngleMin: number
  recliningAngleMax: number
  lumbar: TriState
  lumbarAdjustable: TriState
}
```

- [ ] **Step 3: Update `makeDefaultFilter`**

```typescript
export function makeDefaultFilter(priceMin: number, priceMax: number): FilterState {
  return {
    priceMin,
    priceMax,
    materials: [],
    colors: [],
    headrestAdjustment: [],
    armrestAdjustment: [],
    backHeightMin: 40,
    backHeightMax: 70,
    seatHeightMin: 40,
    seatHeightMax: 55,
    recliningAngleMin: 30,
    recliningAngleMax: 160,
    lumbar: 'all',
    lumbarAdjustable: 'all',
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles** (expect errors — downstream files still reference old fields, will be fixed in later tasks)

```bash
npx tsc --noEmit 2>&1 | head -40
```

---

### Task 2: Update `filterChairs.ts`

**Files:**
- Modify: `src/lib/filterChairs.ts`
- Modify: `src/lib/__tests__/filterChairs.test.ts`

- [ ] **Step 1: Write failing tests** — replace `hasHeadrest` fixtures, add new filter cases

Replace the entire test file:

```typescript
import { filterChairs } from '../filterChairs'
import { Chair, FilterState, makeDefaultFilter } from '@/types/catalog'

const base: Omit<Chair, 'id' | 'name' | 'price' | 'material' | 'color'> = {
  imageUrl: '',
  hasLumbar: true,
  isLumbarAdjustable: true,
  headrestAdjustment: null,
  armrestAdjustment: null,
  backHeight: 55,
  seatHeight: 46,
  recliningAngle: 110,
  description: '',
}

const chairs: Chair[] = [
  { ...base, id: '1', name: 'A', price: 500,  material: 'mesh',    color: 'black', headrestAdjustment: '3D', armrestAdjustment: '4D', backHeight: 45, seatHeight: 41, recliningAngle: 90  },
  { ...base, id: '2', name: 'B', price: 1500, material: 'leather', color: 'white', headrestAdjustment: null, armrestAdjustment: '6D', backHeight: 60, seatHeight: 48, recliningAngle: 130 },
  { ...base, id: '3', name: 'C', price: 3000, material: 'mesh',    color: 'gray',  headrestAdjustment: '5D', armrestAdjustment: null, backHeight: 68, seatHeight: 54, recliningAngle: 150 },
  { ...base, id: '4', name: 'D', price: 500,  material: 'fabric',  color: 'beige', headrestAdjustment: null, armrestAdjustment: '3D', backHeight: 52, seatHeight: 44, recliningAngle: 100, hasLumbar: false, isLumbarAdjustable: false },
]

const f = (overrides: Partial<FilterState>): FilterState => ({
  ...makeDefaultFilter(0, 10000),
  ...overrides,
})

describe('filterChairs', () => {
  it('returns all chairs with default filter', () => {
    expect(filterChairs(chairs, f({}))).toHaveLength(4)
  })

  it('filters by price range', () => {
    expect(filterChairs(chairs, f({ priceMin: 600, priceMax: 2000 })).map(c => c.id)).toEqual(['2'])
  })

  it('filters by material', () => {
    expect(filterChairs(chairs, f({ materials: ['mesh', 'fabric'] })).map(c => c.id)).toEqual(['1', '3', '4'])
  })

  it('filters by color', () => {
    expect(filterChairs(chairs, f({ colors: ['black', 'gray'] })).map(c => c.id)).toEqual(['1', '3'])
  })

  it('combines material AND color (AND between fields)', () => {
    expect(filterChairs(chairs, f({ materials: ['mesh'], colors: ['gray'] })).map(c => c.id)).toEqual(['3'])
  })

  it('filters headrestAdjustment: specific D value', () => {
    expect(filterChairs(chairs, f({ headrestAdjustment: ['3D'] })).map(c => c.id)).toEqual(['1'])
  })

  it('filters headrestAdjustment: none (no headrest)', () => {
    expect(filterChairs(chairs, f({ headrestAdjustment: ['none'] })).map(c => c.id)).toEqual(['2', '4'])
  })

  it('filters headrestAdjustment: multi-select (OR logic)', () => {
    expect(filterChairs(chairs, f({ headrestAdjustment: ['3D', '5D'] })).map(c => c.id)).toEqual(['1', '3'])
  })

  it('filters armrestAdjustment: specific D value', () => {
    expect(filterChairs(chairs, f({ armrestAdjustment: ['4D'] })).map(c => c.id)).toEqual(['1'])
  })

  it('filters armrestAdjustment: none (no armrest)', () => {
    expect(filterChairs(chairs, f({ armrestAdjustment: ['none'] })).map(c => c.id)).toEqual(['3'])
  })

  it('filters by backHeight range', () => {
    expect(filterChairs(chairs, f({ backHeightMin: 55, backHeightMax: 65 })).map(c => c.id)).toEqual(['2'])
  })

  it('filters by seatHeight range', () => {
    expect(filterChairs(chairs, f({ seatHeightMin: 50, seatHeightMax: 55 })).map(c => c.id)).toEqual(['3'])
  })

  it('filters by recliningAngle range', () => {
    expect(filterChairs(chairs, f({ recliningAngleMin: 125, recliningAngleMax: 160 })).map(c => c.id)).toEqual(['3'])
  })

  it('filters lumbar: yes', () => {
    expect(filterChairs(chairs, f({ lumbar: 'yes' })).map(c => c.id)).toEqual(['1', '2', '3'])
  })

  it('filters lumbarAdjustable: yes', () => {
    expect(filterChairs(chairs, f({ lumbarAdjustable: 'yes' })).map(c => c.id)).toEqual(['1', '2', '3'])
  })

  it('sorts by price ascending', () => {
    expect(filterChairs(chairs, f({}), 'price_asc').map(c => c.id)).toEqual(['1', '4', '2', '3'])
  })

  it('sorts by price descending', () => {
    expect(filterChairs(chairs, f({}), 'price_desc').map(c => c.id)).toEqual(['3', '2', '1', '4'])
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/lib/__tests__/filterChairs.test.ts 2>&1 | tail -20
```

Expected: FAIL (references `hasHeadrest` and missing new fields)

- [ ] **Step 3: Rewrite `filterChairs.ts`**

```typescript
import { Chair, FilterState, SortOrder } from '@/types/catalog'

export function filterChairs(
  chairs: Chair[],
  filter: FilterState,
  sortOrder: SortOrder = 'default'
): Chair[] {
  let result = chairs.filter((c) => {
    if (c.price < filter.priceMin || c.price > filter.priceMax) return false
    if (filter.materials.length > 0 && !filter.materials.includes(c.material)) return false
    if (filter.colors.length > 0 && !filter.colors.includes(c.color)) return false
    if (filter.headrestAdjustment.length > 0) {
      const match = filter.headrestAdjustment.some((v) =>
        v === 'none' ? c.headrestAdjustment === null : c.headrestAdjustment === v
      )
      if (!match) return false
    }
    if (filter.armrestAdjustment.length > 0) {
      const match = filter.armrestAdjustment.some((v) =>
        v === 'none' ? c.armrestAdjustment === null : c.armrestAdjustment === v
      )
      if (!match) return false
    }
    if (c.backHeight < filter.backHeightMin || c.backHeight > filter.backHeightMax) return false
    if (c.seatHeight < filter.seatHeightMin || c.seatHeight > filter.seatHeightMax) return false
    if (c.recliningAngle < filter.recliningAngleMin || c.recliningAngle > filter.recliningAngleMax) return false
    if (filter.lumbar === 'yes' && !c.hasLumbar) return false
    if (filter.lumbar === 'no' && c.hasLumbar) return false
    if (filter.lumbarAdjustable === 'yes' && !c.isLumbarAdjustable) return false
    if (filter.lumbarAdjustable === 'no' && c.isLumbarAdjustable) return false
    return true
  })

  if (sortOrder === 'price_asc') result = [...result].sort((a, b) => a.price - b.price)
  if (sortOrder === 'price_desc') result = [...result].sort((a, b) => b.price - a.price)

  return result
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/lib/__tests__/filterChairs.test.ts 2>&1 | tail -10
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/catalog.ts src/lib/filterChairs.ts src/lib/__tests__/filterChairs.test.ts
git commit -m "feat(data): expand Chair type and update filterChairs for new params"
```

---

### Task 3: Add formatters for new fields

**Files:**
- Modify: `src/lib/formatters.ts`
- Modify: `src/lib/__tests__/formatters.test.ts`

- [ ] **Step 1: Write failing tests** — first update the import line at the top of the existing test file, then append the new describe blocks

Update import line from:
```typescript
import { formatPrice, formatMaterialLabel, formatBool, formatValue } from '../formatters'
```
to:
```typescript
import { formatPrice, formatMaterialLabel, formatBool, formatValue, formatAdjustment, formatRange } from '../formatters'
```

Then append to the end of the file:

```typescript
describe('formatAdjustment', () => {
  it('returns value as-is for D grades', () => {
    expect(formatAdjustment('3D')).toBe('3D')
    expect(formatAdjustment('8D')).toBe('8D')
  })
  it('returns 无 for null', () => {
    expect(formatAdjustment(null)).toBe('无')
  })
})

describe('formatRange', () => {
  it('formats cm range', () => {
    expect(formatRange(45, 62, 'cm')).toBe('45–62 cm')
  })
  it('formats degree range with ° symbol', () => {
    expect(formatRange(90, 135, '°')).toBe('90–135°')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/lib/__tests__/formatters.test.ts 2>&1 | tail -10
```

- [ ] **Step 3: Add the two new functions to `formatters.ts`**

```typescript
export function formatAdjustment(value: string | null): string {
  return value ?? '无'
}

export function formatRange(min: number, max: number, unit: string): string {
  const sep = unit === '°' ? '' : ' '
  return `${min}–${max}${sep}${unit}`
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/lib/__tests__/formatters.test.ts 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/formatters.ts src/lib/__tests__/formatters.test.ts
git commit -m "feat(formatters): add formatAdjustment and formatRange"
```

---

### Task 4: Update catalog JSON

**Files:**
- Modify: `src/data/chairs.catalog.json`

- [ ] **Step 1: Replace `materials` array** — reduce to 3 entries

```json
"materials": [
  { "id": "mesh",    "label": "网布" },
  { "id": "leather", "label": "皮质" },
  { "id": "fabric",  "label": "布艺" }
]
```

- [ ] **Step 2: Add new fields to every chair** — use the table below as reference. Remove `hasHeadrest` from every record. Map `genuine-leather` → `leather`.

| id | material | headrestAdjustment | armrestAdjustment | backHeight | seatHeight | recliningAngle |
|----|----------|--------------------|-------------------|-----------|------------|----------------|
| c001 | mesh | null | "8D" | 64 | 46 | 110 |
| c002 | mesh | "3D" | "4D" | 58 | 44 | 120 |
| c003 | mesh | null | "4D" | 60 | 45 | 120 |
| c004 | fabric | null | "4D" | 62 | 47 | 130 |
| c005 | fabric | null | "6D" | 60 | 45 | 125 |
| c006 | mesh | null | "4D" | 65 | 48 | 115 |
| c007 | mesh | null | "3D" | 55 | 43 | 100 |
| c008 | leather | "6D" | "3D" | 68 | 50 | 140 |
| c009 | mesh | null | "4D" | 56 | 44 | 110 |
| c010 | mesh | null | "5D" | 58 | 45 | 105 |
| c011 | mesh | null | "5D" | 62 | 46 | 120 |
| c012 | fabric | "3D" | "4D" | 67 | 49 | 135 |
| c013 | mesh | "3D" | "3D" | 54 | 44 | 115 |
| c014 | mesh | "3D" | "4D" | 56 | 44 | 120 |
| c015 | fabric | null | "4D" | 57 | 45 | 125 |
| c016 | mesh | "5D" | "5D" | 55 | 43 | 120 |
| c017 | mesh | null | "4D" | 58 | 44 | 115 |
| c018 | mesh | "3D" | "4D" | 54 | 43 | 110 |

- [ ] **Step 3: Verify TypeScript is happy with the new JSON shape**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors (or only errors in UI files not yet updated)

- [ ] **Step 4: Commit**

```bash
git add src/data/chairs.catalog.json
git commit -m "feat(data): update catalog with new params, simplify materials to 3 types"
```

---

## Chunk 2: New UI Components

### Task 5: Create `RangeSlider` component

A simple range slider that shows current min/max values below the track, with a unit label. Simpler than `PriceRangeSlider` (no text inputs).

**Files:**
- Create: `src/components/chairs/RangeSlider.tsx`
- Create: `src/components/chairs/__tests__/RangeSlider.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/chairs/__tests__/RangeSlider.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RangeSlider } from '../RangeSlider'

it('displays current min and max values with unit', () => {
  render(<RangeSlider min={40} max={70} value={[45, 65]} unit="cm" onChange={() => {}} />)
  expect(screen.getByText('45 cm')).toBeInTheDocument()
  expect(screen.getByText('65 cm')).toBeInTheDocument()
})

it('displays degree values without space before unit', () => {
  render(<RangeSlider min={30} max={160} value={[90, 135]} unit="°" onChange={() => {}} />)
  expect(screen.getByText('90°')).toBeInTheDocument()
  expect(screen.getByText('135°')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx vitest run src/components/chairs/__tests__/RangeSlider.test.tsx 2>&1 | tail -10
```

- [ ] **Step 3: Create `RangeSlider.tsx`**

```typescript
// src/components/chairs/RangeSlider.tsx
'use client'
import { Slider } from '@/components/ui/slider'

interface Props {
  min: number
  max: number
  value: [number, number]
  unit: string
  onChange: (value: [number, number]) => void
}

function fmt(n: number, unit: string): string {
  return unit === '°' ? `${n}°` : `${n} ${unit}`
}

export function RangeSlider({ min, max, value, unit, onChange }: Props) {
  return (
    <div>
      <Slider
        className="mb-2"
        min={min}
        max={max}
        step={1}
        value={[value[0], value[1]]}
        onValueChange={([a, b]) => onChange([a, b])}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{fmt(value[0], unit)}</span>
        <span>{fmt(value[1], unit)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npx vitest run src/components/chairs/__tests__/RangeSlider.test.tsx 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add src/components/chairs/RangeSlider.tsx src/components/chairs/__tests__/RangeSlider.test.tsx
git commit -m "feat(ui): add RangeSlider component with unit display"
```

---

### Task 6: Create `TileSelect` component

Multi-select tile grid. Used for 头枕 and 扶手 filter options.

**Files:**
- Create: `src/components/chairs/TileSelect.tsx`
- Create: `src/components/chairs/__tests__/TileSelect.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/chairs/__tests__/TileSelect.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TileSelect } from '../TileSelect'

const OPTIONS = ['无', '3D', '5D', '6D']

it('renders all options', () => {
  render(<TileSelect options={OPTIONS} selected={[]} onChange={() => {}} />)
  OPTIONS.forEach(opt => expect(screen.getByText(opt)).toBeInTheDocument())
})

it('calls onChange with added option when unselected tile clicked', async () => {
  const onChange = vi.fn()
  render(<TileSelect options={OPTIONS} selected={[]} onChange={onChange} />)
  await userEvent.click(screen.getByText('3D'))
  expect(onChange).toHaveBeenCalledWith(['3D'])
})

it('calls onChange removing option when selected tile clicked', async () => {
  const onChange = vi.fn()
  render(<TileSelect options={OPTIONS} selected={['3D', '5D']} onChange={onChange} />)
  await userEvent.click(screen.getByText('3D'))
  expect(onChange).toHaveBeenCalledWith(['5D'])
})

it('visually distinguishes selected tiles', () => {
  render(<TileSelect options={OPTIONS} selected={['5D']} onChange={() => {}} />)
  const selected = screen.getByText('5D').closest('button')
  const unselected = screen.getByText('3D').closest('button')
  expect(selected?.className).toContain('border-gray-900')
  expect(unselected?.className).not.toContain('border-gray-900')
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/components/chairs/__tests__/TileSelect.test.tsx 2>&1 | tail -10
```

- [ ] **Step 3: Create `TileSelect.tsx`**

```typescript
// src/components/chairs/TileSelect.tsx
'use client'
import { cn } from '@/lib/utils'

interface Props {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function TileSelect({ options, selected, onChange }: Props) {
  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt]
    onChange(next)
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={cn(
            'py-2 px-1 text-sm rounded-lg border transition-all text-center',
            selected.includes(opt)
              ? 'border-gray-900 bg-gray-50 text-gray-900 font-medium'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/components/chairs/__tests__/TileSelect.test.tsx 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
git add src/components/chairs/TileSelect.tsx src/components/chairs/__tests__/TileSelect.test.tsx
git commit -m "feat(ui): add TileSelect component for multi-select tile grid"
```

---

## Chunk 3: UI Integration

### Task 7: Update `FilterPanel`

Replace the headrest TriState with TileSelect. Add three RangeSliders and one TileSelect for armrest. Update labels to Chinese throughout.

**Files:**
- Modify: `src/components/chairs/FilterPanel.tsx`

- [ ] **Step 1: Replace entire `FilterPanel.tsx`**

```typescript
// src/components/chairs/FilterPanel.tsx
'use client'
import { useFilter } from '@/contexts/FilterContext'
import { getMaterials, getColors, getPriceBounds } from '@/lib/catalog'
import { TriState } from '@/types/catalog'
import { PriceRangeSlider } from './PriceRangeSlider'
import { RangeSlider } from './RangeSlider'
import { TileSelect } from './TileSelect'
import { Checkbox } from '@/components/ui/checkbox'

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

function SectionHeader({ label, hasActive, onClear }: { label: string; hasActive: boolean; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hasActive && (
        <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">×</button>
      )}
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

  // TileSelect uses '无' in UI but stores 'none' in FilterState
  const headrestToFilter = (ui: string[]) => ui.map(v => v === '无' ? 'none' : v)
  const headrestToUI = (fs: string[]) => fs.map(v => v === 'none' ? '无' : v)
  const armrestToFilter = (ui: string[]) => ui.map(v => v === '无' ? 'none' : v)
  const armrestToUI = (fs: string[]) => fs.map(v => v === 'none' ? '无' : v)

  return (
    <aside className="w-64 shrink-0">
      <div className="space-y-0">

        {/* 价格 */}
        <div className="py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">价格</span>
            {(filter.priceMin > absMin || filter.priceMax < absMax) && (
              <button onClick={() => setFilter({ ...filter, priceMin: absMin, priceMax: absMax })}
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
          <div className="space-y-2">
            {materials.map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox id={`mat-${m.id}`} checked={filter.materials.includes(m.id)}
                  onCheckedChange={() => toggleMaterial(m.id)} />
                <span className="text-sm text-gray-600">{m.label}</span>
              </label>
            ))}
          </div>
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
            selected={armrestToUI(filter.armrestAdjustment)}
            onChange={(ui) => setFilter({ ...filter, armrestAdjustment: armrestToFilter(ui) })} />
        </div>

        <hr className="border-gray-100" />

        {/* 头枕 */}
        <div className="py-5">
          <SectionHeader label="头枕" hasActive={filter.headrestAdjustment.length > 0}
            onClear={() => setFilter({ ...filter, headrestAdjustment: [] })} />
          <TileSelect options={HEADREST_OPTIONS}
            selected={headrestToUI(filter.headrestAdjustment)}
            onChange={(ui) => setFilter({ ...filter, headrestAdjustment: headrestToFilter(ui) })} />
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
```

- [ ] **Step 2: Run all tests — expect failures in FilterContext test (references `filter.headrest`)**

```bash
npx vitest run 2>&1 | tail -20
```

- [ ] **Step 3: Fix `FilterContext.test.tsx`** — replace the entire `Widget` function and update affected test

Replace the whole `Widget` function at the top of the test file with:

```typescript
function Widget() {
  const { filter, setFilter, resetFilter } = useFilter()
  return (
    <div>
      <span data-testid="mat">{filter.materials.join(',')}</span>
      <span data-testid="headrest">{filter.headrestAdjustment.join(',')}</span>
      <button onClick={() => setFilter({ ...filter, materials: ['mesh'] })}>set-mat</button>
      <button onClick={resetFilter}>reset</button>
    </div>
  )
}
```

Update the test that checked `filter.headrest`:
```typescript
it('initializes with empty headrestAdjustment', () => {
  render(<FilterProvider><Widget /></FilterProvider>)
  expect(screen.getByTestId('headrest').textContent).toBe('')
})
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run 2>&1 | tail -20
```

Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/components/chairs/FilterPanel.tsx src/contexts/__tests__/FilterContext.test.tsx
git commit -m "feat(filter): update FilterPanel with new params — sliders, tile selects, Chinese labels"
```

---

### Task 8: Update CompareTable PARAMS

**Files:**
- Modify: `src/components/compare/CompareTable.tsx`
- Modify: `src/components/compare/__tests__/CompareTable.test.tsx`

- [ ] **Step 1: Update `PARAMS` array in `CompareTable.tsx`**

Replace the existing `PARAMS` constant:

```typescript
import { formatPrice, formatMaterialLabel, formatBool, formatValue, formatAdjustment } from '@/lib/formatters'

const PARAMS: {
  label: string
  getValue: (c: Chair, materials: Material[], colors: Color[]) => React.ReactNode
}[] = [
  { label: '价格',     getValue: (c) => formatPrice(c.price) },
  { label: '材质',     getValue: (c, m) => formatValue(formatMaterialLabel(c.material, m)) },
  { label: '颜色',     getValue: (c, _m, cols) => formatValue(cols.find((col) => col.id === c.color)?.name) },
  { label: '靠背高度', getValue: (c) => `${c.backHeight} cm` },
  { label: '座高',     getValue: (c) => `${c.seatHeight} cm` },
  { label: '后仰角度', getValue: (c) => `${c.recliningAngle}°` },
  { label: '扶手',     getValue: (c) => formatAdjustment(c.armrestAdjustment) },
  { label: '头枕',     getValue: (c) => formatAdjustment(c.headrestAdjustment) },
  { label: '腰靠',     getValue: (c) => formatBool(c.hasLumbar) },
  { label: '腰靠可调节', getValue: (c) => formatBool(c.isLumbarAdjustable) },
]
```

- [ ] **Step 2: Update test fixtures in `CompareTable.test.tsx`** — remove `hasHeadrest`, add new fields

Replace the `chairs` fixture at the top of the test file:

```typescript
const chairs: Chair[] = [
  {
    id: 'c001', name: 'Aeron', price: 1999, imageUrl: '', description: '',
    material: 'mesh', color: 'black',
    hasLumbar: true, isLumbarAdjustable: true,
    headrestAdjustment: null, armrestAdjustment: '8D',
    backHeight: 64, seatHeight: 46, recliningAngle: 110,
  },
  {
    id: 'c002', name: 'Embody', price: 1795, imageUrl: '', description: '',
    material: 'mesh', color: 'black',
    hasLumbar: true, isLumbarAdjustable: true,
    headrestAdjustment: '3D', armrestAdjustment: '4D',
    backHeight: 58, seatHeight: 44, recliningAngle: 115,
  },
]
```

Also update the `'renders parameter label column'` test assertions to include new labels:

```typescript
it('renders parameter label column', () => {
  render(...)
  expect(screen.getByText('价格')).toBeInTheDocument()
  expect(screen.getByText('材质')).toBeInTheDocument()
  expect(screen.getByText('颜色')).toBeInTheDocument()
  expect(screen.getByText('靠背高度')).toBeInTheDocument()
  expect(screen.getByText('座高')).toBeInTheDocument()
  expect(screen.getByText('后仰角度')).toBeInTheDocument()
  expect(screen.getByText('扶手')).toBeInTheDocument()
  expect(screen.getByText('头枕')).toBeInTheDocument()
  expect(screen.getByText('腰靠')).toBeInTheDocument()
  expect(screen.getByText('腰靠可调节')).toBeInTheDocument()
})
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run 2>&1 | tail -20
```

Expected: All pass

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1
```

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/compare/CompareTable.tsx src/components/compare/__tests__/CompareTable.test.tsx
git commit -m "feat(compare): update PARAMS to include new chair parameters"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -15
```

Expected: All tests pass

- [ ] **Step 2: Check TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Smoke test in browser** — start dev server and verify:
  -筛选页左侧面板显示新的9个筛选字段，标签全部为中文
  - 扶手（7个方块）、头枕（4个方块）点击可多选，选中高亮
  - 靠背高度、座高、后仰角度滑条可拖拽，数值同步更新
  - 对比页参数表显示10行，新增4行（靠背高度/座高/后仰角度/扶手），头枕显示D等级或"无"

```bash
npm run dev
```
