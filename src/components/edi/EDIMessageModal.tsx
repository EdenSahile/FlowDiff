import styled from 'styled-components'
import type { EDIMessage } from '@/lib/ediUtils'
import { formatEDITypeLabel, formatEDIStatusLabel } from '@/lib/ediUtils'

interface Props {
  message: EDIMessage | null
  onClose: () => void
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const TypeLabel = styled.span`
  font-size: 0.9375rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
`

const DocRef = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`

const StatusBadge = styled.span<{ $status: string }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: ${({ $status, theme }) =>
    $status === 'ERROR'   ? '#FDECEA' :
    $status === 'PENDING' ? theme.colors.accentLight :
    theme.colors.primaryLight};
  color: ${({ $status, theme }) =>
    $status === 'ERROR'   ? theme.colors.error :
    $status === 'PENDING' ? '#8B6914' :
    theme.colors.success};
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  line-height: 1;
  padding: 4px;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: ${({ theme }) => theme.colors.gray[50]};
`

const Pre = styled.pre`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: pre-wrap;
  word-break: break-all;
`

const ModalFooter = styled.div`
  padding: 12px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  justify-content: flex-end;
`

const BtnClose = styled.button`
  padding: 8px 20px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

export function EDIMessageModal({ message, onClose }: Props) {
  if (!message) return null

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <TypeLabel>{formatEDITypeLabel(message.type)}</TypeLabel>
            <DocRef>{message.documentRef}</DocRef>
            <StatusBadge $status={message.status}>
              {formatEDIStatusLabel(message.status)}
            </StatusBadge>
          </ModalTitle>
          <CloseBtn onClick={onClose} aria-label="Fermer">×</CloseBtn>
        </ModalHeader>
        <ModalBody>
          <Pre>{JSON.stringify(message.payload, null, 2)}</Pre>
        </ModalBody>
        <ModalFooter>
          <BtnClose onClick={onClose}>Fermer</BtnClose>
        </ModalFooter>
      </Modal>
    </Overlay>
  )
}
