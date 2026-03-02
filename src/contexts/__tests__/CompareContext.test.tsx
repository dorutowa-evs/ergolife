import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareProvider, useCompare } from '../CompareContext'

function Widget() {
  const { compareList, addToCompare, removeFromCompare, isInCompare, isFull } = useCompare()
  return (
    <div>
      <span data-testid="count">{compareList.length}</span>
      <span data-testid="full">{String(isFull)}</span>
      <span data-testid="in">{String(isInCompare('a'))}</span>
      <button onClick={() => addToCompare('a')}>add-a</button>
      <button onClick={() => removeFromCompare('a')}>remove-a</button>
    </div>
  )
}

const wrap = (ui: React.ReactElement) =>
  render(<CompareProvider>{ui}</CompareProvider>)

describe('CompareContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty', () => {
    wrap(<Widget />)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds an item', async () => {
    wrap(<Widget />)
    await userEvent.click(screen.getByText('add-a'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('in').textContent).toBe('true')
  })

  it('ignores duplicate adds', async () => {
    wrap(<Widget />)
    await userEvent.click(screen.getByText('add-a'))
    await userEvent.click(screen.getByText('add-a'))
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('removes an item', async () => {
    wrap(<Widget />)
    await userEvent.click(screen.getByText('add-a'))
    await userEvent.click(screen.getByText('remove-a'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('reports isFull when list has 5 items', async () => {
    localStorage.setItem('compare-list', JSON.stringify(['a', 'b', 'c', 'd', 'e']))
    wrap(<Widget />)
    await screen.findByText('5', { selector: '[data-testid="count"]' })
    expect(screen.getByTestId('full').textContent).toBe('true')
    expect(screen.getByTestId('count').textContent).toBe('5')
  })

  it('does not add beyond 5 items', async () => {
    localStorage.setItem('compare-list', JSON.stringify(['b', 'c', 'd', 'e', 'f']))
    wrap(<Widget />)
    await screen.findByText('5', { selector: '[data-testid="count"]' })
    await userEvent.click(screen.getByText('add-a'))
    expect(screen.getByTestId('count').textContent).toBe('5')
  })
})
