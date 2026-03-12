import { render, screen } from '@testing-library/react'
import { RangeSlider } from '../RangeSlider'

it('displays current min and max values with unit', () => {
  render(<RangeSlider min={40} max={70} value={[45, 65]} unit="cm" onChange={() => {}} />)
  expect(screen.getByText('45 cm')).toBeInTheDocument()
  expect(screen.getByText('65 cm')).toBeInTheDocument()
})

it('displays degree values without space before unit', () => {
  render(<RangeSlider min={30} max={160} value={[90, 135]} unit="°" onChange={() => {}} />)
  expect(screen.getByText('90°')).toBeInTheDocument()
  expect(screen.getByText('135°')).toBeInTheDocument()
})
