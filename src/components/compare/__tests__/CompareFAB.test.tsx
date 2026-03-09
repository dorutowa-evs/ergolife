import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareFAB } from '../CompareFAB'
import type { Chair } from '@/types/catalog'

const chairs: Chair[] = [
  { id: 'c001', name: 'Chair Alpha', price: 399, imageUrl: '', material: 'mesh', color: 'black', hasHeadrest: true, hasLumbar: true, isLumbarAdjustable: true, description: '' },
  { id: 'c002', name: 'Chair Beta',  price: 599, imageUrl: '', material: 'leather', color: 'brown', hasHeadrest: true, hasLumbar: true, isLumbarAdjustable: false, description: '' },
]

describe('CompareFAB', () => {
  it('is hidden when compare list is empty', () => {
    const { container } = render(<CompareFAB compareIds={[]} chairs={chairs} onRemove={vi.fn()} onClearAll={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows count badge', () => {
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={vi.fn()} onClearAll={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders a link to /compare that opens in a new tab', () => {
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={vi.fn()} onClearAll={vi.fn()} />)
    const link = screen.getByRole('link', { name: /对比/ })
    expect(link).toHaveAttribute('href', '/compare')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows chair list on hover', async () => {
    render(<CompareFAB compareIds={['c001', 'c002']} chairs={chairs} onRemove={vi.fn()} onClearAll={vi.fn()} />)
    await userEvent.hover(screen.getByRole('link', { name: /对比/i }))
    expect(screen.getByText('Chair Alpha')).toBeInTheDocument()
    expect(screen.getByText('Chair Beta')).toBeInTheDocument()
  })

  it('calls onRemove when × clicked in preview list', async () => {
    const onRemove = vi.fn()
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={onRemove} onClearAll={vi.fn()} />)
    await userEvent.hover(screen.getByRole('link', { name: /对比/i }))
    await userEvent.click(screen.getByLabelText('移除 Chair Alpha'))
    expect(onRemove).toHaveBeenCalledWith('c001')
  })

  it('hides preview list on mouse leave', async () => {
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={vi.fn()} onClearAll={vi.fn()} />)
    const container = screen.getByRole('link', { name: /对比/i }).closest('div')!
    await userEvent.hover(screen.getByRole('link', { name: /对比/i }))
    expect(screen.getByText('Chair Alpha')).toBeInTheDocument()
    await userEvent.unhover(container)
    expect(screen.queryByText('Chair Alpha')).not.toBeInTheDocument()
  })
})
