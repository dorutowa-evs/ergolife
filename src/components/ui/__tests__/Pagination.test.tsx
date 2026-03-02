import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('does not render when total pages is 1', () => {
    const { container } = render(<Pagination current={1} total={1} onChange={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders page buttons', () => {
    render(<Pagination current={1} total={4} onChange={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('disables prev on first page', () => {
    render(<Pagination current={1} total={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('上一页')).toBeDisabled()
  })

  it('disables next on last page', () => {
    render(<Pagination current={5} total={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('下一页')).toBeDisabled()
  })

  it('calls onChange with correct page on button click', async () => {
    const onChange = vi.fn()
    render(<Pagination current={1} total={4} onChange={onChange} />)
    await userEvent.click(screen.getByText('3'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('calls onChange with next page on next click', async () => {
    const onChange = vi.fn()
    render(<Pagination current={2} total={5} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('下一页'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('renders ellipsis for large page counts', () => {
    render(<Pagination current={1} total={10} onChange={vi.fn()} />)
    expect(screen.getByText('...')).toBeInTheDocument()
  })
})
