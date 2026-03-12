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
