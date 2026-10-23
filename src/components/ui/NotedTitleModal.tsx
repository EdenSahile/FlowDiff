import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

/*
  Pop-in affichée avant d'ajouter un titre à paraître au panier (DEC-001) :
  le libraire est informé que le titre sera enregistré en « noté ».

  Les styles viennent de BookCard, où cette pop-in était définie en double.
  Ils sont repris à l'identique pour ne rien changer visuellement.
*/

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 18, 35, 0.55);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 14px;
  padding: 28px 24px;
  max-width: 340px;
  width: 100%;
  box-shadow: 0 16px 48px rgba(10,18,35,0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
`

const Title = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin: 0;
`

const Message = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
  margin: 0;
`

const ConfirmBtn = styled.button`
  padding: 10px 28px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
  &:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
`

interface Props {
  open: boolean
  /** Texte sous le titre. Les cartes en mode couverture précisent la conservation. */
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

const DEFAULT_MESSAGE = 'Le titre sera enregistré en noté'

export function NotedTitleModal({ open, message = DEFAULT_MESSAGE, onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <Overlay onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="noted-title-title">
      <Panel onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: 28 }}>📅</span>
        <Title id="noted-title-title">Titre à paraître</Title>
        <Message>{message}</Message>
        <ConfirmBtn onClick={onConfirm} autoFocus>OK</ConfirmBtn>
      </Panel>
    </Overlay>,
    document.body,
  )
}
