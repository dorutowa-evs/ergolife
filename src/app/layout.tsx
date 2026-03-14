import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { FilterProvider } from '@/contexts/FilterContext'
import { CompareProvider } from '@/contexts/CompareContext'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'ErgoLife – Office Chairs',
  description: 'Find the perfect office chair',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <TooltipProvider>
          <CompareProvider>
            <FilterProvider>
              {children}
              <Toaster />
            </FilterProvider>
          </CompareProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
