import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChairCard } from '../ChairCard'
import type { Chair } from '@/types/catalog'

const chair: Chair = {
  id: 'c001', name: 'Test Chair', price: 399, imageUrl: '',
  material: 'mesh', color: 'black',
  headrestAdjustment: '3D', armrestAdjustment: '4D',
  backHeight: 60, seatHeight: 46, recliningAngle: 110,
  hasLumbar: true, isLumbarAdjustable: true, description: '',
}

describe('ChairCard', () => {
  it('renders name and price', () => {
    render(<ChairCard chair={chair} isInCompare={false} onAdd={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText('Test Chair')).toBeInTheDocument()
    expect(screen.getByText('$399')).toBeInTheDocument()
  })

  it('shows add button on image hover when not in compare', async () => {
    render(<ChairCard chair={chair} isInCompare={false} onAdd={vi.fn()} onRemove={vi.fn()} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    expect(screen.getByText('加入对比')).toBeInTheDocument()
  })

  it('shows remove button on image hover when in compare', async () => {
    render(<ChairCard chair={chair} isInCompare={true} onAdd={vi.fn()} onRemove={vi.fn()} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    expect(screen.getByText('移除对比')).toBeInTheDocument()
  })

  it('calls onAdd with chair id when add clicked', async () => {
    const onAdd = vi.fn()
    render(<ChairCard chair={chair} isInCompare={false} onAdd={onAdd} onRemove={vi.fn()} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    await userEvent.click(screen.getByText('加入对比'))
    expect(onAdd).toHaveBeenCalledWith('c001')
  })

  it('calls onRemove with chair id when remove clicked', async () => {
    const onRemove = vi.fn()
    render(<ChairCard chair={chair} isInCompare={true} onAdd={vi.fn()} onRemove={onRemove} />)
    await userEvent.hover(screen.getByTestId('card-image-area'))
    await userEvent.click(screen.getByText('移除对比'))
    expect(onRemove).toHaveBeenCalledWith('c001')
  })
})
