# 筛选页实现计划（`/chairs`）

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建 `/chairs` 筛选浏览页，完整实现实时筛选、分页、对比 FAB，所有状态持久化到 `localStorage`。

**Architecture:** Next.js 15 App Router + TypeScript。筛选逻辑抽离为纯函数便于测试。状态分三层：FilterContext（筛选条件）、CompareContext（对比列表）、页面级 useLocalStorage（排序、分页）。数据全部来自 `src/data/chairs.catalog.json`，价格边界与筛选选项在运行时从数据派生，不硬编码。

**Tech Stack:** Next.js 15 · TypeScript · Tailwind CSS v4 · shadcn/ui · Vitest · @testing-library/react
**Visual Reference:** `docs/assets/prototype-visual-reference.md`

**PRD:** `docs/plans/2026-02-25-chairs-filter-page-prd.md`
**Catalog:** `src/data/chairs.catalog.json`（已存在，后续由用户补充椅子数据）

---

## Task 1: 项目初始化

**Files:**
- Create: Next.js 项目骨架（`package.json`、`src/`、`tailwind.config.ts` 等）
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: 前置检查**

```bash
ls /home/twaddwa/Documents/github/dorutowa/furniture-comparison-website/src/data/chairs.catalog.json
```

确认 `chairs.catalog.json` 存在。然后检查椅子数量：

```bash
node -e "const d=require('./src/data/chairs.catalog.json'); console.log('chairs:', d.chairs.length)"
```

Expected: **20 条以上**。如果不足，先让用户补充椅子数据再继续。分页、大列表验收依赖足够的数据量。

**Step 2: 初始化 git 仓库**

当前目录不是 git 仓库，必须先初始化，否则后续所有 commit 步骤都会失败：

```bash
cd /home/twaddwa/Documents/github/dorutowa/furniture-comparison-website
git init
git add docs/ src/
git commit -m "chore: initial commit — add docs and catalog data"
```

Expected: `git status` 显示 clean working tree。

**Step 3: 在项目根目录初始化 Next.js**

当前目录已存在 `docs/` 和 `src/data/`，使用 `--yes` 跳过非空目录确认提示：

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack \
  --yes
```

完成后验证 `src/data/chairs.catalog.json` 仍然存在（create-next-app 不会删除已有文件）：

```bash
cat src/data/chairs.catalog.json | head -5
```

**Step 4: 安装额外依赖**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 4b: 初始化 shadcn/ui**

shadcn/ui 基于 Radix UI + Tailwind CSS v4，与 Next.js 15 开箱兼容：

```bash
NPM_CONFIG_CACHE=/tmp/claude-1000/npm-cache npx --cache /tmp/claude-1000/npm-cache shadcn@latest init --defaults -y
```

Expected: 生成 `components.json`，在 `src/app/globals.css` 写入 CSS 变量。

**Step 4c: 安装所需 shadcn 组件**

```bash
NPM_CONFIG_CACHE=/tmp/claude-1000/npm-cache npx --cache /tmp/claude-1000/npm-cache shadcn@latest add slider checkbox sonner button badge -y
```

Expected: 生成 `src/components/ui/slider.tsx`、`checkbox.tsx`、`sonner.tsx`、`button.tsx`、`badge.tsx`。

**Step 5: 创建 `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

**Step 6: 创建 `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

**Step 7: 在 `package.json` scripts 中补充**

```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 8: 配置 `next.config.ts` 允许远程图片域名**

`next/image` 加载远程图片需要显式声明域名。当前 `imageUrl` 为空时卡片走 `placehold.co` fallback，必须提前配置否则运行时报错：

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
}

export default nextConfig
```

**Step 9: 验证**

```bash
npm run dev
```

Expected: `http://localhost:3000` 可访问，显示 Next.js 默认页。

**Step 10: 提交**

```bash
git add -A
git commit -m "chore: init Next.js 15 project with TypeScript, Tailwind, Vitest, image config"
```

---

## Task 2: TypeScript 类型定义

**Files:**
- Create: `src/types/catalog.ts`

**Step 1: 创建类型文件**

```ts
// src/types/catalog.ts

/** chairs.catalog.json 顶层结构 */
export interface Catalog {
  config: CatalogConfig
  materials: Material[]
  colors: Color[]
  chairs: Chair[]
}

export interface CatalogConfig {
  minColumnWidth: number
  itemsPerPage: number
  priceMin: number
  priceMax: number
}

export interface Material {
  id: string
  label: string
}

export interface Color {
  id: string
  name: string
  rgb: string
}

export interface Chair {
  id: string
  name: string
  price: number
  imageUrl: string
  material: string        // 对应 Material.id
  color: string           // 对应 Color.id
  hasHeadrest: boolean
  hasLumbar: boolean
  isLumbarAdjustable: boolean
  description: string
  badge?: 'TOP_PICK' | 'SALE'   // 可选：卡片图片角标
  originalPrice?: number         // 可选：SALE 时的原价（用于删除线显示）
}

/** 筛选条件状态 */
export type TriState = 'all' | 'yes' | 'no'
export type SortOrder = 'default' | 'price_asc' | 'price_desc'

export interface FilterState {
  priceMin: number
  priceMax: number
  materials: string[]     // Material.id 列表
  colors: string[]        // Color.id 列表
  headrest: TriState
  lumbar: TriState
  lumbarAdjustable: TriState
}

export function makeDefaultFilter(priceMin: number, priceMax: number): FilterState {
  return {
    priceMin,
    priceMax,
    materials: [],
    colors: [],
    headrest: 'all',
    lumbar: 'all',
    lumbarAdjustable: 'all',
  }
}
```

