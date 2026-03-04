import Link from 'next/link'
import { Armchair } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/chairs" className="flex items-center gap-2 font-semibold text-gray-900">
            <Armchair className="w-5 h-5" strokeWidth={1.5} />
            <span>ErgoLife</span>
          </Link>
          {/* Nav placeholders */}
          <nav className="flex items-center gap-6">
            <span className="text-sm text-gray-600 cursor-default">Office Chairs</span>
            <span className="text-sm text-gray-400 cursor-default">Accessories</span>
          </nav>
        </div>

        {/* Right placeholders */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 cursor-default">Login</span>
          <span className="text-gray-400 cursor-default text-xl">🛒</span>
        </div>
      </div>
    </header>
  )
}
