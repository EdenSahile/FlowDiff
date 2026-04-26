import styled from 'styled-components'
import type { EDIMessage } from '@/lib/ediUtils'
import {
  formatEDITypeLabel,
  getBusinessStatus,
  generateEdifactPlaceholder,
} from '@/lib/ediUtils'

interface Props {
  message: EDIMessage
  onClose: () => void
}

/* ── Container ── */
const Container = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  width: 100%;
  max-width: 860px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`

/* ── Header ── */
const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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

const BusinessBadge = styled.span<{ $type: string }>`
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: ${({ $type, theme }) =>
    $type === 'ORDERS' ? theme.colors.accentLight : theme.colors.primaryLight};
  color: ${({ $type, theme }) =>
    $type === 'ORDERS' ? '#8B6914' : theme.colors.success};
`

const MsgId = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[400]};
  line-height: 1;
  padding: 4px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

/* ── Body split ── */
const Body = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 400px;
  overflow: hidden;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const PaneHeader = styled.div`
  padding: 8px 14px;
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const JsonPane = styled.div`
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${PaneHeader} {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  }
`

const EdifactPane = styled.div`
  background: #000000;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  ${PaneHeader} {
    background: #111;
    color: #00FF41;
    border-bottom: 1px solid #1a1a1a;
  }
`

const JsonPre = styled.pre`
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 14px;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.navy};
  background: ${({ theme }) => theme.colors.gray[50]};
  white-space: pre-wrap;
  word-break: break-all;
`

const EdifactPre = styled.pre`
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 14px;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 0.8125rem;
  color: #00FF41;
  background: #000000;
  white-space: pre-wrap;
  word-break: break-all;
`

/* ── Footer ── */
const Footer = styled.div`
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

export function EDIViewer({ message, onClose }: Props) {
  return (
    <Container onClick={e => e.stopPropagation()}>
      <Header>
        <HeaderLeft>
          <TitleRow>
            <TypeLabel>{formatEDITypeLabel(message.type)}</TypeLabel>
            <DocRef>{message.documentRef}</DocRef>
            <BusinessBadge $type={message.type}>
              {getBusinessStatus(message.type)}
            </BusinessBadge>
          </TitleRow>
          <MsgId>ID : {message.id}</MsgId>
        </HeaderLeft>
        <CloseBtn onClick={onClose} aria-label="Fermer">×</CloseBtn>
      </Header>

      <Body>
        <JsonPane>
          <PaneHeader>Données métier</PaneHeader>
          <JsonPre>{JSON.stringify(message.payload, null, 2)}</JsonPre>
        </JsonPane>
        <EdifactPane>
          <PaneHeader>Message EDIFACT</PaneHeader>
          <EdifactPre>{generateEdifactPlaceholder(message)}</EdifactPre>
        </EdifactPane>
      </Body>

      <Footer>
        <BtnClose onClick={onClose}>Fermer</BtnClose>
      </Footer>
    </Container>
  )
}
