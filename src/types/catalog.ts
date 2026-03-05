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
  // 产品图比例不统一：宽图用 cover 撑满，高图/全身图用 contain 避免裁剪
  imageFit?: 'cover' | 'contain'
  material: string        // 对应 Material.id
  color: string           // 对应 Color.id
  hasHeadrest: boolean
  hasLumbar: boolean
  isLumbarAdjustable: boolean
  description: string
  badge?: 'TOP_PICK' | 'SALE'   // 可选：卡片图片角标
  originalPrice?: number         // 可选：SALE 时的原价（用于删除线显示）
}

/** 筛选条件状态 */
export type TriState = 'all' | 'yes' | 'no'
export type SortOrder = 'default' | 'price_asc' | 'price_desc'

export interface FilterState {
  priceMin: number
  priceMax: number
  materials: string[]     // Material.id 列表
  colors: string[]        // Color.id 列表
  headrest: TriState
  lumbar: TriState
  lumbarAdjustable: TriState
}

export function makeDefaultFilter(priceMin: number, priceMax: number): FilterState {
  return {
    priceMin,
    priceMax,
    materials: [],
    colors: [],
    headrest: 'all',
    lumbar: 'all',
    lumbarAdjustable: 'all',
  }
}
