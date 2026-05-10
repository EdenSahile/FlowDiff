import styled from 'styled-components'
import type { EDIMessage } from '@/lib/ediUtils'
import { EDIViewer } from '@/components/edi/EDIViewer'

interface Props {
  message: EDIMessage | null
  onClose: () => void
  isPartial?: boolean
  onMarkSeen?: () => void
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

export function EDIMessageModal({ message, onClose, isPartial, onMarkSeen }: Props) {
  if (!message) return null
  return (
    <Overlay onClick={onClose}>
      <EDIViewer message={message} onClose={onClose} isPartial={isPartial} onMarkSeen={onMarkSeen} />
    </Overlay>
  )
}
