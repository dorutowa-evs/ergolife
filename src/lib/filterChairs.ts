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
    if (filter.headrestAdjustment.length > 0) {
      const match = filter.headrestAdjustment.some((v) =>
        v === 'none' ? c.headrestAdjustment === null : c.headrestAdjustment === v
      )
      if (!match) return false
    }
    if (filter.armrestAdjustment.length > 0) {
      const match = filter.armrestAdjustment.some((v) =>
        v === 'none' ? c.armrestAdjustment === null : c.armrestAdjustment === v
      )
      if (!match) return false
    }
    if (c.backHeight < filter.backHeightMin || c.backHeight > filter.backHeightMax) return false
    if (c.seatHeight < filter.seatHeightMin || c.seatHeight > filter.seatHeightMax) return false
    if (c.recliningAngle < filter.recliningAngleMin || c.recliningAngle > filter.recliningAngleMax) return false
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
