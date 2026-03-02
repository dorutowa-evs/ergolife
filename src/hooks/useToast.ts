import { toast } from 'sonner'

export function useToast() {
  const showToast = (message: string) => toast(message)
  return { showToast }
}
