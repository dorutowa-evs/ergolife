import type { Material } from '@/types/catalog'

export function formatPrice(price: number): string {
  return '$' + price.toLocaleString('en-US')
}

export function formatMaterialLabel(id: string, materials: Material[]): string {
  const mat = materials.find((m) => m.id === id)
  if (!mat) return id
  const match = mat.label.match(/\((.+)\)/)
  return match ? match[1] : mat.label
}

export function formatBool(value: boolean | undefined | null): string {
  if (value === undefined || value === null) return '--'
  return value ? '✓ 有' : '✗ 无'
}

export function formatValue(value: string | undefined | null): string {
  return value ? value : '--'
}

export function formatAdjustment(value: string | null): string {
  return value ?? '无'
}

export function formatRange(min: number, max: number, unit: string): string {
  const sep = unit === '°' ? '' : ' '
  return `${min}–${max}${sep}${unit}`
}
