import { render, screen } from '@testing-library/react'
import { CompareEmptyState } from '../CompareEmptyState'

it('renders empty state heading and link to /chairs', () => {
  render(<CompareEmptyState />)
  expect(screen.getByText('还没有添加商品')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '去选椅子' })).toHaveAttribute('href', '/chairs')
})
