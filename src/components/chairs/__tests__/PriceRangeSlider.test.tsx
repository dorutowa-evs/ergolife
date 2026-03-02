import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceRangeSlider } from '../PriceRangeSlider'

const defaultProps = {
  min: 0, max: 2000,
  value: [200, 1500] as [number, number],
  onChange: vi.fn(),
}

describe('PriceRangeSlider', () => {
  it('renders min and max input values', () => {
    render(<PriceRangeSlider {...defaultProps} />)
    expect(screen.getByDisplayValue('200')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument()
  })

  it('shows error when min > max after blur', async () => {
    const onChange = vi.fn()
    render(<PriceRangeSlider {...defaultProps} onChange={onChange} />)
    const minInput = screen.getByDisplayValue('200')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '2000')
    await userEvent.tab() // trigger blur
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalledWith(expect.arrayContaining([2000]))
  })

  it('calls onChange on valid blur', async () => {
    const onChange = vi.fn()
    render(<PriceRangeSlider {...defaultProps} onChange={onChange} />)
    const minInput = screen.getByDisplayValue('200')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '300')
    await userEvent.tab()
    expect(onChange).toHaveBeenCalledWith([300, 1500])
  })

  it('clamps value below absolute min to absolute min', async () => {
    const onChange = vi.fn()
    render(<PriceRangeSlider {...defaultProps} onChange={onChange} />)
    const minInput = screen.getByDisplayValue('200')
    await userEvent.clear(minInput)
    await userEvent.type(minInput, '-100')
    await userEvent.tab()
    expect(onChange).toHaveBeenCalledWith([0, 1500])
  })
})
