import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import type { Book } from '@/data/mockBooks'
import { useRdv } from '@/contexts/RdvContext'

/* ── Animation ── */
const popIn = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

/* ── Overlay transparent pour fermer au clic extérieur ── */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
`

/* ── Panel principal ── */
const Panel = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: 280px;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(28, 58, 95, 0.14);
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 8px 32px rgba(28, 58, 95, 0.18), 0 2px 8px rgba(28, 58, 95, 0.08);
  z-index: 9999;
  overflow: hidden;
  animation: ${popIn} 0.18s ease;
`

/* ── Sections ── */
const PanelHeader = styled.div`
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(28, 58, 95, 0.08);
`

const BookTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 2px;
`

const BookAuthors = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const QtySection = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid rgba(28, 58, 95, 0.08);
`

const QtyLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 10px;
`

const QtyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
`

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gray[100]};
  padding: 2px 4px;
`

const QtyBtn = styled.button`
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.success};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.12s;

  &:hover { opacity: 0.7; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`

const QtyValue = styled.span`
  min-width: 32px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

/* ── Actions ── */
const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 14px 12px;
`

const CancelBtn = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gray[400]};
    background: ${({ theme }) => theme.colors.gray[100]};
  }
`

const ConfirmBtn = styled.button`
  flex: 2;
  padding: 8px 12px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.navy};
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s, transform 0.1s;

  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
  &:active { transform: scale(0.97); }
`

/* ── Icône check SVG ── */
function IconCheck() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/* ── Props ── */
interface RdvPopupProps {
  book: Book
  anchorRect: DOMRect
  onClose: () => void
}

export function RdvPopup({ book, anchorRect, onClose }: RdvPopupProps) {
  const { addToRdv, isInRdv, getQty } = useRdv()

  const alreadyIn = isInRdv(book.id)
  const currentQty = getQty(book.id)

  const [qty, setQty] = useState(alreadyIn && currentQty > 0 ? currentQty : 1)

  const panelRef = useRef<HTMLDivElement>(null)

  /* ── Calcul de position ── */
  const gap = 8
  const panelW = 280
  const panelH = 210

  let top  = anchorRect.bottom + gap
  let left = anchorRect.left

  if (typeof window !== 'undefined') {
    if (left + panelW > window.innerWidth - 16) left = window.innerWidth - panelW - 16
    if (left < 8) left = 8
    if (top + panelH > window.innerHeight - 8) {
      top = anchorRect.top - panelH - gap
      if (top < 8) top = 8
    }
  }

  /* ── Fermer à Escape ── */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  /* ── Confirmation ── */
  function handleConfirm() {
    addToRdv(book, qty)
    onClose()
  }

  return createPortal(
    <>
      <Backdrop onClick={onClose} />
      <Panel
        ref={panelRef}
        $top={top}
        $left={left}
        role="dialog"
        aria-modal="true"
        aria-label="Ajouter à la sélection RDV"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Livre ── */}
        <PanelHeader>
          <BookTitle>{book.title}</BookTitle>
          {book.authors.length > 0 && (
            <BookAuthors>{book.authors.join(', ')}</BookAuthors>
          )}
        </PanelHeader>

        {/* ── Quantité ── */}
        <QtySection>
          <QtyLabel>Quantité souhaitée</QtyLabel>
          <QtyRow>
            <QtyControl>
              <QtyBtn
                onClick={e => { e.stopPropagation(); setQty(q => Math.max(1, q - 1)) }}
                disabled={qty <= 1}
                aria-label="Diminuer la quantité"
              >
                −
              </QtyBtn>
              <QtyValue aria-live="polite" aria-atomic="true">{qty}</QtyValue>
              <QtyBtn
                onClick={e => { e.stopPropagation(); setQty(q => q + 1) }}
                aria-label="Augmenter la quantité"
              >
                +
              </QtyBtn>
            </QtyControl>
          </QtyRow>
        </QtySection>

        {/* ── Boutons ── */}
        <ActionsRow>
          <CancelBtn onClick={e => { e.stopPropagation(); onClose() }}>
            Annuler
          </CancelBtn>
          <ConfirmBtn onClick={e => { e.stopPropagation(); handleConfirm() }}>
            <IconCheck />
            {alreadyIn ? 'Mettre à jour' : 'Ajouter à ma sélection'}
          </ConfirmBtn>
        </ActionsRow>
      </Panel>
    </>,
    document.body
  )
}
