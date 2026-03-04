import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortDropdown } from '../SortDropdown'

const options = [
  { value: 'default',    label: '默认排序' },
  { value: 'price_asc',  label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
]

describe('SortDropdown', () => {
  it('shows current option label on button', () => {
    render(<SortDropdown options={options} value="default" onChange={vi.fn()} />)
    expect(screen.getByText('默认排序')).toBeInTheDocument()
  })

  it('updates label to reflect selected value', () => {
    render(<SortDropdown options={options} value="price_asc" onChange={vi.fn()} />)
    expect(screen.getByText('价格从低到高')).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    render(<SortDropdown options={options} value="default" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /默认排序/i }))
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
    expect(screen.getByText('价格从低到高')).toBeInTheDocument()
    expect(screen.getByText('价格从高到低')).toBeInTheDocument()
  })

  it('calls onChange with selected value and closes dropdown', async () => {
    const onChange = vi.fn()
    render(<SortDropdown options={options} value="default" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /默认排序/i }))
    await userEvent.click(screen.getByText('价格从低到高'))
    expect(onChange).toHaveBeenCalledWith('price_asc')
    expect(screen.queryByText('价格从高到低')).not.toBeInTheDocument()
  })

  it('label updates when value prop changes', () => {
    const { rerender } = render(<SortDropdown options={options} value="default" onChange={vi.fn()} />)
    expect(screen.getByText('默认排序')).toBeInTheDocument()
    rerender(<SortDropdown options={options} value="price_desc" onChange={vi.fn()} />)
    expect(screen.getByText('价格从高到低')).toBeInTheDocument()
  })
})
