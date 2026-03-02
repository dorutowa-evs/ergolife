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