**Step 2: 提交**

```bash
git add src/types/catalog.ts
git commit -m "feat: add TypeScript types for catalog, chair, filter"
```

---

## Task 3: Catalog 数据层

**Files:**
- Create: `src/lib/catalog.ts`
- Create: `src/lib/__tests__/catalog.test.ts`

**Step 1: 写失败测试**

```ts
// src/lib/__tests__/catalog.test.ts
import { getPriceBounds, getMaterials, getColors, getChairs, getConfig } from '../catalog'

describe('catalog', () => {
  it('returns config', () => {
    const config = getConfig()
    expect(config.itemsPerPage).toBeGreaterThan(0)
    expect(config.minColumnWidth).toBeGreaterThan(0)
  })

  it('returns materials array', () => {
    const materials = getMaterials()
    expect(materials.length).toBeGreaterThan(0)
    expect(materials[0]).toHaveProperty('id')
    expect(materials[0]).toHaveProperty('label')
  })

  it('returns colors array', () => {
    const colors = getColors()
    expect(colors.length).toBeGreaterThan(0)
    expect(colors[0]).toHaveProperty('rgb')
  })

  it('returns chairs array', () => {
    const chairs = getChairs()
    expect(chairs.length).toBeGreaterThan(0)
  })

  it('returns price bounds from config', () => {
    const { min, max } = getPriceBounds()
    const config = getConfig()
    expect(min).toBe(config.priceMin)
    expect(max).toBe(config.priceMax)
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/lib/__tests__/catalog.test.ts
```

Expected: FAIL（catalog 模块未定义）

**Step 3: 实现 catalog.ts**

```ts
// src/lib/catalog.ts
import catalogData from '@/data/chairs.catalog.json'
import type { Catalog, Chair, Material, Color, CatalogConfig } from '@/types/catalog'

const catalog = catalogData as Catalog

export function getConfig(): CatalogConfig {
  return catalog.config
}

export function getMaterials(): Material[] {
  return catalog.materials
}

export function getColors(): Color[] {
  return catalog.colors
}

export function getChairs(): Chair[] {
  return catalog.chairs
}

export function getPriceBounds(): { min: number; max: number } {
  return {
    min: catalog.config.priceMin,
    max: catalog.config.priceMax,
  }
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/lib/__tests__/catalog.test.ts
```

Expected: 5 tests PASS

**Step 5: 提交**

```bash
git add src/lib/catalog.ts src/lib/__tests__/catalog.test.ts
git commit -m "feat: add catalog data layer with price bounds derivation"
```

---

## Task 4: useLocalStorage Hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Create: `src/hooks/__tests__/useLocalStorage.test.ts`

**Step 1: 写失败测试**

```ts
// src/hooks/__tests__/useLocalStorage.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns initial value before mount effect runs', () => {
    const { result } = renderHook(() => useLocalStorage('key', 42))
    // SSR 和首次渲染均返回 initialValue，不读 localStorage
    expect(result.current[0]).toBe(42)
  })

  it('reads existing localStorage value after mount', async () => {
    localStorage.setItem('key', '"hello"')
    const { result } = renderHook(() => useLocalStorage('key', ''))
    // useEffect 跑完后更新为 localStorage 中的值
    await waitFor(() => expect(result.current[0]).toBe('hello'))
  })

  it('persists value to localStorage on set', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0))
    act(() => result.current[1](99))
    expect(localStorage.getItem('key')).toBe('99')
    expect(result.current[0]).toBe(99)
  })

  it('falls back to initial value on invalid JSON', async () => {
    localStorage.setItem('key', 'INVALID_JSON')
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    // 解析失败，仍保持 initialValue
    await waitFor(() => expect(result.current[0]).toBe('default'))
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/hooks/__tests__/useLocalStorage.test.ts
```

**Step 3: 实现**

SSR 阶段和首次客户端渲染均使用 `initialValue`，挂载后通过 `useEffect` 读取 localStorage 并更新，避免 Next.js Hydration Mismatch。

```ts
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 首次渲染（含 SSR）始终返回 initialValue，保证服务端与客户端一致
  const [stored, setStored] = useState<T>(initialValue)

  // 挂载后读取 localStorage，与服务端渲染结果无关，不触发 Hydration Mismatch
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item !== null) setStored(JSON.parse(item) as T)
    } catch {
      // 解析失败保持 initialValue
    }
  }, [key])

  const setValue = (value: T) => {
    setStored(value)
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略写入失败（隐私模式等）
    }
  }

  return [stored, setValue] as const
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/hooks/__tests__/useLocalStorage.test.ts
```

Expected: 4 tests PASS

**Step 5: 提交**

```bash
git add src/hooks/useLocalStorage.ts src/hooks/__tests__/useLocalStorage.test.ts
git commit -m "feat: add useLocalStorage hook with error fallback"
```

---

## Task 5: CompareContext

**Files:**
- Create: `src/contexts/CompareContext.tsx`
- Create: `src/contexts/__tests__/CompareContext.test.tsx`

**Step 1: 写失败测试**

