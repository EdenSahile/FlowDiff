import React, { useState } from 'react'
import styled from 'styled-components'
import {
  groupDESADVByOrder,
  type EDIMessage,
  type DesadvGroup,
  type DESADVPayload,
  type DesadvDeliveryStatus,
} from '@/lib/ediUtils'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function linesSummary(lines: DESADVPayload['lines']): string {
  return lines.map(l => `…${l.isbn.slice(-3)} ×${l.qtyShipped}`).join(' · ')
}

/* ─── Styled ─────────────────────────────────────────── */
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
`
const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[600]};
  border-bottom: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  white-space: nowrap;
`
const Td = styled.td`
  padding: 10px;
  color: ${({ theme }) => theme.colors.navy};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  vertical-align: middle;
`
const GroupTr = styled.tr`
  cursor: pointer;
  background: ${({ theme }) => theme.colors.gray[50]};
  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
`
const SubTr = styled.tr`
  background: ${({ theme }) => theme.colors.white};
`
const TreeTd = styled.td`
  width: 28px;
  padding: 10px;
  color: ${({ theme }) => theme.colors.gray[200]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  font-size: 0.875rem;
  vertical-align: middle;
`
const Mono = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.75rem;
`
const SubDetail = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[600]};
`
const ExpandIcon = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  user-select: none;
`
const DeliveryBadge = styled.span<{ $status: DesadvDeliveryStatus }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: ${({ $status, theme }) =>
    $status === 'SOLDE' ? theme.colors.primaryLight : '#FFF7ED'};
  color: ${({ $status, theme }) =>
    $status === 'SOLDE' ? theme.colors.success : '#C2410C'};
`
const ProgressMono = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.navy};
`
const EyeBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 1rem;
  padding: 4px;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`
const UngroupedLabel = styled.div`
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 16px 10px 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  margin-top: 8px;
`

/* ─── Helpers ────────────────────────────────────────── */
function sumShipped(g: DesadvGroup) {
  return g.lines.reduce((s, l) => s + l.qtyShippedTotal, 0)
}
function sumConfirmed(g: DesadvGroup) {
  return g.lines.reduce((s, l) => s + l.qtyConfirmed, 0)
}

/* ─── Composant ──────────────────────────────────────── */
interface Props {
  messages: EDIMessage[]
  onSelect: (msg: EDIMessage) => void
  isbnFilter?: string
}

export function DesadvGroupedList({ messages, onSelect, isbnFilter }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const { grouped, ungrouped } = groupDESADVByOrder(messages)

  const isOpen = (orderId: string) =>
    isbnFilter ? true : expanded.has(orderId)

  function toggle(orderId: string) {
    if (isbnFilter) return
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(orderId) ? next.delete(orderId) : next.add(orderId)
      return next
    })
  }

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th style={{ width: 28 }} />
            <Th>N° commande</Th>
            <Th>Livraisons</Th>
            <Th>Expédiés / Confirmés</Th>
            <Th>Statut</Th>
          </tr>
        </thead>
        <tbody>
          {grouped.length === 0 ? (
            <tr>
              <Td colSpan={5} style={{ textAlign: 'center', color: '#6B6B68', padding: '24px' }}>
                {isbnFilter ? 'Aucun message disponible.' : 'Aucune expédition liée à une commande.'}
              </Td>
            </tr>
          ) : grouped.map(group => {
            return (
              <React.Fragment key={group.orderId}>
                <GroupTr onClick={() => toggle(group.orderId)}>
                  <Td><ExpandIcon>{isOpen(group.orderId) ? '▼' : '▶'}</ExpandIcon></Td>
                  <Td><Mono>{group.orderId}</Mono></Td>
                  <Td>{group.desadvs.length} DESADV</Td>
                  <Td>
                    <ProgressMono>
                      {sumShipped(group)} / {sumConfirmed(group)} ex.
                    </ProgressMono>
                  </Td>
                  <Td>
                    <DeliveryBadge $status={group.globalStatus}>
                      {group.globalStatus === 'SOLDE' ? 'Soldé' : 'En cours'}
                    </DeliveryBadge>
                  </Td>
                </GroupTr>

                {isOpen(group.orderId) && group.desadvs.map(desadv => {
                  const p = desadv.payload as DESADVPayload
                  return (
                    <SubTr key={desadv.id}>
                      <TreeTd>└</TreeTd>
                      <Td><Mono>{fmtDate(desadv.createdAt)} {fmtTime(desadv.createdAt)}</Mono></Td>
                      <Td><Mono>{desadv.documentRef}</Mono></Td>
                      <Td><SubDetail>{linesSummary(p.lines)}</SubDetail></Td>
                      <Td>
                        <EyeBtn
                          onClick={e => { e.stopPropagation(); onSelect(desadv) }}
                          aria-label="Voir le message"
                        >
                          👁
                        </EyeBtn>
                      </Td>
                    </SubTr>
                  )
                })}
              </React.Fragment>
            )
          })}
        </tbody>
      </Table>

      {ungrouped.length > 0 && (
        <>
          <UngroupedLabel>DESADV non rattachés à une commande</UngroupedLabel>
          <Table>
            <tbody>
              {ungrouped.map(msg => (
                <tr key={msg.id}>
                  <Td style={{ width: 28 }} />
                  <Td><Mono>{fmtDate(msg.createdAt)} {fmtTime(msg.createdAt)}</Mono></Td>
                  <Td><Mono>{msg.documentRef}</Mono></Td>
                  <Td><SubDetail>{msg.detail}</SubDetail></Td>
                  <Td>
                    <EyeBtn onClick={() => onSelect(msg)} aria-label="Voir le message">
                      👁
                    </EyeBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  )
}
