import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FilterProvider } from '@/contexts/FilterContext'
import { CompareProvider } from '@/contexts/CompareContext'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ErgoLife – Office Chairs',
  description: 'Find the perfect office chair',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