```tsx
// src/contexts/__tests__/CompareContext.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareProvider, useCompare } from '../CompareContext'

function Widget() {
  const { compareList, addToCompare, removeFromCompare, isInCompare, isFull } = useCompare()
  return (
    <div>
      <span data-testid="count">{compareList.length}</span>
      <span data-testid="full">{String(isFull)}</span>
      <span data-testid="in">{String(isInCompare('a'))}</span>
      <button onClick={() => addToCompare('a')}>add-a</button>
      <button onClick={() => removeFromCompare('a')}>remove-a</button>
    </div>
  )
}

const wrap = (ui: React.ReactElement) =>
  render(<CompareProvider>{ui}</CompareProvider>)

describe('CompareContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty', () => {
    wrap(<Widget />)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds an item', async () => {
    wrap(<Widget />)
    await userEvent.click(screen.getByText('add-a'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('in').textContent).toBe('true')
  })

  it('ignores duplicate adds', async () => {
    wrap(<Widget />)
    await userEvent.click(screen.getByText('add-a'))
    await userEvent.click(screen.getByText('add-a'))
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('removes an item', async () => {
    wrap(<Widget />)
    await userEvent.click(screen.getByText('add-a'))
    await userEvent.click(screen.getByText('remove-a'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('reports isFull when list has 5 items', () => {
    localStorage.setItem('compare-list', JSON.stringify(['a', 'b', 'c', 'd', 'e']))
    wrap(<Widget />)
    expect(screen.getByTestId('full').textContent).toBe('true')
    expect(screen.getByTestId('count').textContent).toBe('5')
  })

  it('does not add beyond 5 items', async () => {
    localStorage.setItem('compare-list', JSON.stringify(['b', 'c', 'd', 'e', 'f']))
    wrap(<Widget />)
    await userEvent.click(screen.getByText('add-a'))
    expect(screen.getByTestId('count').textContent).toBe('5')
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/contexts/__tests__/CompareContext.test.tsx
```

**Step 3: 实现 CompareContext**

```tsx
// src/contexts/CompareContext.tsx
'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const MAX_COMPARE = 5

interface CompareContextValue {
  compareList: string[]
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  isInCompare: (id: string) => boolean
  isFull: boolean
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useLocalStorage<string[]>('compare-list', [])

  const addToCompare = (id: string) => {
    if (compareList.includes(id)) return
    if (compareList.length >= MAX_COMPARE) return
    setCompareList([...compareList, id])
  }

  const removeFromCompare = (id: string) =>
    setCompareList(compareList.filter((i) => i !== id))

  const isInCompare = (id: string) => compareList.includes(id)
  const isFull = compareList.length >= MAX_COMPARE

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, isFull }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/contexts/__tests__/CompareContext.test.tsx
```

Expected: 6 tests PASS

**Step 5: 提交**

```bash
git add src/contexts/CompareContext.tsx src/contexts/__tests__/CompareContext.test.tsx
git commit -m "feat: add CompareContext with 5-item limit and localStorage"
```

---

## Task 6: FilterContext

**Files:**
- Create: `src/contexts/FilterContext.tsx`
- Create: `src/contexts/__tests__/FilterContext.test.tsx`

**Step 1: 写失败测试**

```tsx
// src/contexts/__tests__/FilterContext.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterProvider, useFilter } from '../FilterContext'

function Widget() {
  const { filter, setFilter, resetFilter } = useFilter()
  return (
    <div>
      <span data-testid="mat">{filter.materials.join(',')}</span>
      <span data-testid="headrest">{filter.headrest}</span>
      <button onClick={() => setFilter({ ...filter, materials: ['mesh'] })}>set-mat</button>
      <button onClick={resetFilter}>reset</button>
    </div>
  )
}

describe('FilterContext', () => {
  beforeEach(() => localStorage.clear())

  it('initializes with empty materials', () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    expect(screen.getByTestId('mat').textContent).toBe('')
  })

  it('updates filter', async () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    await userEvent.click(screen.getByText('set-mat'))
    expect(screen.getByTestId('mat').textContent).toBe('mesh')
  })

  it('resets filter', async () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    await userEvent.click(screen.getByText('set-mat'))
    await userEvent.click(screen.getByText('reset'))
    expect(screen.getByTestId('mat').textContent).toBe('')
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/contexts/__tests__/FilterContext.test.tsx
```

**Step 3: 实现 FilterContext**

注意：FilterContext 初始化时需要从 catalog 派生价格边界，但 `getPriceBounds()` 是同步的（读静态 JSON），可以直接调用。

```tsx
// src/contexts/FilterContext.tsx
'use client'
import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { FilterState, makeDefaultFilter } from '@/types/catalog'
import { getPriceBounds } from '@/lib/catalog'

interface FilterContextValue {
  filter: FilterState
  setFilter: (f: FilterState) => void
  resetFilter: () => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const { min, max } = getPriceBounds()
  const defaultFilter = makeDefaultFilter(min, max)
  const [filter, setFilterRaw] = useLocalStorage<FilterState>('chair-filter', defaultFilter)

  const setFilter = (f: FilterState) => setFilterRaw(f)
  const resetFilter = () => setFilterRaw(defaultFilter)

  return (
    <FilterContext.Provider value={{ filter, setFilter, resetFilter }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilter must be used within FilterProvider')
  return ctx
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/contexts/__tests__/FilterContext.test.tsx
```

Expected: 3 tests PASS

**Step 5: 提交**

```bash
git add src/contexts/FilterContext.tsx src/contexts/__tests__/FilterContext.test.tsx
git commit -m "feat: add FilterContext with catalog-derived price defaults"
```

---

## Task 7: filterChairs 纯函数

**Files:**
- Create: `src/lib/filterChairs.ts`
- Create: `src/lib/__tests__/filterChairs.test.ts`

**Step 1: 写失败测试**

