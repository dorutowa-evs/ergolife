// src/app/compare/page.tsx
'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCompare } from '@/contexts/CompareContext'
import { getChairs, getMaterials, getColors } from '@/lib/catalog'
import { CompareEmptyState } from '@/components/compare/CompareEmptyState'
import { CompareTable } from '@/components/compare/CompareTable'
import type { Chair } from '@/types/catalog'

const allChairs = getChairs()
const materials = getMaterials()
const colors = getColors()

export default function ComparePage() {
  const { compareList, addToCompare, removeFromCompare, reorderCompare, isFull } = useCompare()

  const compareChairs = compareList
    .map((id) => allChairs.find((c) => c.id === id))
    .filter((c): c is Chair => c !== undefined)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/chairs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>

        {compareChairs.length === 0 ? (
          <CompareEmptyState />
        ) : (
          <CompareTable
            chairs={compareChairs}
            allChairs={allChairs}
            compareIds={compareList}
            materials={materials}
            colors={colors}
            isFull={isFull}
            onRemove={removeFromCompare}
            onReorder={reorderCompare}
            onAdd={addToCompare}
          />
        )}
      </div>
    </div>
  )
}
