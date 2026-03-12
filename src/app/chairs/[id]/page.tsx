import { getChairById, getMaterials, getColors } from '@/lib/catalog'
import { ChairDetailClient } from './ChairDetailClient'

export default async function ChairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const chair = getChairById(id)
  const materials = getMaterials()
  const colors = getColors()
  return <ChairDetailClient chair={chair} materials={materials} colors={colors} />
}