```ts
// src/lib/__tests__/filterChairs.test.ts
import { filterChairs } from '../filterChairs'
import { Chair, FilterState, makeDefaultFilter } from '@/types/catalog'

const chairs: Chair[] = [
  { id: '1', name: 'A', price: 500,  imageUrl: '', material: 'mesh',    color: 'black', hasHeadrest: true,  hasLumbar: true,  isLumbarAdjustable: true,  description: '' },
  { id: '2', name: 'B', price: 1500, imageUrl: '', material: 'leather', color: 'white', hasHeadrest: false, hasLumbar: false, isLumbarAdjustable: false, description: '' },
  { id: '3', name: 'C', price: 3000, imageUrl: '', material: 'mesh',    color: 'gray',  hasHeadrest: true,  hasLumbar: false, isLumbarAdjustable: false, description: '' },
  { id: '4', name: 'D', price: 500,  imageUrl: '', material: 'fabric',  color: 'blue',  hasHeadrest: false, hasLumbar: true,  isLumbarAdjustable: false, description: '' },
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

  it('filters by material (OR within field)', () => {
    const result = filterChairs(chairs, f({ materials: ['mesh', 'fabric'] }))
    expect(result.map(c => c.id)).toEqual(['1', '3', '4'])
  })

  it('filters by color (OR within field)', () => {
    expect(filterChairs(chairs, f({ colors: ['black', 'gray'] })).map(c => c.id)).toEqual(['1', '3'])
  })

  it('combines material AND color (AND between fields)', () => {
    expect(filterChairs(chairs, f({ materials: ['mesh'], colors: ['gray'] })).map(c => c.id)).toEqual(['3'])
  })

  it('filters headrest: yes', () => {
    expect(filterChairs(chairs, f({ headrest: 'yes' })).map(c => c.id)).toEqual(['1', '3'])
  })

  it('filters headrest: no', () => {
    expect(filterChairs(chairs, f({ headrest: 'no' })).map(c => c.id)).toEqual(['2', '4'])
  })

  it('filters lumbar: yes', () => {
    expect(filterChairs(chairs, f({ lumbar: 'yes' })).map(c => c.id)).toEqual(['1', '4'])
  })

  it('filters lumbarAdjustable: yes', () => {
    expect(filterChairs(chairs, f({ lumbarAdjustable: 'yes' })).map(c => c.id)).toEqual(['1'])
  })

  it('sorts by price ascending, stable on equal prices', () => {
    const result = filterChairs(chairs, f({}), 'price_asc')
    expect(result.map(c => c.id)).toEqual(['1', '4', '2', '3'])
  })

  it('sorts by price descending', () => {
    const result = filterChairs(chairs, f({}), 'price_desc')
    expect(result.map(c => c.id)).toEqual(['3', '2', '1', '4'])
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/lib/__tests__/filterChairs.test.ts
```

**Step 3: 实现**

```ts
// src/lib/filterChairs.ts
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
    if (filter.headrest === 'yes' && !c.hasHeadrest) return false
    if (filter.headrest === 'no' && c.hasHeadrest) return false
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

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/lib/__tests__/filterChairs.test.ts
```

Expected: 11 tests PASS

**Step 5: 提交**

```bash
git add src/lib/filterChairs.ts src/lib/__tests__/filterChairs.test.ts
git commit -m "feat: add filterChairs with OR-within / AND-between logic and stable sort"
```

---

## Task 8: paginate 纯函数

**Files:**
- Create: `src/lib/paginate.ts`
- Create: `src/lib/__tests__/paginate.test.ts`

**Step 1: 写失败测试**

```ts
// src/lib/__tests__/paginate.test.ts
import { paginate, getPageNumbers } from '../paginate'

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)

  it('returns correct slice for page 1', () => {
    expect(paginate(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('returns correct slice for page 3', () => {
    expect(paginate(items, 3, 10)).toEqual([21, 22, 23, 24, 25])
  })

  it('returns empty for out-of-bounds page', () => {
    expect(paginate(items, 5, 10)).toEqual([])
  })
})

describe('getPageNumbers', () => {
  it('returns all pages when total <= 5', () => {
    expect(getPageNumbers(3, 4)).toEqual([1, 2, 3, 4])
  })

  it('shows ellipsis at end when current page is near start', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, '...', 10])
  })

  it('shows ellipsis at both ends when current page is in middle', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  it('shows ellipsis at start when current page is near end', () => {
    expect(getPageNumbers(9, 10)).toEqual([1, '...', 8, 9, 10])
  })

  it('clamps page to valid range', () => {
    expect(getPageNumbers(1, 10)[0]).toBe(1)
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/lib/__tests__/paginate.test.ts
```

**Step 3: 实现**

```ts
// src/lib/paginate.ts

export function paginate<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

export function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []

  if (current <= 3) {
    pages.push(1, 2, 3, '...', total)
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }

  return pages
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/lib/__tests__/paginate.test.ts
```

Expected: 8 tests PASS

**Step 5: 提交**

```bash
git add src/lib/paginate.ts src/lib/__tests__/paginate.test.ts
git commit -m "feat: add paginate helpers with ellipsis page numbers"
```

---

## Task 9: Toast 系统（Sonner）

**Files:**
- Create: `src/hooks/useToast.ts`（封装 sonner 的 `toast()` 调用，供其他组件使用）

