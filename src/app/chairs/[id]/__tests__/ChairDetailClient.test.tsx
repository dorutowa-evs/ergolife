import { render, screen } from '@testing-library/react'
import { ChairDetailClient } from '../ChairDetailClient'
import { CompareProvider } from '@/contexts/CompareContext'
import { Toaster } from 'sonner'
import type { Chair } from '@/types/catalog'

const materials = [{ id: 'mesh', label: '网布' }]
const colors = [{ id: 'black', name: '黑色', rgb: '#000' }]

const chair: Chair = {
  id: 'c001', name: 'Aeron Chair', price: 1999, imageUrl: '', description: '',
  material: 'mesh', color: 'black',
  headrestAdjustment: null, armrestAdjustment: '8D',
  backHeight: 64, seatHeight: 46, recliningAngle: 110,
  hasLumbar: true, isLumbarAdjustable: true,
  platformPrices: { taobao: 1939, jd: 2039, pdd: 1839 },
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <CompareProvider>{children}<Toaster /></CompareProvider>
}

it('renders not-found state when chair is undefined', () => {
  render(<ChairDetailClient chair={undefined} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByText('商品不存在')).toBeInTheDocument()
})

it('renders chair name', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByText('Aeron Chair')).toBeInTheDocument()
})

it('renders best price', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getAllByText(/\$1,839/).length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText('最低平台价')).toBeInTheDocument()
})

it('renders platform price cards', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByText('淘宝')).toBeInTheDocument()
  expect(screen.getByText('京东')).toBeInTheDocument()
})

it('renders spec labels', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByText('腰靠')).toBeInTheDocument()
  expect(screen.getByText('材质')).toBeInTheDocument()
  expect(screen.getByText('靠背高度')).toBeInTheDocument()
  expect(screen.getByText('头枕')).toBeInTheDocument()
})

it('renders spec values', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByText('64 cm')).toBeInTheDocument()
  expect(screen.getByText('46 cm')).toBeInTheDocument()
  expect(screen.getByText('110°')).toBeInTheDocument()
  expect(screen.getByText('8D')).toBeInTheDocument()
})
