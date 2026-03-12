import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TileSelect } from '../TileSelect'

const OPTIONS = ['无', '3D', '5D', '6D']

it('renders all options', () => {
  render(<TileSelect options={OPTIONS} selected={[]} onChange={() => {}} />)
  OPTIONS.forEach(opt => expect(screen.getByText(opt)).toBeInTheDocument())
})

it('calls onChange with added option when unselected tile clicked', async () => {
  const onChange = vi.fn()
  render(<TileSelect options={OPTIONS} selected={[]} onChange={onChange} />)
  await userEvent.click(screen.getByText('3D'))
  expect(onChange).toHaveBeenCalledWith(['3D'])
})

it('calls onChange removing option when selected tile clicked', async () => {
  const onChange = vi.fn()
  render(<TileSelect options={OPTIONS} selected={['3D', '5D']} onChange={onChange} />)
  await userEvent.click(screen.getByText('3D'))
  expect(onChange).toHaveBeenCalledWith(['5D'])
})

it('visually distinguishes selected tiles', () => {
  render(<TileSelect options={OPTIONS} selected={['5D']} onChange={() => {}} />)
  const selected = screen.getByText('5D').closest('button')
  const unselected = screen.getByText('3D').closest('button')
  expect(selected?.className).toContain('border-gray-900')
  expect(unselected?.className).not.toContain('border-gray-900')
})
