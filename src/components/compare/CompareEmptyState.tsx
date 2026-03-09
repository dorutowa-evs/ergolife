import Link from 'next/link'
import { Armchair } from 'lucide-react'

export function CompareEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <Armchair className="w-16 h-16 text-gray-200" strokeWidth={1} />
      <p className="text-gray-700 font-medium text-lg">还没有添加商品</p>
      <Link
        href="/chairs"
        className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
      >
        去选椅子
      </Link>
    </div>
  )
}
