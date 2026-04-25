import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { css, keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'

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

/* ── Social footer ── */
const SocialFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
`

const SocialLink = styled.a`
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.15s ease;
  display: flex;
  align-items: center;

  &:hover {
    color: #E0EDE7;
  }
`

/* ── Modale de confirmation déconnexion ── */
const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 24px;
  animation: ${fadeIn} 0.15s ease;
`

const ConfirmBox = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: 28px 24px 20px;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
`

const ConfirmIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #FFF0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  color: #E53935;
`

const ConfirmTitle = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 6px;
`

const ConfirmBody = styled.p`
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20px;
`

const ConfirmButtons = styled.div`
  display: flex;
  gap: 10px;
`

const BtnCancel = styled.button`
  flex: 1;
  padding: 11px;
  border: 1.5px solid #E0E0E0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: #fff;
  color: #333;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover { background: #F5F5F5; }
`

const BtnConfirm = styled.button`
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  background: #E53935;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  &:hover { background: #C62828; }
`

/* ── Icons ── */
function IconCompte()       { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> }
function IconHistorique()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg> }
function IconContact()      { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg> }
function IconNewsletter()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function IconParametres()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function IconAide()         { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function IconCGV()          { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> }
function IconDeconnexion()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }

function IconWeb() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
}
function IconFacebook() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
}
function IconInstagram() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
}
function IconYoutube() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
}

/* ── Component ── */
interface BurgerMenuProps {
  open: boolean
  onClose: () => void
}

export function BurgerMenu({ open, onClose }: BurgerMenuProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
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
              <IconDeconnexion />
              <NavLabel>Se déconnecter</NavLabel>
            </NavItem>
          </NavSection>
        </Nav>

        {/* Réseaux sociaux */}
        <SocialFooter>
          <SocialLink href="#" aria-label="Site web" title="Site web">
            <IconWeb />
          </SocialLink>
          <SocialLink href="#" aria-label="Facebook" title="Facebook">
            <IconFacebook />
          </SocialLink>
          <SocialLink href="#" aria-label="Instagram" title="Instagram">
            <IconInstagram />
          </SocialLink>
          <SocialLink href="#" aria-label="YouTube" title="YouTube">
            <IconYoutube />
          </SocialLink>
        </SocialFooter>
      </Panel>
      {confirmLogout && createPortal(
        <ConfirmOverlay onClick={() => setConfirmLogout(false)}>
          <ConfirmBox onClick={e => e.stopPropagation()}>
            <ConfirmIcon>
              <IconDeconnexion />
            </ConfirmIcon>
            <ConfirmTitle>Se déconnecter ?</ConfirmTitle>
            <ConfirmBody>Vous serez redirigé vers la page de connexion.</ConfirmBody>
            <ConfirmButtons>
              <BtnCancel onClick={() => setConfirmLogout(false)}>Annuler</BtnCancel>
              <BtnConfirm onClick={handleLogout}>Se déconnecter</BtnConfirm>
            </ConfirmButtons>
          </ConfirmBox>
        </ConfirmOverlay>,
        document.body
      )}
    </>
  )
}