> **注意：** 使用 shadcn 集成的 [Sonner](https://sonner.emilkowal.ski/)，已在 Step 4c 安装。
> 不需要自定义 ToastContext；`<Toaster />` 直接放在 `layout.tsx` 中。

**Step 1: 创建 useToast hook（封装 sonner API）**

```ts
// src/hooks/useToast.ts
import { toast } from 'sonner'

export function useToast() {
  const showToast = (message: string) => toast(message)
  return { showToast }
}
```

**Step 2: 提交**

```bash
git add src/hooks/useToast.ts
git commit -m "feat: add useToast hook wrapping sonner"
```

> `<Toaster />` 组件在 Task 16 的 `layout.tsx` 中统一添加。

---

## Task 10: PriceRangeSlider 组件

**Files:**
- Create: `src/components/chairs/PriceRangeSlider.tsx`
- Create: `src/components/chairs/__tests__/PriceRangeSlider.test.tsx`

**Step 1: 写失败测试**

```tsx
// src/components/chairs/__tests__/PriceRangeSlider.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceRangeSlider } from '../PriceRangeSlider'

const defaultProps = {
  min: 0, max: 2000,
  value: [200, 1500] as [number, number],
  onChange: vi.fn(),
}

describe('PriceRangeSlider', () => {
  it('renders min and max input values', () => {
    render(<PriceRangeSlider {...defaultProps} />)
    expect(screen.getByDisplayValue('200')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument()
  })

  it('shows error when min > max after blur', async () => {
    const onChange = vi.fn()
    render(<PriceRangeSlider {...defaultProps} onChange={onChange} />)
    const minInput = screen.getByDisplayValue('200')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '2000')
    await userEvent.tab() // trigger blur
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalledWith(expect.arrayContaining([2000]))
  })

  it('calls onChange on valid blur', async () => {
    const onChange = vi.fn()
    render(<PriceRangeSlider {...defaultProps} onChange={onChange} />)
    const minInput = screen.getByDisplayValue('200')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '300')
    await userEvent.tab()
    expect(onChange).toHaveBeenCalledWith([300, 1500])
  })

  it('clamps value below absolute min to absolute min', async () => {
    const onChange = vi.fn()
    render(<PriceRangeSlider {...defaultProps} onChange={onChange} />)
    const minInput = screen.getByDisplayValue('200')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '-100')
    await userEvent.tab()
    expect(onChange).toHaveBeenCalledWith([0, 1500])
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/components/chairs/__tests__/PriceRangeSlider.test.tsx
```

**Step 3: 实现**

```tsx
// src/components/chairs/PriceRangeSlider.tsx
'use client'
import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'

interface Props {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceRangeSlider({ min, max, value, onChange }: Props) {
  const [localMin, setLocalMin] = useState(String(value[0]))
  const [localMax, setLocalMax] = useState(String(value[1]))
  const [error, setError] = useState<string | null>(null)

  // Sync external value changes (e.g. reset) into local input state
  useEffect(() => {
    setLocalMin(String(value[0]))
    setLocalMax(String(value[1]))
    setError(null)
  }, [value[0], value[1]])

  const commit = (rawMin: string, rawMax: string) => {
    const parsedMin = Math.max(min, Number(rawMin) || min)
    const parsedMax = Math.min(max, Number(rawMax) || max)
    if (parsedMin > parsedMax) {
      setError('最低价不能高于最高价')
      return
    }
    setError(null)
    onChange([parsedMin, parsedMax])
  }

  return (
    <div>
      <Slider
        className="mb-3"
        min={min} max={max} step={10}
        value={[value[0], value[1]]}
        onValueChange={([a, b]) => onChange([a, b])}
      />

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={() => commit(localMin, localMax)}
            onKeyDown={(e) => e.key === 'Enter' && commit(localMin, localMax)}
            className={`w-full border rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900 ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
            aria-label="最低价格"
          />
        </div>
        <span className="text-gray-400 text-sm shrink-0">—</span>
        <div className="flex-1">
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={() => commit(localMin, localMax)}
            onKeyDown={(e) => e.key === 'Enter' && commit(localMin, localMax)}
            className={`w-full border rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900 ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
            aria-label="最高价格"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/components/chairs/__tests__/PriceRangeSlider.test.tsx
```

Expected: 4 tests PASS

**Step 5: 提交**

```bash
git add src/components/chairs/PriceRangeSlider.tsx src/components/chairs/__tests__/PriceRangeSlider.test.tsx
git commit -m "feat: add PriceRangeSlider with input/slider bidirectional sync and validation"
```

---

## Task 11: FilterPanel 组件

**Files:**
- Create: `src/components/chairs/FilterPanel.tsx`

**Step 1: 实现**

```tsx
// src/components/chairs/FilterPanel.tsx
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
```

**Step 2: 提交**

```bash
git add src/components/chairs/FilterPanel.tsx
git commit -m "feat: add FilterPanel with price slider, material, color, tri-state filters"
```

---

## Task 12: ChairCard 组件

**Files:**
- Create: `src/components/chairs/ChairCard.tsx`
- Create: `src/components/chairs/__tests__/ChairCard.test.tsx`

**Step 1: 写失败测试**

```tsx
// src/components/chairs/__tests__/ChairCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChairCard } from '../ChairCard'
import type { Chair } from '@/types/catalog'

const chair: Chair = {
  id: 'c001', name: 'Test Chair', price: 399, imageUrl: '',
  material: 'mesh', color: 'black', hasHeadrest: true,
  hasLumbar: true, isLumbarAdjustable: true, description: '',
}

describe('ChairCard', () => {
  it('renders name and price', () => {
    render(<ChairCard chair={chair} isInCompare={false} onAdd={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText('Test Chair')).toBeInTheDocument()
    expect(screen.getByText('$399.00')).toBeInTheDocument()
  })

  it('shows add button on image hover when not in compare', async () => {
    render(<ChairCard chair={chair} isInCompare={false} onAdd={vi.fn()} onRemove={vi.fn()} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    expect(screen.getByText('+ 加入对比')).toBeInTheDocument()
  })

  it('shows remove button on image hover when in compare', async () => {
    render(<ChairCard chair={chair} isInCompare={true} onAdd={vi.fn()} onRemove={vi.fn()} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    expect(screen.getByText('✓ 移出对比')).toBeInTheDocument()
  })

  it('calls onAdd with chair id when add clicked', async () => {
    const onAdd = vi.fn()
    render(<ChairCard chair={chair} isInCompare={false} onAdd={onAdd} onRemove={vi.fn()} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    await userEvent.click(screen.getByText('+ 加入对比'))
    expect(onAdd).toHaveBeenCalledWith('c001')
  })

  it('calls onRemove with chair id when remove clicked', async () => {
    const onRemove = vi.fn()
    render(<ChairCard chair={chair} isInCompare={true} onAdd={vi.fn()} onRemove={onRemove} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    await userEvent.click(screen.getByText('✓ 移出对比'))
    expect(onRemove).toHaveBeenCalledWith('c001')
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/components/chairs/__tests__/ChairCard.test.tsx
```

**Step 3: 实现**

```tsx
// src/components/chairs/ChairCard.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Chair } from '@/types/catalog'

interface Props {
  chair: Chair
  isInCompare: boolean
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

const BADGE_LABEL: Record<string, string> = {
  TOP_PICK: 'TOP PICK',
  SALE: 'SALE',
}

export function ChairCard({ chair, isInCompare, onAdd, onRemove }: Props) {
  const [hovered, setHovered] = useState(false)
  const placeholder = `https://placehold.co/400x300/f1f5f9/94a3b8?text=${encodeURIComponent(chair.name)}`

  return (
    <div className={`rounded-xl overflow-hidden border transition-all bg-white hover:shadow-md ${
      isInCompare ? 'border-gray-900 border-2' : 'border-gray-100 hover:border-gray-200'
    }`}>
      {/* 图片区域 */}
      <div
        data-testid="card-image-area"
        className="relative aspect-[4/3] bg-gray-50 overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/chairs/${chair.id}`} tabIndex={-1}>
          <Image
            src={chair.imageUrl || placeholder}
            alt={chair.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Badge（TOP PICK / SALE） */}
        {chair.badge && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gray-900 text-white text-xs px-2 py-0.5 rounded-sm">
              {BADGE_LABEL[chair.badge] ?? chair.badge}
            </Badge>
          </div>
        )}

        {/* Hover 遮罩 */}
        {hovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {isInCompare ? (
              <button
                onClick={(e) => { e.preventDefault(); onRemove(chair.id) }}
                className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                ✓ 移出对比
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); onAdd(chair.id) }}
                className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
              >
                + 加入对比
              </button>
            )}
          </div>
        )}
      </div>

      {/* 卡片内容区 */}
      <div className="p-4">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1">
          {chair.name}
        </p>

        {/* 已加入对比常驻指示 */}
        {isInCompare && (
          <p className="text-xs text-gray-500 mb-2">✓ 已加入对比</p>
        )}

        {/* 价格区域 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-gray-900">
              ${chair.price.toFixed(2)}
            </span>
            {chair.badge === 'SALE' && chair.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${chair.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Link
            href={`/chairs/${chair.id}`}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/components/chairs/__tests__/ChairCard.test.tsx
```

Expected: 5 tests PASS

**Step 5: 提交**

```bash
git add src/components/chairs/ChairCard.tsx src/components/chairs/__tests__/ChairCard.test.tsx
git commit -m "feat: add ChairCard with hover compare interaction"
```

---

## Task 13: Pagination 组件

**Files:**
- Create: `src/components/ui/Pagination.tsx`
- Create: `src/components/ui/__tests__/Pagination.test.tsx`

**Step 1: 写失败测试**

```tsx
// src/components/ui/__tests__/Pagination.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('does not render when total pages is 1', () => {
    const { container } = render(<Pagination current={1} total={1} onChange={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders page buttons', () => {
    render(<Pagination current={1} total={4} onChange={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('disables prev on first page', () => {
    render(<Pagination current={1} total={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('上一页')).toBeDisabled()
  })

  it('disables next on last page', () => {
    render(<Pagination current={5} total={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('下一页')).toBeDisabled()
  })

  it('calls onChange with correct page on button click', async () => {
    const onChange = vi.fn()
    render(<Pagination current={1} total={4} onChange={onChange} />)
    await userEvent.click(screen.getByText('3'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('calls onChange with next page on next click', async () => {
    const onChange = vi.fn()
    render(<Pagination current={2} total={5} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('下一页'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('renders ellipsis for large page counts', () => {
    render(<Pagination current={1} total={10} onChange={vi.fn()} />)
    expect(screen.getByText('...')).toBeInTheDocument()
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/components/ui/__tests__/Pagination.test.tsx
```

**Step 3: 实现**

```tsx
// src/components/ui/Pagination.tsx
import { getPageNumbers } from '@/lib/paginate'

interface Props {
  current: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ current, total, onChange }: Props) {
  if (total <= 1) return null

  const pages = getPageNumbers(current, total)

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      <button
        aria-label="上一页"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        ←
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
              p === current
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        aria-label="下一页"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        →
      </button>
    </nav>
  )
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/components/ui/__tests__/Pagination.test.tsx
```

Expected: 7 tests PASS

**Step 5: 提交**

```bash
git add src/components/ui/Pagination.tsx src/components/ui/__tests__/Pagination.test.tsx
git commit -m "feat: add Pagination component with ellipsis and disabled states"
```

---

## Task 14: CompareFAB 组件

**Files:**
- Create: `src/components/compare/CompareFAB.tsx`
- Create: `src/components/compare/__tests__/CompareFAB.test.tsx`

**Step 1: 写失败测试**

```tsx
// src/components/compare/__tests__/CompareFAB.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareFAB } from '../CompareFAB'
import type { Chair } from '@/types/catalog'

const chairs: Chair[] = [
  { id: 'c001', name: 'Chair Alpha', price: 399, imageUrl: '', material: 'mesh', color: 'black', hasHeadrest: true, hasLumbar: true, isLumbarAdjustable: true, description: '' },
  { id: 'c002', name: 'Chair Beta',  price: 599, imageUrl: '', material: 'leather', color: 'brown', hasHeadrest: true, hasLumbar: true, isLumbarAdjustable: false, description: '' },
]

describe('CompareFAB', () => {
  it('is hidden when compare list is empty', () => {
    const { container } = render(<CompareFAB compareIds={[]} chairs={chairs} onRemove={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows count badge', () => {
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows chair list on hover', async () => {
    render(<CompareFAB compareIds={['c001', 'c002']} chairs={chairs} onRemove={vi.fn()} />)
    await userEvent.hover(screen.getByRole('button', { name: /对比/i }))
    expect(screen.getByText('Chair Alpha')).toBeInTheDocument()
    expect(screen.getByText('Chair Beta')).toBeInTheDocument()
  })

  it('calls onRemove when × clicked in preview list', async () => {
    const onRemove = vi.fn()
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={onRemove} />)
    await userEvent.hover(screen.getByRole('button', { name: /对比/i }))
    await userEvent.click(screen.getByLabelText('移除 Chair Alpha'))
    expect(onRemove).toHaveBeenCalledWith('c001')
  })

  it('hides preview list when mouse leaves', async () => {
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={vi.fn()} />)
    const fab = screen.getByRole('button', { name: /对比/i })
    await userEvent.hover(fab)
    expect(screen.getByText('Chair Alpha')).toBeInTheDocument()
    await userEvent.unhover(fab)
    expect(screen.queryByText('Chair Alpha')).not.toBeInTheDocument()
  })
})
```

**Step 2: 运行测试，确认失败**

```bash
npm run test:run -- src/components/compare/__tests__/CompareFAB.test.tsx
```

**Step 3: 实现**

```tsx
// src/components/compare/CompareFAB.tsx
'use client'
import { useState } from 'react'
import type { Chair } from '@/types/catalog'

interface Props {
  compareIds: string[]
  chairs: Chair[]
  onRemove: (id: string) => void
}

export function CompareFAB({ compareIds, chairs, onRemove }: Props) {
  const [hovered, setHovered] = useState(false)

  if (compareIds.length === 0) return null

  const compareChairs = compareIds
    .map((id) => chairs.find((c) => c.id === id))
    .filter(Boolean) as Chair[]

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-60">
          <p className="text-xs text-gray-500 font-medium mb-2">对比列表</p>
          <ul className="space-y-2">
            {compareChairs.map((chair) => (
              <li key={chair.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-800 truncate">{chair.name}</span>
                <button
                  aria-label={`移除 ${chair.name}`}
                  onClick={() => onRemove(chair.id)}
                  className="text-gray-400 hover:text-gray-700 shrink-0 leading-none text-base"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        aria-label={`对比 (${compareIds.length})`}
        onClick={() => window.open('/compare', '_blank')}
        className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors font-medium text-sm"
      >
        <span>⚖</span>
        <span>对比</span>
        <span className="bg-white text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {compareIds.length}
        </span>
      </button>
    </div>
  )
}
```

**Step 4: 运行测试，确认通过**

```bash
npm run test:run -- src/components/compare/__tests__/CompareFAB.test.tsx
```

Expected: 5 tests PASS

**Step 5: 提交**

```bash
git add src/components/compare/CompareFAB.tsx src/components/compare/__tests__/CompareFAB.test.tsx
git commit -m "feat: add CompareFAB with hover preview and remove support"
```

---

## Task 15: Header 组件

**Files:**
- Create: `src/components/layout/Header.tsx`

**Step 1: 实现**

```tsx
// src/components/layout/Header.tsx
import Link from 'next/link'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/chairs" className="flex items-center gap-2 font-semibold text-gray-900">
            <span className="text-xl">🪑</span>
            <span>ErgoLife</span>
          </Link>
          {/* Nav placeholders */}
          <nav className="flex items-center gap-6">
            <span className="text-sm text-gray-600 cursor-default">Office Chairs</span>
            <span className="text-sm text-gray-400 cursor-default">Accessories</span>
          </nav>
        </div>

        {/* Right placeholders */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 cursor-default">Login</span>
          <span className="text-gray-400 cursor-default text-xl">🛒</span>
        </div>
      </div>
    </header>
  )
}
```

**Step 2: 提交**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: add Header placeholder (ErgoLife brand + nav items)"
```

