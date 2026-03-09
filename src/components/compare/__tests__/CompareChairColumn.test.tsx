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

function wrap(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>)
}

it('renders chair name', () => {
  wrap(<CompareChairColumn chair={chair} onRemove={vi.fn()} />)
  expect(screen.getByText('Herman Miller Aeron')).toBeInTheDocument()
})

it('calls onRemove when remove button clicked', async () => {
  const onRemove = vi.fn()
  wrap(<CompareChairColumn chair={chair} onRemove={onRemove} />)
  const btn = screen.getByRole('button', { name: /移除/ })
  await userEvent.click(btn)
  expect(onRemove).toHaveBeenCalledWith('c001')
})
