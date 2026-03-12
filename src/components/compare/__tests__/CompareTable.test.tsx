import { render, screen } from '@testing-library/react'
import { CompareTable } from '../CompareTable'
import type { Chair, Material, Color } from '@/types/catalog'

const chairs: Chair[] = [
  {
    id: 'c001', name: 'Aeron', price: 1999, imageUrl: '', description: '',
    material: 'mesh', color: 'black',
    hasLumbar: true, isLumbarAdjustable: true,
    headrestAdjustment: null, armrestAdjustment: '8D',
    backHeight: 64, seatHeight: 46, recliningAngle: 110,
  },
  {
    id: 'c002', name: 'Embody', price: 1795, imageUrl: '', description: '',
    material: 'mesh', color: 'black',
    hasLumbar: true, isLumbarAdjustable: true,
    headrestAdjustment: '3D', armrestAdjustment: '4D',
    backHeight: 58, seatHeight: 44, recliningAngle: 115,
  },
]
const materials: Material[] = [{ id: 'mesh', label: 'Mesh (网布)' }]
const colors: Color[] = [{ id: 'black', name: '黑色', rgb: '#000' }]

it('renders parameter label column', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onAdd={vi.fn()} isFull={false} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('价格')).toBeInTheDocument()
  expect(screen.getByText('材质')).toBeInTheDocument()
  expect(screen.getByText('颜色')).toBeInTheDocument()
  expect(screen.getByText('靠背高度')).toBeInTheDocument()
  expect(screen.getByText('座高')).toBeInTheDocument()
  expect(screen.getByText('后仰角度')).toBeInTheDocument()
  expect(screen.getByText('扶手')).toBeInTheDocument()
  expect(screen.getByText('头枕')).toBeInTheDocument()
  expect(screen.getByText('腰靠')).toBeInTheDocument()
  expect(screen.getByText('腰靠可调节')).toBeInTheDocument()
})

it('renders all chair names', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onAdd={vi.fn()} isFull={false} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('Aeron')).toBeInTheDocument()
  expect(screen.getByText('Embody')).toBeInTheDocument()
})

it('renders add column when not full', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onAdd={vi.fn()} isFull={false} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('添加商品')).toBeInTheDocument()
})

it('hides add column when full', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onAdd={vi.fn()} isFull={true} compareIds={['c001', 'c002']} />)
  expect(screen.queryByText('添加商品')).not.toBeInTheDocument()
})

it('renders numeric parameter values', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onAdd={vi.fn()} isFull={false} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('64 cm')).toBeInTheDocument()
  expect(screen.getByText('58 cm')).toBeInTheDocument()
  expect(screen.getByText('46 cm')).toBeInTheDocument()
  expect(screen.getByText('44 cm')).toBeInTheDocument()
  expect(screen.getByText('110°')).toBeInTheDocument()
  expect(screen.getByText('115°')).toBeInTheDocument()
})

it('renders adjustment values including null as 无', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onAdd={vi.fn()} isFull={false} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('8D')).toBeInTheDocument()
  expect(screen.getByText('4D')).toBeInTheDocument()
  expect(screen.getByText('3D')).toBeInTheDocument()
  expect(screen.getAllByText('无').length).toBeGreaterThanOrEqual(1)
})
