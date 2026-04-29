import { useEffect, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRdv } from '@/contexts/RdvContext'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconLogout } from '@/components/ui/icons'

/* ── Animations ── */
const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
`
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

/* ── Overlay ── */
const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 200;
  ${({ $visible }) =>
    $visible
      ? css`animation: ${fadeIn} 0.2s ease forwards;`
      : css`display: none;`}
`

/* ── Panel ── */
const Panel = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  max-width: 85vw;
  background-color: ${({ theme }) => theme.colors.navy};
  z-index: 201;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  overflow-y: auto;
`

/* ── Header librairie ── */
const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const Avatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.sizes['2xl']};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: #3d2f00;
  flex-shrink: 0;
`

const LibrairieInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const LibrairieNom = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LibrairieCode = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
`

/* ── Navigation items ── */
const Nav = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} 0;
`

const NavSection = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} 0;
  & + & {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: ${({ theme }) => theme.spacing.xs};
    padding-top: ${({ theme }) => theme.spacing.sm};
  }
`

const NavItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: 14px ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  color: ${({ $danger, theme }) =>
    $danger ? '#FF6B6B' : theme.colors.white};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
  border-radius: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: -2px;
  }
`

const NavLabel = styled.span`
  flex: 1;
`

const RdvBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  background: ${({ theme }) => theme.colors.accent};
  color: #3d2f00;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  flex-shrink: 0;
`

/* ── Close button ── */
const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: ${({ theme }) => theme.colors.white};
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`


/* ── Icons ── */
function IconCompte()       { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> }
function IconHistorique()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg> }
function IconRdv()          { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="8" y1="17" x2="14" y2="17"/></svg> }
function IconContact()      { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg> }
function IconNewsletter()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function IconParametres()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function IconAide()         { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function IconCGV()          { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> }


/* ── Component ── */
interface BurgerMenuProps {
  open: boolean
  onClose: () => void
}

export function BurgerMenu({ open, onClose }: BurgerMenuProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
  const { rdvCount } = useRdv()
  const [confirmLogout, setConfirmLogout] = useState(false)

  // Fermer sur Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmLogout) setConfirmLogout(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose, confirmLogout])

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const initiale = user?.nomLibrairie?.[0]?.toUpperCase() ?? 'L'

  function go(path: string) {
    onClose()
    navigate(path)
  }

  function handleLogout() {
    setConfirmLogout(false)
    onClose()
    logout()
    navigate('/login')
  }

  return (
    <>
      <Overlay $visible={open} onClick={onClose} aria-hidden="true" />
      <Panel role="dialog" aria-modal="true" aria-label="Menu principal">
        <CloseButton onClick={onClose} aria-label="Fermer le menu">×</CloseButton>

        {/* En-tête librairie */}
        <MenuHeader>
          <Avatar>{initiale}</Avatar>
          <LibrairieInfo>
            <LibrairieNom>{user?.nomLibrairie ?? 'Ma librairie'}</LibrairieNom>
            <LibrairieCode>Code client : {user?.codeClient}</LibrairieCode>
          </LibrairieInfo>
        </MenuHeader>

        {/* Navigation */}
        <Nav>
          <NavSection>
            <NavItem onClick={() => go('/compte')}>
              <IconCompte />
              <NavLabel>Mon compte</NavLabel>
            </NavItem>
            <NavItem onClick={() => go('/historique')}>
              <IconHistorique />
              <NavLabel>Mon historique</NavLabel>
            </NavItem>
            <NavItem onClick={() => go('/rdv-representant')}>
              <IconRdv />
              <NavLabel>Préparer mon RDV</NavLabel>
              {rdvCount > 0 && <RdvBadge>{rdvCount}</RdvBadge>}
            </NavItem>
          </NavSection>

          <NavSection>
            <NavItem onClick={() => go('/contact')}>
              <IconContact />
              <NavLabel>Contact</NavLabel>
            </NavItem>
            <NavItem onClick={() => go('/newsletter')}>
              <IconNewsletter />
              <NavLabel>Inscription Newsletter</NavLabel>
            </NavItem>
          </NavSection>

          <NavSection>
            <NavItem onClick={() => go('/parametres')}>
              <IconParametres />
              <NavLabel>Paramètres</NavLabel>
            </NavItem>
            <NavItem onClick={() => go('/aide')}>
              <IconAide />
              <NavLabel>Aide</NavLabel>
            </NavItem>
            <NavItem onClick={() => go('/cgv')}>
              <IconCGV />
              <NavLabel>CGV</NavLabel>
            </NavItem>
          </NavSection>

          <NavSection>
            <NavItem $danger onClick={() => setConfirmLogout(true)}>
              <IconLogout size={20} />
              <NavLabel>Se déconnecter</NavLabel>
            </NavItem>
          </NavSection>
        </Nav>

      </Panel>
      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        message="Vous serez redirigé vers la page de connexion."
        confirmLabel="Se déconnecter"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  )
}
