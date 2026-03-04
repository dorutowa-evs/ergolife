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
  }, [safePage, page, setPage])

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
          <div className="flex items-center justify-between mb-6 bg-white border border-gray-100 rounded-xl px-4 py-3">
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
