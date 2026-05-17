import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'

interface AdminModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

export function AdminModal({ title, onClose, children, width = 560 }: AdminModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <Overlay onClick={onClose}>
      <Panel $width={width} onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <CloseBtn onClick={onClose} aria-label="Fermer">×</CloseBtn>
        </Header>
        <Body>{children}</Body>
      </Panel>
    </Overlay>,
    document.body
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`

const Panel = styled.div<{ $width: number }>`
  background: ${adminColors.surface};
  border-radius: 12px;
  width: 100%;
  max-width: ${({ $width }) => $width}px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.20);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${adminColors.border};
  position: sticky;
  top: 0;
  background: ${adminColors.surface};
  z-index: 1;
`

const Title = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${adminColors.textPrimary};
  margin: 0;
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: ${adminColors.textSecondary};
  padding: 0;
  &:hover { color: ${adminColors.textPrimary}; }
`

const Body = styled.div`
  padding: 24px;
`
