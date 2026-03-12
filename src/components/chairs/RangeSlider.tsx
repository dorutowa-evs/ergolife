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
        onValueChange={(vals) => { if (vals.length >= 2) onChange([vals[0], vals[1]]) }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{fmt(value[0], unit)}</span>
        <span>{fmt(value[1], unit)}</span>
      </div>
    </div>
  )
}
