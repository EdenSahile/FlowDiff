import { useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { Wordmark } from '@/components/brand/Wordmark'

const GOLD = '#C9A84C'

/* ══════════════════════════════════════
   CONTENEUR PRINCIPAL
══════════════════════════════════════ */
const SidebarContainer = styled.aside`
  position: fixed;
  top: 0; left: 0;
  width: ${({ theme }) => theme.layout.sidebarWidth};
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.navy};
  display: none;
  flex-direction: column;
  z-index: 101;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
  }
`

/* ══════════════════════════════════════
   ZONE HEADER SIDEBAR (#226241)
══════════════════════════════════════ */
const SidebarHeaderZone = styled.div`
  flex-shrink: 0;
  border-bottom: 0.5px solid rgba(255,255,255,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 16px;
  text-align: center;
  gap: 6px;
`

const SidebarLogoBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;

  &:hover { opacity: 0.85; }
`

const SidebarTagline = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  color: rgba(255,255,255,0.45);
  margin: 0;
  line-height: 1.4;
`

/* ══════════════════════════════════════
   ZONE NAVIGATION (corps)
══════════════════════════════════════ */
const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
`

const SectionLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.30);
  padding: 16px 14px 6px;
`

const Divider = styled.div`
  border-top: 0.5px solid rgba(255,255,255,0.08);
  margin: 4px 14px;
`

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 7px 10px;
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.weights.normal};
  border-left: 2px solid transparent;
  border-radius: 6px;
  transition: color 0.15s ease, background-color 0.15s ease;
  margin: 1px 0;

  /* dot indicator — hidden by default */
  &::before {
    content: '';
    display: block;
    width: 0;
    height: 5px;
    border-radius: 50%;
    background: ${GOLD};
    flex-shrink: 0;
  }

  &:hover {
    color: #fdfdfd;
    background-color: rgba(255,255,255,0.07);
  }

  &.active {
    color: ${GOLD};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    background-color: rgba(201,168,76,0.12);
    border-left: 2px solid ${GOLD};
    border-radius: 0 6px 6px 0;
    padding-left: 8px; /* calc(10px - 2px) */

    &::before {
      width: 5px;
      margin-right: 8px;
    }
  }
`

/* ══════════════════════════════════════
   ZONE BAS — LOGOUT + FOOTER
══════════════════════════════════════ */
const SidebarBottom = styled.div`
  flex-shrink: 0;
  margin-top: auto;
  padding: 0 10px 12px;
`

const BottomDivider = styled.div`
  border-top: 0.5px solid rgba(255,255,255,0.08);
  margin: 0 0 4px;
`

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 107, 107, 0.80);
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  padding: 6px 10px;
  border-radius: 6px;
  text-align: left;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.10);
  }
`

/* ── Modale confirmation ── */
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 24px;
  animation: ${fadeIn} 0.15s ease;
`
const ConfirmBox = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px 20px;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  text-align: center;
`
const ConfirmIconWrap = styled.div`
  width: 48px; height: 48px;
  border-radius: 50%;
  background: #FFF0F0;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px;
  color: #E53935;
`
const ConfirmTitle = styled.p`font-size:1rem;font-weight:700;color:#111;margin-bottom:6px;`
const ConfirmBody  = styled.p`font-size:.875rem;color:#666;line-height:1.5;margin-bottom:20px;`
const ConfirmBtns  = styled.div`display:flex;gap:10px;`
const BtnCancel    = styled.button`flex:1;padding:11px;border:1.5px solid #E0E0E0;border-radius:8px;background:#fff;color:#333;font-size:.9rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;&:hover{background:#F5F5F5;}`
const BtnConfirm   = styled.button`flex:1;padding:11px;border:none;border-radius:8px;background:#E53935;color:#fff;font-size:.9rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;&:hover{background:#C62828;}`

const UserBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 8px;
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${GOLD};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 13px;
  font-weight: 500;
  color: #3d2f00;
  flex-shrink: 0;
`

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const UserName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserCode = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  color: rgba(255,255,255,0.40);
  margin-top: 1px;
`

const SocialRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 0 4px;
`

const SocialLink = styled.a`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
  transition: color 0.12s;

  &:hover { color: rgba(255,255,255,0.60); }
`

/* ── Icône logout ── */
function IconLogout() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

/* ── Nav data ── */
const navItems = [
  { to: '/',            label: 'Accueil',      end: true },
  { to: '/nouveautes',  label: 'Nouveautés'              },
  { to: '/fonds',       label: 'Fonds'                   },
  { to: '/top-ventes',  label: 'Top Ventes'              },
  { to: '/selections',  label: 'Sélections'              },
  { to: '/flash-infos', label: 'Flash Infos'             },
]

const accountItems = [
  { to: '/compte',      label: 'Mon compte'    },
  { to: '/historique',  label: 'Mon historique'},
]

const infoItems = [
  { to: '/contact',     label: 'Contact'       },
  { to: '/newsletter',  label: 'Newsletter'    },
  { to: '/parametres',  label: 'Paramètres'    },
  { to: '/aide',        label: 'Aide'          },
  { to: '/cgv',         label: 'CGV'           },
]

export function Sidebar() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const initiale = user?.nomLibrairie?.[0]?.toUpperCase() ?? 'L'

  function handleLogout() {
    setConfirmLogout(false)
    logout()
    navigate('/login')
  }

  return (
    <>
    <SidebarContainer>

      {/* ── Zone logo ── */}
      <SidebarHeaderZone>
        <SidebarLogoBtn onClick={() => navigate('/')} aria-label="Accueil">
          <Wordmark onDark size="sm" />
        </SidebarLogoBtn>
      </SidebarHeaderZone>

      {/* ── Navigation (corps #1e3a2a) ── */}
      <ScrollArea>
        <SectionLabel>Navigation</SectionLabel>
        <nav aria-label="Navigation principale">
          {navItems.map(({ to, label, end }) => (
            <StyledNavLink key={to} to={to} end={end}>{label}</StyledNavLink>
          ))}
        </nav>

        <Divider />

        <SectionLabel>Mon espace</SectionLabel>
        <nav aria-label="Mon espace">
          {accountItems.map(({ to, label }) => (
            <StyledNavLink key={to} to={to}>{label}</StyledNavLink>
          ))}
        </nav>

        <Divider />

        <SectionLabel>Informations</SectionLabel>
        <nav aria-label="Informations">
          {infoItems.map(({ to, label }) => (
            <StyledNavLink key={to} to={to}>{label}</StyledNavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* ── Logout + footer identité ── */}
      <SidebarBottom>
        <BottomDivider />
        <LogoutBtn onClick={() => setConfirmLogout(true)}>
          <IconLogout /> Se déconnecter
        </LogoutBtn>
        <UserBlock>
          <Avatar>{initiale}</Avatar>
          <UserInfo>
            <UserName>{user?.nomLibrairie ?? 'Ma librairie'}</UserName>
            <UserCode>{user?.codeClient}</UserCode>
          </UserInfo>
        </UserBlock>
        <SocialRow>
          <SocialLink href="#" aria-label="Site web">Web</SocialLink>
          <SocialLink href="#" aria-label="Instagram">Insta</SocialLink>
          <SocialLink href="#" aria-label="Facebook">FB</SocialLink>
        </SocialRow>
      </SidebarBottom>

    </SidebarContainer>

    {confirmLogout && createPortal(
      <ConfirmOverlay onClick={() => setConfirmLogout(false)}>
        <ConfirmBox onClick={e => e.stopPropagation()}>
          <ConfirmIconWrap><IconLogout /></ConfirmIconWrap>
          <ConfirmTitle>Se déconnecter ?</ConfirmTitle>
          <ConfirmBody>Vous serez redirigé vers la page de connexion.</ConfirmBody>
          <ConfirmBtns>
            <BtnCancel onClick={() => setConfirmLogout(false)}>Annuler</BtnCancel>
            <BtnConfirm onClick={handleLogout}>Se déconnecter</BtnConfirm>
          </ConfirmBtns>
        </ConfirmBox>
      </ConfirmOverlay>,
      document.body
    )}
    </>
  )
}
