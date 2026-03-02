import { renderHook, act, waitFor } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns initial value before mount effect runs', () => {
    const { result } = renderHook(() => useLocalStorage('key', 42))
    expect(result.current[0]).toBe(42)
  })

  it('reads existing localStorage value after mount', async () => {
    localStorage.setItem('key', '"hello"')
    const { result } = renderHook(() => useLocalStorage('key', ''))
    await waitFor(() => expect(result.current[0]).toBe('hello'))
  })

  it('persists value to localStorage on set', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0))
    act(() => result.current[1](99))
    expect(localStorage.getItem('key')).toBe('99')
    expect(result.current[0]).toBe(99)
  })

  it('falls back to initial value on invalid JSON', async () => {
    localStorage.setItem('key', 'INVALID_JSON')
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    await waitFor(() => expect(result.current[0]).toBe('default'))
  })
})
