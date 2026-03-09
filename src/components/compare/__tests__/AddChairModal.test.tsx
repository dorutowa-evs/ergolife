import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddChairModal } from '../AddChairModal'
import type { Chair } from '@/types/catalog'

const chairs: Chair[] = [
  { id: 'c001', name: 'Aeron', price: 1999, imageUrl: '', material: 'mesh', color: 'black', hasHeadrest: false, hasLumbar: true, isLumbarAdjustable: true, description: '' },
  { id: 'c002', name: 'Embody', price: 1795, imageUrl: '', material: 'mesh', color: 'black', hasHeadrest: false, hasLumbar: true, isLumbarAdjustable: true, description: '' },
]

it('renders all chairs', () => {
  render(<AddChairModal open chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={vi.fn()} />)
  expect(screen.getByText('Aeron')).toBeInTheDocument()
  expect(screen.getByText('Embody')).toBeInTheDocument()
})

it('greys out already-added chairs', () => {
  render(<AddChairModal open chairs={chairs} compareIds={['c001']} onAdd={vi.fn()} onClose={vi.fn()} />)
  expect(screen.getByText('已添加')).toBeInTheDocument()
})

it('filters by search input', async () => {
  render(<AddChairModal open chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={vi.fn()} />)
  await userEvent.type(screen.getByPlaceholderText('搜索椅子名称…'), 'Aeron')
  expect(screen.getByText('Aeron')).toBeInTheDocument()
  expect(screen.queryByText('Embody')).not.toBeInTheDocument()
})

it('shows no-result message when search matches nothing', async () => {
  render(<AddChairModal open chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={vi.fn()} />)
  await userEvent.type(screen.getByPlaceholderText('搜索椅子名称…'), 'zzz')
  expect(screen.getByText('没有找到相关商品')).toBeInTheDocument()
})

it('calls onAdd and onClose when clicking an available chair', async () => {
  const onAdd = vi.fn()
  const onClose = vi.fn()
  render(<AddChairModal open chairs={chairs} compareIds={[]} onAdd={onAdd} onClose={onClose} />)
  await userEvent.click(screen.getByText('Aeron'))
  expect(onAdd).toHaveBeenCalledWith('c001')
  expect(onClose).toHaveBeenCalled()
})

it('calls onClose when clicking the overlay', async () => {
  const onClose = vi.fn()
  render(<AddChairModal open chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={onClose} />)
  await userEvent.click(screen.getByTestId('modal-overlay'))
  expect(onClose).toHaveBeenCalled()
})

it('does not render when open=false', () => {
  render(<AddChairModal open={false} chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={vi.fn()} />)
  expect(screen.queryByText('添加商品')).not.toBeInTheDocument()
})

it('calls onClose when Esc key is pressed', async () => {
  const onClose = vi.fn()
  render(<AddChairModal open chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={onClose} />)
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalled()
})

it('clears search query when modal is closed and reopened', async () => {
  const { rerender } = render(
    <AddChairModal open chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={vi.fn()} />
  )
  await userEvent.type(screen.getByPlaceholderText('搜索椅子名称…'), 'Aeron')
  expect(screen.getByPlaceholderText('搜索椅子名称…')).toHaveValue('Aeron')

  rerender(<AddChairModal open={false} chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={vi.fn()} />)
  rerender(<AddChairModal open chairs={chairs} compareIds={[]} onAdd={vi.fn()} onClose={vi.fn()} />)
  expect(screen.getByPlaceholderText('搜索椅子名称…')).toHaveValue('')
})
