import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareChairColumn } from '../CompareChairColumn'
import type { Chair } from '@/types/catalog'
import { DndContext } from '@dnd-kit/core'

const chair: Chair = {
  id: 'c001', name: 'Herman Miller Aeron', price: 1999,
  imageUrl: '/images/chairs/aeron.jpg', material: 'mesh', color: 'black',
  hasHeadrest: false, hasLumbar: true, isLumbarAdjustable: true, description: '',
}
const materials = [{ id: 'mesh', label: 'Mesh (网布)' }]
const colors = [{ id: 'black', name: '黑色', rgb: '#1a1a1a' }]

function wrap(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>)
}

it('renders chair name', () => {
  wrap(<CompareChairColumn chair={chair} materials={materials} colors={colors} hoveredRow={null} onHoverRow={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByText('Herman Miller Aeron')).toBeInTheDocument()
})

it('renders formatted price', () => {
  wrap(<CompareChairColumn chair={chair} materials={materials} colors={colors} hoveredRow={null} onHoverRow={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByText('$1,999')).toBeInTheDocument()
})

it('renders boolean params with icon + text', () => {
  wrap(<CompareChairColumn chair={chair} materials={materials} colors={colors} hoveredRow={null} onHoverRow={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByText('✗ 无')).toBeInTheDocument() // hasHeadrest=false
  expect(screen.getAllByText('✓ 有')).toHaveLength(2)  // hasLumbar + isLumbarAdjustable
})

it('calls onRemove when remove button clicked', async () => {
  const onRemove = vi.fn()
  wrap(<CompareChairColumn chair={chair} materials={materials} colors={colors} hoveredRow={null} onHoverRow={vi.fn()} onRemove={onRemove} />)
  const btn = screen.getByRole('button', { name: /移除/ })
  await userEvent.click(btn)
  expect(onRemove).toHaveBeenCalledWith('c001')
})
