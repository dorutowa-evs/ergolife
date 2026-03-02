import { Chair, FilterState, SortOrder } from '@/types/catalog'

export function filterChairs(
  chairs: Chair[],
  filter: FilterState,
  sortOrder: SortOrder = 'default'
): Chair[] {
  let result = chairs.filter((c) => {
    if (c.price < filter.priceMin || c.price > filter.priceMax) return false
    if (filter.materials.length > 0 && !filter.materials.includes(c.material)) return false
    if (filter.colors.length > 0 && !filter.colors.includes(c.color)) return false
    if (filter.headrest === 'yes' && !c.hasHeadrest) return false
    if (filter.headrest === 'no' && c.hasHeadrest) return false
    if (filter.lumbar === 'yes' && !c.hasLumbar) return false
    if (filter.lumbar === 'no' && c.hasLumbar) return false
    if (filter.lumbarAdjustable === 'yes' && !c.isLumbarAdjustable) return false
    if (filter.lumbarAdjustable === 'no' && c.isLumbarAdjustable) return false
    return true
  })

  if (sortOrder === 'price_asc') result = [...result].sort((a, b) => a.price - b.price)
  if (sortOrder === 'price_desc') result = [...result].sort((a, b) => b.price - a.price)

  return result
}
