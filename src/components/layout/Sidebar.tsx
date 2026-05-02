import { useState } from 'react'
import styled from 'styled-components'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { Wordmark } from '@/components/brand/Wordmark'
import { theme } from '@/lib/theme'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconLogout } from '@/components/ui/icons'

const GOLD = theme.colors.accent

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
  z-index: 99;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
    top: ${({ theme }) => theme.layout.headerHeight};
    height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
  }
`

/* ══════════════════════════════════════
   ZONE HEADER SIDEBAR — masquée sur desktop (logo dans le header)
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

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
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
  color: rgba(255,255,255,0.65);
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
  border-radius: ${({ theme }) => theme.radii.md};
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
    border-radius: 0 ${({ theme }) => theme.radii.md} ${({ theme }) => theme.radii.md} 0;
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
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: left;
  transition: color 0.15s ease, background-color 0.15s ease;

  &:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.10);
  }
`

const UserBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.07);
  border-radius: ${({ theme }) => theme.radii.md};
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
  color: rgba(255,255,255,0.65);
  margin-top: 1px;
`


/* ── Nav data ── */
const catalogueItems = [
  { to: '/a-paraitre',  label: 'À paraître'  },
  { to: '/nouveautes',  label: 'Nouveautés'  },
  { to: '/fonds',       label: 'Fonds'       },
  { to: '/top-ventes',  label: 'Top Ventes'  },
  { to: '/selections',  label: 'Sélections'  },
]

const accountItems = [
  { to: '/compte',        label: 'Mon compte'     },
  { to: '/historique',    label: 'Mon historique' },
  { to: '/facturation',   label: 'Facturation'    },
  { to: '/parametres',    label: 'Paramètres'     },
]

const toolItems = [
  { to: '/panier',  label: 'Panier'   },
  { to: '/edi',     label: 'EDI'      },
  { to: '/offices', label: 'Offices'  },
]

const infoItems = [
  { to: '/contact',     label: 'Contact'     },
  { to: '/flash-infos', label: 'Flash Infos' },
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

      {/* ── Navigation ── */}
      <ScrollArea>
        <nav aria-label="Accueil">
          <StyledNavLink to="/" end>Accueil</StyledNavLink>
        </nav>

        <Divider />

        <SectionLabel>Catalogue</SectionLabel>
        <nav aria-label="Catalogue">
          {catalogueItems.map(({ to, label }) => (
            <StyledNavLink key={to} to={to}>{label}</StyledNavLink>
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

        <SectionLabel>Outils</SectionLabel>
        <nav aria-label="Outils">
          {toolItems.map(({ to, label }) => (
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
      </SidebarBottom>

    </SidebarContainer>

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
