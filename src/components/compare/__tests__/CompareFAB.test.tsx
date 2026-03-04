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
    const { container } = render(<CompareFAB compareIds={[]} chairs={chairs} onRemove={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows count badge', () => {
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows chair list on click', async () => {
    render(<CompareFAB compareIds={['c001', 'c002']} chairs={chairs} onRemove={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /对比/i }))
    expect(screen.getByText('Chair Alpha')).toBeInTheDocument()
    expect(screen.getByText('Chair Beta')).toBeInTheDocument()
  })

  it('calls onRemove when × clicked in preview list', async () => {
    const onRemove = vi.fn()
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={onRemove} />)
    await userEvent.click(screen.getByRole('button', { name: /对比/i }))
    await userEvent.click(screen.getByLabelText('移除 Chair Alpha'))
    expect(onRemove).toHaveBeenCalledWith('c001')
  })

  it('hides preview list when button clicked again', async () => {
    render(<CompareFAB compareIds={['c001']} chairs={chairs} onRemove={vi.fn()} />)
    const fab = screen.getByRole('button', { name: /对比/i })
    await userEvent.click(fab)
    expect(screen.getByText('Chair Alpha')).toBeInTheDocument()
    await userEvent.click(fab)
    expect(screen.queryByText('Chair Alpha')).not.toBeInTheDocument()
  })
})
