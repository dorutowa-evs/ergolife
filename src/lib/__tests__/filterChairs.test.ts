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
    expect(filterChairs(chairs, f({ recliningAngleMin: 135, recliningAngleMax: 160 })).map(c => c.id)).toEqual(['3'])
  })

  it('filters lumbar: yes', () => {
    expect(filterChairs(chairs, f({ lumbar: 'yes' })).map(c => c.id)).toEqual(['1', '2', '3'])
  })

  it('filters lumbarAdjustable: yes', () => {
    expect(filterChairs(chairs, f({ lumbarAdjustable: 'yes' })).map(c => c.id)).toEqual(['1', '2', '3'])
  })

  it('filters lumbar: no', () => {
    expect(filterChairs(chairs, f({ lumbar: 'no' })).map(c => c.id)).toEqual(['4'])
  })

  it('filters lumbarAdjustable: no', () => {
    expect(filterChairs(chairs, f({ lumbarAdjustable: 'no' })).map(c => c.id)).toEqual(['4'])
  })

  it('sorts by price ascending', () => {
    expect(filterChairs(chairs, f({}), 'price_asc').map(c => c.id)).toEqual(['1', '4', '2', '3'])
  })

  it('sorts by price descending', () => {
    expect(filterChairs(chairs, f({}), 'price_desc').map(c => c.id)).toEqual(['3', '2', '1', '4'])
  })
})
