import styled from 'styled-components'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'

/* ── Icons navigation principale ── */
function HomeIcon()     { return <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H14v-5h-4v5H4a1 1 0 0 1-1-1V9.5z"/></svg> }
function StarIcon()     { return <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2l2.39 4.84 5.35.78-3.87 3.77.91 5.33L11 14.27l-4.78 2.51.91-5.33L3.26 7.62l5.35-.78L11 2z"/></svg> }
function BookIcon()     { return <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h12v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h12"/><path d="M9 7h6M9 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> }
function TrendingIcon() { return <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,17 8,12 12,15 18,6"/><polyline points="14,6 18,6 18,10"/></svg> }
function GridIcon()     { return <svg width="18" height="18" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="12" y="3" width="7" height="7" rx="1"/><rect x="3" y="12" width="7" height="7" rx="1"/><rect x="12" y="12" width="7" height="7" rx="1"/></svg> }
function FlashIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }

/* ── Icons compte ── */
function IconCompte()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> }
function IconHistorique()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg> }
function IconContact()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg> }
function IconNewsletter()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function IconParametres()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function IconAide()        { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function IconCGV()         { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
function IconLogout()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }

/* ── Social icons ── */
function IconWeb()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function IconFacebook()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> }
function IconInstagram() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> }
function IconYoutube()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg> }

/* ── Styled ── */
const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: ${({ theme }) => theme.layout.sidebarWidth};
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.navy};
  display: none;
  flex-direction: column;
  z-index: 101;
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: flex;
  }
`

const SidebarLogo = styled.button`
  height: ${({ theme }) => theme.layout.headerHeight};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
  flex-shrink: 0;
  user-select: none;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }
`

const LogoCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.navy};
  flex-shrink: 0;
`

const LogoText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: -0.02em;
`

/* Contenu scrollable */
const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
`

/* Section label */
const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.35);
  padding: 14px ${({ theme }) => theme.spacing.md} 4px;
`

const Divider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.08);
  margin: ${({ theme }) => theme.spacing.sm} 0;
`

/* Nav link actif */
const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px ${({ theme }) => theme.spacing.md};
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  border-left: 3px solid transparent;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background-color: rgba(255, 255, 255, 0.07);
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    border-left-color: ${({ theme }) => theme.colors.primary};
    background-color: rgba(255, 192, 0, 0.08);
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
  }
`

/* Bouton simple (non-navlink) */
const SidebarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px ${({ theme }) => theme.spacing.md};
  color: rgba(255, 255, 255, 0.65);
  background: none;
  border: none;
  border-left: 3px solid transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  text-align: left;
  transition: color 0.15s ease, background-color 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background-color: rgba(255, 255, 255, 0.07);
  }
`

const LogoutButton = styled(SidebarButton)`
  color: #FF8A8A;

  &:hover {
    color: #FF6B6B;
    background-color: rgba(255, 107, 107, 0.08);
  }
`

/* Pied de sidebar */
const SidebarFooter = styled.div`
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
`

const UserBlock = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
`

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.navy};
  flex-shrink: 0;
`

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const UserName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserCode = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
`

const SocialRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
`

const SocialLink = styled.a`
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  transition: color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

/* ── Component ── */
const navItems = [
  { to: '/', label: 'Accueil', icon: <HomeIcon />, end: true },
  { to: '/nouveautes', label: 'Nouveautés', icon: <StarIcon /> },
  { to: '/fonds', label: 'Fonds', icon: <BookIcon /> },
  { to: '/top-ventes', label: 'Top Ventes', icon: <TrendingIcon /> },
  { to: '/selections', label: 'Sélections', icon: <GridIcon /> },
  { to: '/flash-infos', label: 'Flash Infos', icon: <FlashIcon /> },
]

const accountItems = [
  { to: '/compte', label: 'Mon compte', icon: <IconCompte /> },
  { to: '/historique', label: 'Mon historique', icon: <IconHistorique /> },
]

const infoItems = [
  { to: '/contact', label: 'Contact', icon: <IconContact /> },
  { to: '/newsletter', label: 'Newsletter', icon: <IconNewsletter /> },
  { to: '/parametres', label: 'Paramètres', icon: <IconParametres /> },
  { to: '/aide', label: 'Aide', icon: <IconAide /> },
  { to: '/cgv', label: 'CGV', icon: <IconCGV /> },
]

export function Sidebar() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  const initiale = user?.nomLibrairie?.[0]?.toUpperCase() ?? 'L'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <SidebarContainer>
      {/* Logo */}
      <SidebarLogo onClick={() => navigate('/')} aria-label="Accueil">
        <LogoCircle>B</LogoCircle>
        <LogoText>BookFlow</LogoText>
      </SidebarLogo>

      {/* Contenu scrollable */}
      <ScrollArea>
        {/* Navigation principale */}
        <SectionLabel>Navigation</SectionLabel>
        <nav aria-label="Navigation principale">
          {navItems.map(({ to, label, icon, end }) => (
            <StyledNavLink key={to} to={to} end={end}>
              {icon}
              {label}
            </StyledNavLink>
          ))}
        </nav>

        <Divider />

        {/* Mon compte */}
        <SectionLabel>Mon espace</SectionLabel>
        <nav aria-label="Mon espace">
          {accountItems.map(({ to, label, icon }) => (
            <StyledNavLink key={to} to={to}>
              {icon}
              {label}
            </StyledNavLink>
          ))}
        </nav>

        <Divider />

        {/* Infos & paramètres */}
        <SectionLabel>Informations</SectionLabel>
        <nav aria-label="Informations">
          {infoItems.map(({ to, label, icon }) => (
            <StyledNavLink key={to} to={to}>
              {icon}
              {label}
            </StyledNavLink>
          ))}
        </nav>

        <Divider />

        {/* Déconnexion */}
        <LogoutButton onClick={handleLogout}>
          <IconLogout />
          Se déconnecter
        </LogoutButton>
      </ScrollArea>

      {/* Pied : infos librairie + réseaux */}
      <SidebarFooter>
        <UserBlock>
          <Avatar>{initiale}</Avatar>
          <UserInfo>
            <UserName>{user?.nomLibrairie ?? 'Ma librairie'}</UserName>
            <UserCode>{user?.codeClient}</UserCode>
          </UserInfo>
        </UserBlock>
        <SocialRow>
          <SocialLink href="#" aria-label="Site web"><IconWeb /></SocialLink>
          <SocialLink href="#" aria-label="Facebook"><IconFacebook /></SocialLink>
          <SocialLink href="#" aria-label="Instagram"><IconInstagram /></SocialLink>
          <SocialLink href="#" aria-label="YouTube"><IconYoutube /></SocialLink>
        </SocialRow>
      </SidebarFooter>
    </SidebarContainer>
  )
}
