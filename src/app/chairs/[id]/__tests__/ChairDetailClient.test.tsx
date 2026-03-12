import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

it('renders platform prices', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByText('淘宝')).toBeInTheDocument()
  expect(screen.getByText('京东')).toBeInTheDocument()
  expect(screen.getByText('拼多多')).toBeInTheDocument()
})

it('renders spec table labels', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByText('规格参数')).toBeInTheDocument()
  expect(screen.getByText('材质')).toBeInTheDocument()
  expect(screen.getByText('靠背高度')).toBeInTheDocument()
  expect(screen.getByText('头枕')).toBeInTheDocument()
})

it('shows 加入对比 when chair not in compare list', () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  expect(screen.getByRole('button', { name: /加入对比/ })).toBeInTheDocument()
})

it('shows 已加入 after adding to compare', async () => {
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  await userEvent.click(screen.getByRole('button', { name: /加入对比/ }))
  expect(screen.getByRole('button', { name: /已加入/ })).toBeInTheDocument()
})

it('shows toast when compare list is full', async () => {
  localStorage.setItem('compare-list', JSON.stringify(['c002', 'c003', 'c004', 'c005', 'c006']))
  render(<ChairDetailClient chair={chair} materials={materials} colors={colors} />, { wrapper: Wrapper })
  await userEvent.click(screen.getByRole('button', { name: /加入对比/ }))
  expect(screen.getByText('最多对比 5 个商品')).toBeInTheDocument()
})
