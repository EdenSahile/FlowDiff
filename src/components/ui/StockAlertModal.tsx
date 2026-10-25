import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import type { StockStatut } from '@/data/mockBooks'

/* ──────────────────────────────────────
   Contenus par statut
─────────────────────────────────────── */
const CONTENT: Record<'sur_commande' | 'en_reimp', {
  title: string
  message: string
  note: string
  confirmLabel: string
}> = {
  sur_commande: {
    title: '🔄 Titre disponible sur commande spéciale',
    message:
      "Cet ouvrage n'est pas en stock. Il sera commandé spécialement auprès de l'éditeur.",
    note: 'Délai estimé : 7 à 15 jours ouvrés.',
    confirmLabel: 'Confirmer la commande',
  },
  en_reimp: {
    title: '🔁 Titre en réimpression',
    message:
      "Cet ouvrage est en cours de réimpression. Il sera enregistré en reliquat et expédié automatiquement dès sa disponibilité.",
    note: "Vous recevrez un email de confirmation à l'expédition.",
    confirmLabel: 'Ajouter en reliquat',
  },
}

/* ──────────────────────────────────────
   Styles
─────────────────────────────────────── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 17, 17, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 10000;
  animation: fade-in 0.15s ease;

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  width: 100%;
  max-width: 440px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  font-family: ${({ theme }) => theme.typography.fontFamily};
  animation: slide-up 0.2s ease;

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

const Title = styled.h2`
  margin: 0 0 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.3;
`

const Message = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.65;
`

const Note = styled.p`
  margin: 0 0 20px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.65;
`

const Actions = styled.div`
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`

const ConfirmBtn = styled.button`
  flex: 1 1 auto;
  min-height: 40px;
  padding: 0 16px;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:active { transform: scale(0.98); }
`

const CancelBtn = styled.button`
  flex: 1 1 auto;
  min-height: 40px;
  padding: 0 16px;
  background: transparent;
  color: ${({ theme }) => theme.colors.gray[600]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
`

/* ──────────────────────────────────────
   Component
─────────────────────────────────────── */
interface Props {
  open: boolean
  statut: StockStatut
  onConfirm: () => void
  onCancel: () => void
}

export function StockAlertModal({ open, statut, onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null
  if (statut !== 'sur_commande' && statut !== 'en_reimp') return null

  const { title, message, note, confirmLabel } = CONTENT[statut]

  return createPortal(
    <Overlay onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="stock-alert-title">
      <Panel onClick={e => e.stopPropagation()}>
        <Title id="stock-alert-title">{title}</Title>
        <Message>{message}</Message>
        <Note>{note}</Note>
        <Actions>
          <ConfirmBtn onClick={onConfirm} autoFocus>{confirmLabel}</ConfirmBtn>
          <CancelBtn onClick={onCancel}>Annuler</CancelBtn>
        </Actions>
      </Panel>
    </Overlay>,
    document.body,
  )
}
