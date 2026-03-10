import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareChairColumn } from '../CompareChairColumn'
import type { Chair } from '@/types/catalog'

const chair: Chair = {
  id: 'c001', name: 'Herman Miller Aeron', price: 1999,
  imageUrl: '/images/chairs/aeron.jpg', material: 'mesh', color: 'black',
  hasHeadrest: false, hasLumbar: true, isLumbarAdjustable: true, description: '',
}

it('renders chair name', () => {
  render(<CompareChairColumn chair={chair} onRemove={vi.fn()} />)
  expect(screen.getByText('Herman Miller Aeron')).toBeInTheDocument()
})

it('calls onRemove when remove button clicked', async () => {
  const onRemove = vi.fn()
  render(<CompareChairColumn chair={chair} onRemove={onRemove} />)
  await userEvent.click(screen.getByRole('button', { name: /移除/ }))
  expect(onRemove).toHaveBeenCalledWith('c001')
})
