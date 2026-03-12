import catalogData from '@/data/chairs.catalog.json'
import type { Catalog, Chair, Material, Color, CatalogConfig } from '@/types/catalog'

const catalog = catalogData as Catalog

export function getConfig(): CatalogConfig {
  return catalog.config
}

export function getMaterials(): Material[] {
  return catalog.materials
}

export function getColors(): Color[] {
  return catalog.colors
}

export function getChairs(): Chair[] {
  return catalog.chairs
}

export function getPriceBounds(): { min: number; max: number } {
  return {
    min: catalog.config.priceMin,
    max: catalog.config.priceMax,
  }
}

export function getChairById(id: string): Chair | undefined {
  return catalog.chairs.find((c) => c.id === id)
}
