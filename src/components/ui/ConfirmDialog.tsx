import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
  padding: 16px;
`

const Dialog = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 360px;
  width: 100%;
  box-shadow: none;
`

const DialogTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const DialogText = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const DialogActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`

const DialogBtn = styled.button<{ $destructive?: boolean }>`
  padding: 0 ${({ theme }) => theme.spacing.lg};
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  cursor: pointer;
  border: none;
  transition: background .15s, color .15s;
  background: ${({ $destructive, theme }) => $destructive ? theme.colors.error : theme.colors.gray[100]};
  color: ${({ $destructive, theme }) => $destructive ? '#fff' : theme.colors.gray[600]};
  &:hover { opacity: 0.88; }
  &:focus-visible {
    outline: 2px solid ${({ $destructive, theme }) => $destructive ? theme.colors.error : theme.colors.navy};
    outline-offset: 2px;
  }
`

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel  = 'Annuler',
  destructive  = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <Overlay onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <Dialog onClick={e => e.stopPropagation()}>
        <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
        <DialogText>{message}</DialogText>
        <DialogActions>
          <DialogBtn onClick={onCancel}>{cancelLabel}</DialogBtn>
          <DialogBtn $destructive={destructive} ref={confirmRef} onClick={() => { onConfirm(); onCancel() }}>
            {confirmLabel}
          </DialogBtn>
        </DialogActions>
      </Dialog>
    </Overlay>,
    document.body
  )
}
