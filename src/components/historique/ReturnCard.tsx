import styled from 'styled-components'
import { useToast } from '@/contexts/ToastContext'
import type { ReturnRequest, ReturnStatus } from '@/data/mockReturns'
import { RETURN_REASON_LABELS } from '@/data/mockReturns'

const STATUS_CONFIG: Record<ReturnStatus, { label: string; bg: string; text: string }> = {
  pending:     { label: 'En attente',   bg: '#EAEAE6', text: '#555550' },
  in_transit:  { label: 'En transit',   bg: '#FEF3E2', text: '#B65A00' },
  avoir_emis:  { label: 'Avoir émis',   bg: '#EFF4F1', text: '#226241' },
  refused:     { label: 'Refusé',       bg: '#FDECEA', text: '#C0392B' },
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`

const CardHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.navyLight};
`

const ReturnId = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
`

const SubInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
`

const StatusBadge = styled.span<{ $bg: string; $text: string }>`
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  background: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
`

const CardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`

const ItemsList = styled.ul`
  list-style: none; margin: 0 0 ${({ theme }) => theme.spacing.md}; padding: 0;
`

const ItemRow = styled.li`
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  &:last-child { border-bottom: none; }
`

const ItemTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const ItemReason = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-top: 2px;
`

const ItemQty = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  white-space: nowrap; flex-shrink: 0;
`

const DocsBlock = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacing.sm}; flex-wrap: wrap;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const DocBtn = styled.button<{ $disabled?: boolean }>`
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: 1.5px solid ${({ $disabled, theme }) => $disabled ? theme.colors.gray[200] : theme.colors.navy};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ $disabled, theme }) => $disabled ? theme.colors.gray[400] : theme.colors.navy};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};
  transition: background 0.15s;
  &:not([disabled]):hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

const CardFooter = styled.div`
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const RefusalBox = styled.div`
  background: #FDECEA; border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 12px; margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: #C0392B;
`

const ContestBtn = styled.button`
  padding: 7px 14px;
  background: ${({ theme }) => theme.colors.error};
  color: white; border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  &:hover { opacity: 0.9; }
`

const FooterDate = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.gray[400]};
`

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}
function formatEur(val: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}

function openContestEmail(ret: ReturnRequest) {
  const subject = encodeURIComponent(`Contestation retour ${ret.id} : ${ret.orderNumero}`)
  const body = encodeURIComponent(
    `Bonjour,\n\nJe souhaite contester le refus de ma demande de retour ${ret.id} (commande ${ret.orderNumero}).\n\nMotif de refus communiqué : ${ret.refusalReason ?? '—'}\n\nMa contestation :\n\n[Votre message ici]\n\nCordialement`
  )
  window.location.href = `mailto:retours@flowdiff.fr?subject=${subject}&body=${body}`
}

interface ReturnCardProps {
  ret: ReturnRequest
}

export function ReturnCard({ ret }: ReturnCardProps) {
  const { showToast } = useToast()
  const config = STATUS_CONFIG[ret.status]
  const totalQty = ret.items.reduce((s, i) => s + i.qty, 0)

  function handleDownloadBL() {
    showToast(`${ret.blNumber}.pdf téléchargé`, 'success')
  }

  function handleDownloadAvoir() {
    if (!ret.avoirGeneratedAt) return
    showToast(`Avoir_${ret.id}.pdf téléchargé`, 'success')
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <ReturnId>{ret.id}</ReturnId>
          <SubInfo>Commande {ret.orderNumero} · {totalQty} article{totalQty > 1 ? 's' : ''}</SubInfo>
        </div>
        <StatusBadge $bg={config.bg} $text={config.text}>{config.label}</StatusBadge>
      </CardHeader>

      <CardBody>
        <ItemsList>
          {ret.items.map((item, i) => (
            <ItemRow key={i}>
              <div>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemReason>{RETURN_REASON_LABELS[item.reason]}</ItemReason>
              </div>
              <ItemQty>{item.qty} × {formatEur(item.unitPrice)}</ItemQty>
            </ItemRow>
          ))}
        </ItemsList>

        {ret.status === 'refused' && ret.refusalReason && (
          <RefusalBox>
            Motif de refus : {ret.refusalReason}
          </RefusalBox>
        )}

        {ret.blNumber && (
          <DocsBlock>
            <DocBtn onClick={handleDownloadBL}>
              ↓ Télécharger BL
            </DocBtn>
            <DocBtn
              $disabled={!ret.avoirGeneratedAt}
              onClick={handleDownloadAvoir}
              disabled={!ret.avoirGeneratedAt}
              title={ret.avoirGeneratedAt ? undefined : 'Disponible à réception des articles'}
            >
              ↓ Télécharger Avoir
            </DocBtn>
          </DocsBlock>
        )}

        <CardFooter>
          <FooterDate>
            Demande du {formatDate(ret.createdAt)}
            {ret.avoirAmount != null && (
              <> · Avoir : <strong>{formatEur(ret.avoirAmount)}</strong></>
            )}
          </FooterDate>
          {ret.status === 'refused' && (
            <ContestBtn onClick={() => openContestEmail(ret)}>
              ✉ Contester
            </ContestBtn>
          )}
        </CardFooter>
      </CardBody>
    </Card>
  )
}
