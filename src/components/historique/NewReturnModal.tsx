import { useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { useReturns } from '@/contexts/ReturnsContext'
import { useToast } from '@/contexts/ToastContext'
import type { Order } from '@/data/mockOrders'
import { RETURN_REASON_LABELS, type ReturnReason, type ReturnItem } from '@/data/mockReturns'

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`
const slideUp = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`

const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  z-index: 1000; display: flex; align-items: flex-end; justify-content: center;
  padding: 0; animation: ${fadeIn} 0.15s ease;
  @media (min-width: 600px) { align-items: center; padding: ${({ theme }) => theme.spacing.md}; }
`

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl} ${({ theme }) => theme.radii.xl} 0 0;
  width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto;
  animation: ${slideUp} 0.2s ease;
  @media (min-width: 600px) { border-radius: ${({ theme }) => theme.radii.xl}; }
`

const PanelHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  position: sticky; top: 0; background: ${({ theme }) => theme.colors.white}; z-index: 1;
`

const PanelTitle = styled.h2`
  margin: 0; font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const CloseBtn = styled.button`
  background: none; border: none; cursor: pointer; font-size: 20px; line-height: 1;
  color: ${({ theme }) => theme.colors.gray[400]}; padding: 4px;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacing.lg};
`

const Section = styled.div`
  display: flex; flex-direction: column; gap: ${({ theme }) => theme.spacing.sm};
`

const SectionTitle = styled.h3`
  margin: 0; font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-transform: uppercase; letter-spacing: 0.06em;
`

const SelectStyled = styled.select`
  width: 100%; padding: 10px 30px 10px 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background-color: ${({ theme }) => theme.colors.white};
  appearance: none; cursor: pointer;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`

const ItemCheckRow = styled.label<{ $checked: boolean }>`
  display: flex; align-items: flex-start; gap: ${({ theme }) => theme.spacing.sm};
  padding: 10px 12px;
  border: 1.5px solid ${({ $checked, theme }) => $checked ? theme.colors.success : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer; transition: border-color 0.15s;
  background: ${({ $checked, theme }) => $checked ? theme.colors.navyLight : theme.colors.white};
`

const ItemCheckbox = styled.input`
  margin-top: 2px; cursor: pointer; accent-color: ${({ theme }) => theme.colors.success};
  width: 16px; height: 16px; flex-shrink: 0;
`

const ItemInfo = styled.div`
  flex: 1;
`

const ItemTitleText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
`

const ItemMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs}; color: ${({ theme }) => theme.colors.gray[400]};
`

const ReasonTags = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;
`

const Tag = styled.button<{ $active: boolean }>`
  padding: 4px 12px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.success : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background: ${({ $active, theme }) => $active ? theme.colors.navyLight : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.success : theme.colors.gray[600]};
  cursor: pointer; transition: all 0.1s;
`

const Textarea = styled.textarea`
  width: 100%; padding: 10px 12px; min-height: 80px; resize: vertical;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
`

const InfoNote = styled.div`
  background: ${({ theme }) => theme.colors.accentLight};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: #8B6914; display: flex; align-items: flex-start; gap: 8px;
`

const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%; padding: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white; border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: ${({ $loading }) => $loading ? 'not-allowed' : 'pointer'};
  opacity: ${({ $loading }) => $loading ? 0.7 : 1};
  transition: background 0.15s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primaryHover}; }
`

const RETURN_REASONS = Object.keys(RETURN_REASON_LABELS) as ReturnReason[]
const ELIGIBLE_STATUSES = new Set(['facturé', 'expédié'])

function formatEur(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}

interface ItemSelectionState {
  checked: boolean
  reason: ReturnReason | null
}

interface NewReturnModalProps {
  orders: Order[]
  preselectedOrderId: string | null
  codeClient: string
  onClose: () => void
  onSuccess: () => void
}

export function NewReturnModal({ orders, preselectedOrderId, codeClient, onClose, onSuccess }: NewReturnModalProps) {
  const { addReturn } = useReturns()
  const { showToast } = useToast()

  const eligibleOrders = orders.filter(o => ELIGIBLE_STATUSES.has(o.status))

  const [selectedOrderId, setSelectedOrderId] = useState<string>(preselectedOrderId ?? eligibleOrders[0]?.id ?? '')
  const [itemStates, setItemStates] = useState<Record<string, ItemSelectionState>>({})
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedOrder = eligibleOrders.find(o => o.id === selectedOrderId)

  function handleOrderChange(id: string) {
    setSelectedOrderId(id)
    setItemStates({})
  }

  function toggleItem(isbn: string) {
    setItemStates(prev => ({
      ...prev,
      [isbn]: { checked: !prev[isbn]?.checked, reason: prev[isbn]?.reason ?? null },
    }))
  }

  function setReason(isbn: string, reason: ReturnReason) {
    setItemStates(prev => ({
      ...prev,
      [isbn]: { ...prev[isbn], checked: true, reason },
    }))
  }

  const checkedItems = selectedOrder?.items.filter(i => itemStates[i.isbn]?.checked) ?? []
  const allHaveReasons = checkedItems.length > 0 && checkedItems.every(i => itemStates[i.isbn]?.reason != null)

  async function handleSubmit() {
    if (!selectedOrder || !allHaveReasons) return
    setSubmitting(true)

    const returnItems: ReturnItem[] = checkedItems.map(i => ({
      orderItemIsbn: i.isbn,
      title: i.title,
      qty: i.quantity,
      unitPrice: i.unitPriceHT,
      reason: itemStates[i.isbn].reason!,
    }))

    await addReturn({
      codeClient,
      orderId: selectedOrder.id,
      orderNumero: selectedOrder.numero,
      items: returnItems,
      notes: notes.trim() || null,
    })

    showToast('Demande de retour envoyée', 'success')
    setSubmitting(false)
    onClose()
    onSuccess()
  }

  return createPortal(
    <Backdrop onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <Panel>
        <PanelHeader>
          <PanelTitle>Nouvelle demande de retour</PanelTitle>
          <CloseBtn onClick={onClose} aria-label="Fermer">×</CloseBtn>
        </PanelHeader>

        <Body>
          <Section>
            <SectionTitle>1. Commande concernée</SectionTitle>
            <SelectStyled
              value={selectedOrderId}
              onChange={e => handleOrderChange(e.target.value)}
            >
              {eligibleOrders.map(o => (
                <option key={o.id} value={o.id}>{o.numero} — {o.status}</option>
              ))}
            </SelectStyled>
          </Section>

          {selectedOrder && (
            <Section>
              <SectionTitle>2. Articles à retourner</SectionTitle>
              {selectedOrder.items.map(item => {
                const state = itemStates[item.isbn] ?? { checked: false, reason: null }
                return (
                  <div key={item.isbn}>
                    <ItemCheckRow $checked={state.checked}>
                      <ItemCheckbox
                        type="checkbox"
                        checked={state.checked}
                        onChange={() => toggleItem(item.isbn)}
                      />
                      <ItemInfo>
                        <ItemTitleText>{item.title}</ItemTitleText>
                        <ItemMeta>{item.quantity} ex. · {formatEur(item.unitPriceHT)} HT · ISBN {item.isbn}</ItemMeta>
                      </ItemInfo>
                    </ItemCheckRow>

                    {state.checked && (
                      <div style={{ paddingLeft: '12px', marginTop: '-2px', paddingBottom: '8px' }}>
                        <ReasonTags>
                          {RETURN_REASONS.map(reason => (
                            <Tag
                              key={reason}
                              $active={state.reason === reason}
                              onClick={() => setReason(item.isbn, reason)}
                              type="button"
                            >
                              {RETURN_REASON_LABELS[reason]}
                            </Tag>
                          ))}
                        </ReasonTags>
                      </div>
                    )}
                  </div>
                )
              })}
            </Section>
          )}

          <Section>
            <SectionTitle>3. Commentaire (optionnel)</SectionTitle>
            <Textarea
              placeholder="Précisions supplémentaires…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </Section>

          <InfoNote>
            ℹ️ Un bon de retour vous sera envoyé par email et disponible ici sous 24h ouvrées.
          </InfoNote>

          <SubmitBtn
            $loading={submitting}
            disabled={!allHaveReasons || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Envoi en cours…' : 'Envoyer la demande'}
          </SubmitBtn>
        </Body>
      </Panel>
    </Backdrop>,
    document.body
  )
}
