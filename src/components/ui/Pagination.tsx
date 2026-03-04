import { ChevronLeft, ChevronRight } from 'lucide-react'
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
        <ChevronLeft className="w-4 h-4" />
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
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}