---

## Task 16: `/chairs` 页面组装

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/chairs/page.tsx`
- Create: `src/app/compare/page.tsx`
- Modify: `src/app/page.tsx`

**Step 1: 更新 `layout.tsx`**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FilterProvider } from '@/contexts/FilterContext'
import { CompareProvider } from '@/contexts/CompareContext'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ErgoLife – Office Chairs',
  description: 'Find the perfect office chair',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CompareProvider>
          <FilterProvider>
            {children}
            <Toaster />
          </FilterProvider>
        </CompareProvider>
      </body>
    </html>
  )
}
```

**Step 2: 创建 `/chairs` 页面**

```tsx
// src/app/chairs/page.tsx
'use client'
import { useMemo, useEffect } from 'react'
import { useFilter } from '@/contexts/FilterContext'
import { useCompare } from '@/contexts/CompareContext'
import { useToast } from '@/hooks/useToast'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { FilterPanel } from '@/components/chairs/FilterPanel'
import { ChairCard } from '@/components/chairs/ChairCard'
import { CompareFAB } from '@/components/compare/CompareFAB'
import { Pagination } from '@/components/ui/Pagination'
import { Header } from '@/components/layout/Header'
import { filterChairs } from '@/lib/filterChairs'
import { paginate } from '@/lib/paginate'
import { getChairs, getConfig } from '@/lib/catalog'
import type { SortOrder } from '@/types/catalog'

const allChairs = getChairs()
const { itemsPerPage, minColumnWidth } = getConfig()

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'default',    label: '默认排序' },
  { value: 'price_asc',  label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
]

export default function ChairsPage() {
  const { filter } = useFilter()
  const { compareList, addToCompare, removeFromCompare, isInCompare, isFull } = useCompare()
  const { showToast } = useToast()
  const [sortOrder, setSortOrder] = useLocalStorage<SortOrder>('chair-sort', 'default')
  const [page, setPage] = useLocalStorage<number>('chair-page', 1)

  const filtered = useMemo(
    () => filterChairs(allChairs, filter, sortOrder),
    [filter, sortOrder]
  )

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const safePage = Math.min(page, Math.max(totalPages, 1))

  // 筛选/排序变化导致当前页越界时，回写 localStorage 使状态持久化
  useEffect(() => {
    if (safePage !== page) setPage(safePage)
  }, [safePage, page])

  const currentItems = paginate(filtered, safePage, itemsPerPage)

  const handleAddToCompare = (id: string) => {
    if (isFull) {
      showToast('最多对比 5 个商品')
      return
    }
    addToCompare(id)
  }

  const handleSortChange = (value: SortOrder) => {
    setSortOrder(value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* 左侧筛选面板 */}
        <div className="sticky top-20 self-start">
          <FilterPanel />
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 min-w-0">
          {/* 工具栏 */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">{filtered.length}</span>{' '}
              results
            </p>
            <select
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value as SortOrder)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 卡片网格 or 空状态 */}
          {currentItems.length > 0 ? (
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))` }}
            >
              {currentItems.map((chair) => (
                <ChairCard
                  key={chair.id}
                  chair={chair}
                  isInCompare={isInCompare(chair.id)}
                  onAdd={handleAddToCompare}
                  onRemove={removeFromCompare}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <span className="text-5xl mb-4">🪑</span>
              <p className="text-gray-700 font-medium mb-1">没有符合条件的商品</p>
              <p className="text-sm text-gray-400">试试调整筛选条件</p>
            </div>
          )}

          {/* 分页 */}
          <Pagination
            current={safePage}
            total={totalPages}
            onChange={handlePageChange}
          />
        </div>
      </div>

      <CompareFAB
        compareIds={compareList}
        chairs={allChairs}
        onRemove={removeFromCompare}
      />
    </div>
  )
}
```

**Step 3: 创建 `/chairs/[id]` 占位页（防止卡片点击 404）**

```tsx
// src/app/chairs/[id]/page.tsx
export default function ChairDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      详情页（待开发）— {params.id}
    </div>
  )
}
```

**Step 4: 创建 `/compare` 占位页**

```tsx
// src/app/compare/page.tsx
export default function ComparePage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      对比页（待开发）
    </div>
  )
}
```

**Step 5: 根路径跳转**

```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation'
export default function Home() {
  redirect('/chairs')
}
```

**Step 6: 跑全部测试**

```bash
npm run test:run
```

Expected: 所有测试 PASS

**Step 7: 验证页面**

```bash
npm run dev
```

访问 `http://localhost:3000/chairs`，按 PRD 验收标准逐项检查：

