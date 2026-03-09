import { render, screen } from '@testing-library/react'
import { CompareTable } from '../CompareTable'
import type { Chair, Material, Color } from '@/types/catalog'

const chairs: Chair[] = [
  { id: 'c001', name: 'Aeron', price: 1999, imageUrl: '', material: 'mesh', color: 'black', hasHeadrest: false, hasLumbar: true, isLumbarAdjustable: true, description: '' },
  { id: 'c002', name: 'Embody', price: 1795, imageUrl: '', material: 'mesh', color: 'black', hasHeadrest: false, hasLumbar: true, isLumbarAdjustable: true, description: '' },
]
const materials: Material[] = [{ id: 'mesh', label: 'Mesh (网布)' }]
const colors: Color[] = [{ id: 'black', name: '黑色', rgb: '#000' }]

it('renders parameter label column', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onReorder={vi.fn()} onAdd={vi.fn()} isFull={false} allChairs={chairs} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('价格')).toBeInTheDocument()
  expect(screen.getByText('材质')).toBeInTheDocument()
  expect(screen.getByText('颜色')).toBeInTheDocument()
  expect(screen.getByText('头枕')).toBeInTheDocument()
  expect(screen.getByText('腰靠')).toBeInTheDocument()
  expect(screen.getByText('腰靠可调节')).toBeInTheDocument()
})

it('renders all chair names', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onReorder={vi.fn()} onAdd={vi.fn()} isFull={false} allChairs={chairs} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('Aeron')).toBeInTheDocument()
  expect(screen.getByText('Embody')).toBeInTheDocument()
})

it('renders add column when not full', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onReorder={vi.fn()} onAdd={vi.fn()} isFull={false} allChairs={chairs} compareIds={['c001', 'c002']} />)
  expect(screen.getByText('添加商品')).toBeInTheDocument()
})

it('hides add column when full', () => {
  render(<CompareTable chairs={chairs} materials={materials} colors={colors} onRemove={vi.fn()} onReorder={vi.fn()} onAdd={vi.fn()} isFull={true} allChairs={chairs} compareIds={['c001', 'c002']} />)
  expect(screen.queryByText('添加商品')).not.toBeInTheDocument()
})
