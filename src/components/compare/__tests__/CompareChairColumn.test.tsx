import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareChairColumn } from '../CompareChairColumn'
import type { Chair } from '@/types/catalog'

const chair: Chair = {
  id: 'c001', name: 'Herman Miller Aeron', price: 1999,
  imageUrl: '/images/chairs/aeron.jpg', material: 'mesh', color: 'black',
  hasHeadrest: false, hasLumbar: true, isLumbarAdjustable: true, description: '',
}

const defaultProps = {
  chair,
  isFirst: false,
  isLast: false,
  onMoveLeft: vi.fn(),
  onMoveRight: vi.fn(),
  onRemove: vi.fn(),
}

it('renders chair name', () => {
  render(<CompareChairColumn {...defaultProps} />)
  expect(screen.getByText('Herman Miller Aeron')).toBeInTheDocument()
})

it('calls onRemove when remove button clicked', async () => {
  const onRemove = vi.fn()
  render(<CompareChairColumn {...defaultProps} onRemove={onRemove} />)
  await userEvent.click(screen.getByRole('button', { name: /移除/ }))
  expect(onRemove).toHaveBeenCalledWith('c001')
})

it('calls onMoveLeft when left arrow clicked', async () => {
  const onMoveLeft = vi.fn()
  render(<CompareChairColumn {...defaultProps} onMoveLeft={onMoveLeft} />)
  await userEvent.click(screen.getByRole('button', { name: '左移' }))
  expect(onMoveLeft).toHaveBeenCalled()
})

it('calls onMoveRight when right arrow clicked', async () => {
  const onMoveRight = vi.fn()
  render(<CompareChairColumn {...defaultProps} onMoveRight={onMoveRight} />)
  await userEvent.click(screen.getByRole('button', { name: '右移' }))
  expect(onMoveRight).toHaveBeenCalled()
})

it('left arrow is disabled when isFirst=true', () => {
  render(<CompareChairColumn {...defaultProps} isFirst={true} />)
  expect(screen.getByRole('button', { name: '左移' })).toBeDisabled()
})

it('right arrow is disabled when isLast=true', () => {
  render(<CompareChairColumn {...defaultProps} isLast={true} />)
  expect(screen.getByRole('button', { name: '右移' })).toBeDisabled()
})
