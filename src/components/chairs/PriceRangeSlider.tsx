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
  const v0 = value[0]
  const v1 = value[1]
  useEffect(() => {
    setLocalMin(String(v0))
    setLocalMax(String(v1))
    setError(null)
  }, [v0, v1])

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
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-2 flex items-center text-sm text-gray-400 pointer-events-none">$</span>
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={() => commit(localMin, localMax)}
            onKeyDown={(e) => e.key === 'Enter' && commit(localMin, localMax)}
            className={`w-full border rounded-md pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
            aria-label="最低价格"
          />
        </div>
        <span className="text-gray-400 text-sm shrink-0">—</span>
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-2 flex items-center text-sm text-gray-400 pointer-events-none">$</span>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={() => commit(localMin, localMax)}
            onKeyDown={(e) => e.key === 'Enter' && commit(localMin, localMax)}
            className={`w-full border rounded-md pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
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
