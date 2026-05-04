import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useNotifications } from '@/contexts/NotificationsContext'
import type { NotifId } from '@/contexts/NotificationsContext'
import { theme } from '@/lib/theme'

/* ── Styled components ── */

const Wrapper = styled.div`
  position: relative;
`

const BellBtn = styled.button<{ $active: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid ${({ $active }) => $active ? theme.colors.accent : 'rgba(255,255,255,.2)'};
  background: ${({ $active }) => $active ? 'rgba(201,168,76,.12)' : 'rgba(255,255,255,.08)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  color: ${({ $active }) => $active ? theme.colors.accent : 'rgba(255,255,255,.7)'};
  &:hover {
    border-color: ${theme.colors.accent};
    background: rgba(201,168,76,.15);
    color: ${theme.colors.accent};
  }
  @media (min-width: ${theme.breakpoints.mobile}) {
    border-color: ${({ $active }) => $active ? theme.colors.accent : theme.colors.gray[200]};
    background: ${({ $active }) => $active ? 'rgba(201,168,76,.08)' : theme.colors.white};
    color: ${({ $active }) => $active ? theme.colors.accent : theme.colors.gray[600]};
    &:hover {
      border-color: ${theme.colors.accent};
      background: rgba(201,168,76,.08);
      color: ${theme.colors.accent};
    }
  }
`

const Badge = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 16px;
  height: 16px;
  background: #e74c3c;
  border-radius: 8px;
  border: 2px solid ${theme.colors.navy};
  font-size: 9px;
  font-weight: 700;
  color: ${theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  pointer-events: none;
  @media (min-width: ${theme.breakpoints.mobile}) {
    border-color: ${theme.colors.white};
  }
`

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 290px;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.14);
  overflow: hidden;
  z-index: 200;
`

const PanelHeader = styled.div`
  padding: 13px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  background: #fafaf8;
`

const PanelTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.navy};
  font-family: ${theme.typography.fontFamily};
`

const MarkAllBtn = styled.button`
  font-size: 11px;
  font-weight: 600;
  color: ${theme.colors.accent};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: ${theme.typography.fontFamily};
  &:hover { text-decoration: underline; }
`

const EmptyState = styled.div`
  padding: 28px 16px;
  text-align: center;
  font-size: 12px;
  color: ${theme.colors.gray[400]};
  font-family: ${theme.typography.fontFamily};
`

const Item = styled.button<{ $read: boolean; $last: boolean }>`
  width: 100%;
  padding: 11px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: ${({ $read }) => $read ? theme.colors.white : '#fffdf7'};
  border: none;
  border-bottom: ${({ $last }) => $last ? 'none' : `1px solid ${theme.colors.gray[50]}`};
  cursor: pointer;
  text-align: left;
  opacity: ${({ $read }) => $read ? 0.55 : 1};
  transition: background .12s;
  &:hover { background: ${theme.colors.gray[50]}; }
`

const ItemIcon = styled.div<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
`

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`

const ItemTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  gap: 8px;
`

const ItemTitle = styled.span<{ $read: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.navy};
  text-decoration: ${({ $read }) => $read ? 'line-through' : 'none'};
  font-family: ${theme.typography.fontFamily};
`

const ItemTime = styled.span`
  font-size: 10px;
  color: ${theme.colors.gray[400]};
  white-space: nowrap;
  font-family: ${theme.typography.fontFamily};
`

const ItemSubtitle = styled.div`
  font-size: 11px;
  color: ${theme.colors.gray[600]};
  font-family: ${theme.typography.fontFamily};
`

const ItemLink = styled.div`
  margin-top: 5px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 600;
  color: ${theme.colors.accent};
  font-family: ${theme.typography.fontFamily};
`

const Dot = styled.div<{ $urgent: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $urgent }) => $urgent ? '#e74c3c' : theme.colors.accent};
  flex-shrink: 0;
  margin-top: 4px;
`

/* ── Icônes emoji background par id ── */
const ICON_BG: Record<NotifId, string> = {
  panier: '#FFF3CD',
  nouveautes: '#E6EFE9',
  topventes: '#FDE8E8',
}

const ITEM_LABEL: Record<NotifId, string> = {
  panier: 'Aller au panier',
  nouveautes: 'Voir les nouveautés',
  topventes: 'Voir le classement',
}

/* ── Composant ── */

export function NotificationBell() {
  const navigate = useNavigate()
  const { notifications, unreadIds, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function handleItemClick(route: string, id: NotifId) {
    markAsRead(id)
    setOpen(false)
    navigate(route)
  }

  return (
    <Wrapper ref={wrapperRef}>
      <BellBtn $active={unreadCount > 0} onClick={() => setOpen(v => !v)} aria-label="Notifications">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </BellBtn>

      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}

      {open && (
        <Panel>
          <PanelHeader>
            <PanelTitle>Notifications</PanelTitle>
            {unreadCount > 0 && (
              <MarkAllBtn onClick={markAllAsRead}>Tout marquer lu</MarkAllBtn>
            )}
          </PanelHeader>

          {notifications.length === 0 ? (
            <EmptyState>Aucune notification</EmptyState>
          ) : (
            notifications.map((n, i) => {
              const isRead = !unreadIds.has(n.id)
              return (
                <Item
                  key={n.id}
                  $read={isRead}
                  $last={i === notifications.length - 1}
                  onClick={() => handleItemClick(n.route, n.id)}
                >
                  <ItemIcon $bg={ICON_BG[n.id]}>{n.emoji}</ItemIcon>
                  <ItemBody>
                    <ItemTop>
                      <ItemTitle $read={isRead}>{n.title}</ItemTitle>
                      <ItemTime>{n.time}</ItemTime>
                    </ItemTop>
                    <ItemSubtitle>{n.subtitle}</ItemSubtitle>
                    {!isRead && (
                      <ItemLink>
                        {ITEM_LABEL[n.id]}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </ItemLink>
                    )}
                  </ItemBody>
                  {!isRead && <Dot $urgent={n.id === 'panier'} />}
                </Item>
              )
            })
          )}
        </Panel>
      )}
    </Wrapper>
  )
}
