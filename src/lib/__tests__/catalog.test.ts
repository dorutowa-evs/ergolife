import { getPriceBounds, getMaterials, getColors, getChairs, getConfig, getChairById } from '../catalog'

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

describe('getChairById', () => {
  it('returns chair when id exists', () => {
    const chair = getChairById('c001')
    expect(chair).toBeDefined()
    expect(chair?.id).toBe('c001')
  })

  it('returns undefined when id does not exist', () => {
    const chair = getChairById('does-not-exist')
    expect(chair).toBeUndefined()
  })
})
