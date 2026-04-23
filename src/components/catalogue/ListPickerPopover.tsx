import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import type { Book } from '@/data/mockBooks'
import { useWishlist } from '@/contexts/WishlistContext'
import { wishlistNameSchema } from '@/lib/formSchemas'

const popIn = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const Panel = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: 268px;
  background: #fff;
  border: 1.5px solid rgba(28, 58, 95, 0.14);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(28, 58, 95, 0.18), 0 2px 8px rgba(28, 58, 95, 0.08);
  z-index: 9999;
  overflow: hidden;
  animation: ${popIn} 0.18s ease;
`

const PanelHeader = styled.div`
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(28, 58, 95, 0.08);
`

const PanelTitle = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 8px;
`

const NameInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 7px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.navy};
  background: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;

  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
  &:focus { border-color: ${({ theme }) => theme.colors.navy}; }
`

const ListsArea = styled.div`
  max-height: 200px;
  overflow-y: auto;
  padding: 6px 0;
`

const EmptyMsg = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
  padding: 10px 14px;
  font-style: italic;
`

const ListRow = styled.button<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 14px;
  background: ${({ $checked }) => $checked ? 'rgba(28,58,95,0.05)' : 'transparent'};
  border: none;
  border-left: 2.5px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  font-family: ${({ theme }) => theme.typography.fontFamily};

  &:hover { background: rgba(28, 58, 95, 0.06); }
`

const CheckCircle = styled.span<{ $checked: boolean }>`
  width: 18px; height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid ${({ $checked, theme }) =>
    $checked ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.navy : 'transparent'};
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
`

const CheckMark = styled.span`
  color: #fff;
  font-size: 10px;
  line-height: 1;
`

const ListName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ListCount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  flex-shrink: 0;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(28, 58, 95, 0.08);
  margin: 2px 0;
`

const CreateArea = styled.div`
  padding: 10px 14px 12px;
`

const CreateLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 7px;
`

const CreateRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const CreateInputRow = styled.div`
  display: flex;
  gap: 6px;
`

const CreateInput = styled.input`
  flex: 1;
  padding: 7px 10px;
  border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 7px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.navy};
  background: #fff;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
  &:focus { border-color: ${({ theme }) => theme.colors.navy}; }
`

const CreateBtn = styled.button`
  padding: 7px 12px;
  border: none;
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover { background: #25477A; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

interface Props {
  book: Book
  anchorRect: DOMRect
  onClose: () => void
}

export function ListPickerPopover({ book, anchorRect, onClose }: Props) {
  const { lists, createList, addToList, removeFromList, isInList, currentUserName, setCurrentUserName } = useWishlist()
  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState('')
  const [userName, setUserName] = useState(currentUserName)
  const panelRef = useRef<HTMLDivElement>(null)
  const nameRef  = useRef<HTMLInputElement>(null)

  /* Position : sous l'ancre, repositionné si déborde */
  const gap = 8
  const panelH = 340
  let top  = anchorRect.bottom + gap
  let left = anchorRect.left

  if (typeof window !== 'undefined') {
    if (left + 268 > window.innerWidth - 8) left = window.innerWidth - 268 - 8
    if (left < 8) left = 8
    if (top + panelH > window.innerHeight - 8) {
      top = anchorRect.top - panelH - gap
      if (top < 8) top = 8
    }
  }

  /* Fermer au clic extérieur */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  /* Fermer à Escape */
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  /* Focus name input on open */
  useEffect(() => { nameRef.current?.focus() }, [])

  function saveName(name: string) {
    setUserName(name)
    setCurrentUserName(name)
  }

  /* Clic sur une liste :
     - déjà dans la liste → retire (popover reste ouvert pour gérer d'autres listes)
     - sinon              → ajoute immédiatement et ferme */
  function handleListClick(listId: string) {
    if (isInList(listId, book.id)) {
      removeFromList(listId, book.id)
    } else {
      addToList(listId, book, userName.trim() || undefined)
      onClose()
    }
  }

  /* Enter dans le champ nouvelle liste → crée et ajoute */
  function handleCreateKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate()
  }

  function handleCreate() {
    const validation = wishlistNameSchema.safeParse(newName)
    if (!validation.success) {
      setNameError(validation.error.issues[0].message)
      return
    }
    setNameError('')
    const created = createList(validation.data)
    addToList(created.id, book, userName.trim() || undefined)
    setNewName('')
    onClose()
  }

  return createPortal(
    <Panel ref={panelRef} $top={top} $left={left} onMouseDown={e => e.stopPropagation()}>
      <PanelHeader>
        <PanelTitle>Votre prénom</PanelTitle>
        <NameInput
          ref={nameRef}
          type="text"
          placeholder="Ex : Marie (optionnel)"
          value={userName}
          onChange={e => saveName(e.target.value)}
          aria-label="Votre prénom"
        />
      </PanelHeader>

      <ListsArea>
        {lists.length === 0 ? (
          <EmptyMsg>Aucune liste — créez-en une ci-dessous</EmptyMsg>
        ) : (
          lists.map(list => {
            const checked = isInList(list.id, book.id)
            return (
              <ListRow
                key={list.id}
                $checked={checked}
                onClick={() => handleListClick(list.id)}
                aria-pressed={checked}
              >
                <CheckCircle $checked={checked}>
                  {checked && <CheckMark>✓</CheckMark>}
                </CheckCircle>
                <ListName>{list.name}</ListName>
                <ListCount>{list.items.length} titre{list.items.length !== 1 ? 's' : ''}</ListCount>
              </ListRow>
            )
          })
        )}
      </ListsArea>

      <Divider />

      <CreateArea>
        <CreateLabel>Créer une nouvelle liste</CreateLabel>
        <CreateRow>
          <CreateInputRow>
            <CreateInput
              type="text"
              placeholder="Ex : Saint-Valentin…"
              value={newName}
              onChange={e => { setNewName(e.target.value); setNameError('') }}
              onKeyDown={handleCreateKeyDown}
            />
            <CreateBtn onClick={handleCreate} disabled={!newName.trim()}>
              +
            </CreateBtn>
          </CreateInputRow>
          {nameError && (
            <span style={{ fontSize: 11, color: '#C0392B', paddingLeft: 2 }}>{nameError}</span>
          )}
        </CreateRow>
      </CreateArea>
    </Panel>,
    document.body
  )
}
