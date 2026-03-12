// src/app/compare/page.tsx
'use client'
import { useCompare } from '@/contexts/CompareContext'
import { getChairs, getMaterials, getColors } from '@/lib/catalog'
import { CompareEmptyState } from '@/components/compare/CompareEmptyState'
import { CompareTable } from '@/components/compare/CompareTable'
import type { Chair } from '@/types/catalog'

const allChairs = getChairs()
const materials = getMaterials()
const colors = getColors()

export default function ComparePage() {
  const { compareList, addToCompare, removeFromCompare, isFull } = useCompare()

  const compareChairs = compareList
    .map((id) => allChairs.find((c) => c.id === id))
    .filter((c): c is Chair => c !== undefined)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {compareChairs.length === 0 ? (
          <CompareEmptyState />
        ) : (
          <CompareTable
            chairs={compareChairs}
            compareIds={compareList}
            materials={materials}
            colors={colors}
            isFull={isFull}
            onRemove={removeFromCompare}
            onAdd={addToCompare}
          />
        )}
      </div>
    </div>
  )
}
