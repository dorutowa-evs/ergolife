/** chairs.catalog.json 顶层结构 */
export interface Catalog {
  config: CatalogConfig
  materials: Material[]
  colors: Color[]
  chairs: Chair[]
}

export interface CatalogConfig {
  minColumnWidth: number
  itemsPerPage: number
  priceMin: number
  priceMax: number
}

export interface Material {
  id: string
  label: string
}

export interface Color {
  id: string
  name: string
  rgb: string
}

export interface Chair {
  id: string
  name: string
  price: number
  imageUrl: string
  imageFit?: 'cover' | 'contain'
  material: 'mesh' | 'leather' | 'fabric'
  color: string
  hasLumbar: boolean
  isLumbarAdjustable: boolean
  headrestAdjustment: '3D' | '5D' | '6D' | null   // null = no headrest
  armrestAdjustment: '3D' | '4D' | '5D' | '6D' | '7D' | '8D' | null  // null = no armrest
  backHeight: number    // cm, 40–70
  seatHeight: number    // cm, 40–55
  recliningAngle: number // degrees, 30–160
  description: string
  badge?: 'TOP_PICK' | 'SALE'
  originalPrice?: number
}

/** 筛选条件状态 */
export type TriState = 'all' | 'yes' | 'no'
export type SortOrder = 'default' | 'price_asc' | 'price_desc'

export interface FilterState {
  priceMin: number
  priceMax: number
  materials: string[]
  colors: string[]
  headrestAdjustment: string[]   // [] = all; 'none' = null headrest; '3D'|'5D'|'6D' = specific
  armrestAdjustment: string[]    // [] = all; 'none' = null armrest; '3D'–'8D' = specific
  backHeightMin: number
  backHeightMax: number
  seatHeightMin: number
  seatHeightMax: number
  recliningAngleMin: number
  recliningAngleMax: number
  lumbar: TriState
  lumbarAdjustable: TriState
}

export function makeDefaultFilter(priceMin: number, priceMax: number): FilterState {
  return {
    priceMin,
    priceMax,
    materials: [],
    colors: [],
    headrestAdjustment: [],
    armrestAdjustment: [],
    backHeightMin: 40,
    backHeightMax: 70,
    seatHeightMin: 40,
    seatHeightMax: 55,
    recliningAngleMin: 30,
    recliningAngleMax: 160,
    lumbar: 'all',
    lumbarAdjustable: 'all',
  }
}
