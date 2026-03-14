'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const navLink = (href: string, label: string) => {
    const active = pathname != null && (pathname === href || pathname.startsWith(href + '/'))
    return (
      <Link
        href={href}
        className={`text-sm transition-colors hover:text-gray-900 ${active ? 'text-gray-950 font-medium' : 'text-gray-400'}`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/chairs" className="text-gray-950 leading-none">
            <span className="font-display italic text-[1.35rem] tracking-tight">ErgoLife</span>
          </Link>
          <nav className="flex items-center gap-6">
            {navLink('/chairs', '办公椅')}
            {navLink('/recommend', '椅子推荐')}
          </nav>
        </div>
      </div>
    </header>
  )
}
