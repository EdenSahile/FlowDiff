import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { adminColors } from '@/admin/adminTheme'
import { useAdminAuth } from '@/admin/hooks/useAdminAuth'

const NAV_ITEMS = [
  { to: '/admin/dashboard',  label: 'Dashboard',  icon: '📊' },
  { to: '/admin/catalogue',  label: 'Catalogue',  icon: '📚' },
  { to: '/admin/commandes',  label: 'Commandes',  icon: '📦' },
  { to: '/admin/libraires',  label: 'Libraires',  icon: '🏪' },
]

export function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <Shell>
      <Sidebar>
        <Brand>FlowDiff <BrandSup>Admin</BrandSup></Brand>
        <Nav>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.to} to={item.to}>
              <span>{item.icon}</span> {item.label}
            </NavItem>
          ))}
        </Nav>
        <LogoutBtn onClick={handleLogout}>↩ Déconnexion</LogoutBtn>
      </Sidebar>
      <Main>
        <Outlet />
      </Main>
    </Shell>
  )
}

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Open Sans', sans-serif;
`

const Sidebar = styled.aside`
  width: 240px;
  min-height: 100vh;
  background: ${adminColors.sidebarBg};
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
`

const Brand = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  padding: 0 20px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 12px;
`

const BrandSup = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${adminColors.accent};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 6px;
  vertical-align: super;
`

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
`

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${adminColors.sidebarText};
  text-decoration: none;
  transition: background 0.15s;

  &:hover { background: ${adminColors.sidebarHover}; color: #fff; }
  &.active { background: ${adminColors.sidebarActive}; color: #fff; }
`

const LogoutBtn = styled.button`
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 13px;
  color: ${adminColors.sidebarText};
  cursor: pointer;
  text-align: left;
  font-family: 'Open Sans', sans-serif;
  &:hover { color: #fff; }
`

const Main = styled.main`
  flex: 1;
  background: ${adminColors.pageBg};
  min-height: 100vh;
`
