import { describe, it, expect } from 'vitest'
import { formatPrice, formatMaterialLabel, formatBool, formatValue, formatAdjustment, formatRange } from '@/lib/formatters'

describe('formatPrice', () => {
  it('formats integer prices with thousands separator', () => {
    expect(formatPrice(1999)).toBe('$1,999')
    expect(formatPrice(695)).toBe('$695')
    expect(formatPrice(10000)).toBe('$10,000')
  })
})

describe('formatMaterialLabel', () => {
  const materials = [
    { id: 'mesh', label: 'Mesh (网布)' },
    { id: 'leather', label: 'Leather (皮革)' },
    { id: 'fabric', label: 'Fabric (布艺)' },
  ]
  it('extracts Chinese text from parentheses', () => {
    expect(formatMaterialLabel('mesh', materials)).toBe('网布')
    expect(formatMaterialLabel('leather', materials)).toBe('皮革')
  })
  it('falls back to id when not found', () => {
    expect(formatMaterialLabel('unknown', materials)).toBe('unknown')
  })
})

describe('formatBool', () => {
  it('returns icon + text for true', () => {
    expect(formatBool(true)).toBe('✓ 有')
  })
  it('returns icon + text for false', () => {
    expect(formatBool(false)).toBe('✗ 无')
  })
  it('returns -- for undefined', () => {
    expect(formatBool(undefined)).toBe('--')
  })
  it('returns -- for null', () => {
    expect(formatBool(null)).toBe('--')
  })
})

describe('formatValue', () => {
  it('returns the value when present', () => {
    expect(formatValue('网布')).toBe('网布')
  })
  it('returns -- for undefined', () => {
    expect(formatValue(undefined)).toBe('--')
  })
  it('returns -- for empty string', () => {
    expect(formatValue('')).toBe('--')
  })
})

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
