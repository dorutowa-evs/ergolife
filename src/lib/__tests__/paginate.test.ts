import { paginate, getPageNumbers } from '../paginate'

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)

  it('returns correct slice for page 1', () => {
    expect(paginate(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('returns correct slice for page 3', () => {
    expect(paginate(items, 3, 10)).toEqual([21, 22, 23, 24, 25])
  })

  it('returns empty for out-of-bounds page', () => {
    expect(paginate(items, 5, 10)).toEqual([])
  })
})

describe('getPageNumbers', () => {
  it('returns all pages when total <= 5', () => {
    expect(getPageNumbers(3, 4)).toEqual([1, 2, 3, 4])
  })

  it('shows ellipsis at end when current page is near start', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, '...', 10])
  })

  it('shows ellipsis at both ends when current page is in middle', () => {
    expect(getPageNumbers(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10])
  })

  it('shows ellipsis at start when current page is near end', () => {
    expect(getPageNumbers(9, 10)).toEqual([1, '...', 8, 9, 10])
  })

  it('clamps page to valid range', () => {
    expect(getPageNumbers(1, 10)[0]).toBe(1)
  })
})