- [ ] 椅子卡片正确加载
- [ ] 筛选面板实时更新结果
- [ ] 价格滑条与输入框双向联动，min>max 显示红色提示
- [ ] 材质、颜色、三态筛选正常
- [ ] 重置全部 / 各字段单独清除正常
- [ ] 排序下拉生效，同价保持原顺序
- [ ] 卡片 hover 显示"加入对比"/"移出对比"
- [ ] 第 6 个商品加入时显示 Toast
- [ ] FAB 显示计数，hover 展开列表，可移除，点击新标签页打开对比页
- [ ] 分页正确（省略号、禁用状态、页码高亮）
- [ ] 筛选为空时显示空状态
- [ ] 刷新后筛选、排序、分页、对比列表全部恢复
- [ ] Header 显示品牌和导航占位项

**Step 8: 提交**

```bash
git add -A
git commit -m "feat: assemble /chairs page — filter, grid, pagination, FAB, header"
```

---

## 完成标准对照（对应 PRD 第 7 节）

| PRD 验收项 | 保障方式 |
|---|---|
| 筛选逻辑正确（OR/AND）| filterChairs 11 项单元测试 |
| 分页逻辑正确 | paginate 8 项单元测试 |
| 价格输入 min>max 校验 | PriceRangeSlider 4 项单元测试 |
| 对比上限 5 个 | CompareContext 单元测试 |
| localStorage 容错 | useLocalStorage 4 项单元测试 |
| 卡片 hover 交互 | ChairCard 5 项单元测试 |
| FAB 行为 | CompareFAB 5 项单元测试 |
| 分页省略号与禁用 | Pagination 7 项单元测试 |
| 其余交互与视觉 | 手动按验收 checklist 验证 |
