import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterProvider, useFilter } from '../FilterContext'

function Widget() {
  const { filter, setFilter, resetFilter } = useFilter()
  return (
    <div>
      <span data-testid="mat">{filter.materials.join(',')}</span>
      <span data-testid="headrest">{filter.headrestAdjustment.join(',')}</span>
      <button onClick={() => setFilter({ ...filter, materials: ['mesh'] })}>set-mat</button>
      <button onClick={() => setFilter({ ...filter, headrestAdjustment: ['none', '3D'] })}>set-headrest</button>
      <button onClick={resetFilter}>reset</button>
    </div>
  )
}

describe('FilterContext', () => {
  beforeEach(() => localStorage.clear())

  it('initializes with empty materials', () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    expect(screen.getByTestId('mat').textContent).toBe('')
  })

  it('updates filter', async () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    await userEvent.click(screen.getByText('set-mat'))
    expect(screen.getByTestId('mat').textContent).toBe('mesh')
  })

  it('resets filter', async () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    await userEvent.click(screen.getByText('set-mat'))
    await userEvent.click(screen.getByText('reset'))
    expect(screen.getByTestId('mat').textContent).toBe('')
  })

  it('initializes with empty headrestAdjustment', () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    expect(screen.getByTestId('headrest').textContent).toBe('')
  })

  it('updates headrestAdjustment', async () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    await userEvent.click(screen.getByText('set-headrest'))
    expect(screen.getByTestId('headrest').textContent).toBe('none,3D')
  })

  it('resets headrestAdjustment', async () => {
    render(<FilterProvider><Widget /></FilterProvider>)
    await userEvent.click(screen.getByText('set-headrest'))
    await userEvent.click(screen.getByText('reset'))
    expect(screen.getByTestId('headrest').textContent).toBe('')
  })
})
