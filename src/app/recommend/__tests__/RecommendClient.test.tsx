import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecommendClient } from '../RecommendClient'
import { CompareProvider } from '@/contexts/CompareContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

function Wrapper({ children }: { children: React.ReactNode }) {
  return <TooltipProvider><CompareProvider>{children}<Toaster /></CompareProvider></TooltipProvider>
}

describe('RecommendClient', () => {
  it('renders height and weight inputs', () => {
    render(<RecommendClient />, { wrapper: Wrapper })
    expect(screen.getByLabelText('身高')).toBeInTheDocument()
    expect(screen.getByLabelText('体重')).toBeInTheDocument()
  })

  it('shows guidance text before submission', () => {
    render(<RecommendClient />, { wrapper: Wrapper })
    expect(screen.getByText(/输入你的身体信息/)).toBeInTheDocument()
  })

  it('shows required field error when submitting empty form', async () => {
    render(<RecommendClient />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /查找/}))
    expect(screen.getAllByText('请填写此项').length).toBeGreaterThanOrEqual(2)
  })

  it('shows range error for invalid height', async () => {
    render(<RecommendClient />, { wrapper: Wrapper })
    await userEvent.type(screen.getByLabelText('身高'), '50')
    await userEvent.type(screen.getByLabelText('体重'), '70')
    await userEvent.click(screen.getByRole('button', { name: /查找/ }))
    expect(screen.getByText(/100–220/)).toBeInTheDocument()
  })

  it('shows chair results after valid submission', async () => {
    render(<RecommendClient />, { wrapper: Wrapper })
    await userEvent.type(screen.getByLabelText('身高'), '175')
    await userEvent.type(screen.getByLabelText('体重'), '70')
    await userEvent.click(screen.getByRole('button', { name: /查找/ }))
    const labels = screen.getAllByText(/高度匹配|较匹配|可考虑/)
    expect(labels.length).toBeGreaterThan(0)
  })

  it('shows description text after valid submission', async () => {
    render(<RecommendClient />, { wrapper: Wrapper })
    await userEvent.type(screen.getByLabelText('身高'), '175')
    await userEvent.type(screen.getByLabelText('体重'), '70')
    await userEvent.click(screen.getByRole('button', { name: /查找/ }))
    expect(screen.getByText(/175cm/)).toBeInTheDocument()
  })

  it('shows 推荐结果 heading when at least one chair scores >= 80', async () => {
    render(<RecommendClient />, { wrapper: Wrapper })
    await userEvent.type(screen.getByLabelText('身高'), '175')
    await userEvent.type(screen.getByLabelText('体重'), '70')
    await userEvent.click(screen.getByRole('button', { name: /查找/ }))
    expect(screen.queryByText('推荐结果')).toBeInTheDocument()
    expect(screen.queryByText(/相对接近/)).not.toBeInTheDocument()
  })
})
