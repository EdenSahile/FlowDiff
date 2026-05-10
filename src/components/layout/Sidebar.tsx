import { useState } from 'react'
import styled from 'styled-components'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { theme } from '@/lib/theme'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconLogout } from '@/components/ui/icons'
import { TooltipInfo } from '@/components/ui/TooltipInfo'

const GOLD = theme.colors.accent

const SidebarContainer = styled.aside`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
    flex-direction: column;
    width: ${({ theme }) => theme.layout.sidebarWidth};
    flex-shrink: 0;
    height: 100vh;
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.navy};
    z-index: 99;
  }
`

/* ── Brand ── */
const SidebarBrand = styled.div`
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  flex-shrink: 0;
`

const BrandText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
  line-height: 1;

  span { color: ${GOLD}; }
`

const ProTag = styled.span`
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${GOLD};
  padding: 2px 4px;
  border: 1px solid ${GOLD};
  border-radius: 3px;
  line-height: 1;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;
`

/* ── Navigation ── */
const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
`

const SectionLabel = styled.div<{ $active?: boolean }>`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: ${({ $active }) => $active ? GOLD : 'rgba(255,255,255,.35)'};
  padding: 14px 20px 5px;
  transition: color .15s;
`

const Divider = styled.div`
  border-top: .5px solid rgba(255,255,255,.08);
  margin: 6px 16px;
`

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 9px 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 400;
  color: rgba(255,255,255,.65);
  cursor: pointer;
  transition: all .15s;
  border-left: 3px solid transparent;
  text-decoration: none;

  &:hover {
    color: #fff;
    background: rgba(255,255,255,.05);
  }

  &.active {
    color: #fff;
    background: rgba(212,168,67,.12);
    border-left-color: ${GOLD};
    font-weight: 500;
  }
`

/* ── Pied de sidebar ── */
const SidebarBottom = styled.div`
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,.08);
  padding: 14px 20px;
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
  font-weight: 500;
  padding: 6px 0;
  text-align: left;
  transition: color 0.15s;
  margin-bottom: 10px;

  &:hover { color: #FF6B6B; }
`

const UserBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${GOLD};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #2a2a00;
  flex-shrink: 0;
`

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const UserName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserCode = styled.div`
  font-size: 10px;
  color: rgba(255,255,255,.4);
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
  { to: '/compte',      label: 'Mon compte'     },
  { to: '/historique',  label: 'Mon historique' },
  { to: '/facturation', label: 'Facturation'    },
  { to: '/parametres',  label: 'Paramètres'     },
]

const toolItems = [
  { to: '/edi',     label: 'EDI',     tooltip: undefined },
  { to: '/offices', label: 'Offices', tooltip: undefined },
]

const infoItems = [
  { to: '/contact',     label: 'Contact'     },
  { to: '/flash-infos', label: 'Flash Infos' },
]

export function Sidebar() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const catalogueActive = catalogueItems.some(i => pathname.startsWith(i.to))
  const accountActive   = accountItems.some(i => pathname.startsWith(i.to))
  const toolsActive     = toolItems.some(i => pathname.startsWith(i.to))
  const infoActive      = infoItems.some(i => pathname.startsWith(i.to))

  const initiale = user?.nomLibrairie?.[0]?.toUpperCase() ?? 'L'

  function handleLogout() {
    setConfirmLogout(false)
    logout()
    navigate('/login')
  }

  return (
    <>
      <SidebarContainer>

        {/* ── Brand ── */}
        <SidebarBrand as={Link} to="/" style={{ textDecoration: 'none' }}>
          <BrandText>Flow<span>Diff</span></BrandText>
          <ProTag>PRO</ProTag>
        </SidebarBrand>

        {/* ── Navigation ── */}
        <ScrollArea>
          <nav aria-label="Accueil">
            <StyledNavLink to="/" end>Accueil</StyledNavLink>
          </nav>

          <Divider />
          <SectionLabel $active={catalogueActive}>Catalogue</SectionLabel>
          <nav id="tour-catalogue" aria-label="Catalogue">
            {catalogueItems.map(({ to, label }) => (
              <StyledNavLink key={to} to={to}>{label}</StyledNavLink>
            ))}
          </nav>

          <Divider />
          <SectionLabel $active={accountActive}>Mon espace</SectionLabel>
          <nav aria-label="Mon espace">
            {accountItems.map(({ to, label }) => (
              <StyledNavLink key={to} to={to}>{label}</StyledNavLink>
            ))}
          </nav>

          <Divider />
          <SectionLabel $active={toolsActive}>Outils</SectionLabel>
          <nav aria-label="Outils">
            {toolItems.map(({ to, label, tooltip }) => (
              <StyledNavLink key={to} to={to} id={to === '/edi' ? 'tour-edi' : undefined}>
                {label}
                {tooltip && <TooltipInfo text={tooltip} onDark />}
              </StyledNavLink>
            ))}
          </nav>

          <Divider />
          <SectionLabel $active={infoActive}>Informations</SectionLabel>
          <nav aria-label="Informations">
            {infoItems.map(({ to, label }) => (
              <StyledNavLink key={to} to={to}>{label}</StyledNavLink>
            ))}
          </nav>
        </ScrollArea>

        {/* ── Bas : logout + user ── */}
        <SidebarBottom>
          <LogoutBtn onClick={() => setConfirmLogout(true)}>
            <IconLogout /> Se déconnecter
          </LogoutBtn>
          <UserBlock>
            <Avatar>{initiale}</Avatar>
            <UserInfo>
              <UserName>{user?.nomLibrairie ?? 'Ma librairie'}</UserName>
              <UserCode>Code : {user?.codeClient}</UserCode>
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
