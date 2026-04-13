import { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes, css } from 'styled-components'

/* ── Animation ── */
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px) translateX(-50%); }
  to   { opacity: 1; transform: translateY(0)     translateX(-50%); }
`

const slideUp = keyframes`
  from { opacity: 1; transform: translateY(0)     translateX(-50%); }
  to   { opacity: 0; transform: translateY(-20px) translateX(-50%); }
`

const ToastBox = styled.div<{ $leaving: boolean }>`
  position: fixed;
  top: 72px;           /* sous le header fixe */
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.radii.full};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  white-space: nowrap;
  pointer-events: none;

  animation: ${({ $leaving }) => css`${$leaving ? slideUp : slideDown} .25s ease forwards`};
`

/* ── Context ── */
interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

interface ToastState {
  id: number
  message: string
  leaving: boolean
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string) => {
    const id = Date.now()
    setToast({ id, message, leaving: false })

    /* Déclenche l'animation de sortie 200ms avant la fin */
    setTimeout(() => setToast(t => t?.id === id ? { ...t, leaving: true } : t), 2800)
    setTimeout(() => setToast(t => t?.id === id ? null : t), 3100)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && createPortal(
        <ToastBox $leaving={toast.leaving}>
          ✓ {toast.message}
        </ToastBox>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être dans <ToastProvider>')
  return ctx
}
