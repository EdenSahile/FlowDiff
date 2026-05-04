# Layout + HomePage + FondsPage — Conformité maquettes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire correspondre exactement l'application aux mockups HTML validés (`homepage-full.html` et `fonds.html`) — layout flex avec sidebar sticky full-height + topbar blanche, puis corrections de contenu sur HomePage et FondsPage.

**Architecture:** Le layout passe d'un header navy pleine largeur + sidebar fixed sous le header, à un layout flex deux colonnes : sidebar sticky (0→100vh) avec brand intégrée à gauche, et une colonne principale (topbar blanche sticky + DemoBanner sticky + contenu) à droite. Les composants de page sont ensuite corrigés pour coller aux maquettes.

**Tech Stack:** React 18, styled-components v6, Vite 5, TypeScript strict, Vitest

**Maquettes de référence :**
- Layout / HomePage : `.superpowers/brainstorm/63208-1777743595/content/homepage-full.html`
- FondsPage : `.superpowers/brainstorm/63208-1777743595/content/fonds.html`

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `src/lib/theme.ts` | Modifier : `headerHeight` 68px → 56px |
| `src/components/layout/AppLayout.tsx` | Refonte : flex layout, MainColumn wrapper |
| `src/components/layout/Sidebar.tsx` | Refonte : sticky full-height, brand en haut, user block en bas |
| `src/components/layout/Header.tsx` | Refonte : topbar blanche, logo masqué desktop, couleurs light |
| `src/components/ui/DemoBanner.tsx` | Modifier : sticky dans le flux (plus fixed) |
| `src/components/layout/AppFooter.tsx` | Modifier : position dans le flux (plus fixed) |
| `src/pages/home/HomePage.tsx` | Modifier : greeting-sub, section labels, styles PanelCard/ActionsBox, reminder card |
| `src/pages/fonds/FondsPage.tsx` | Modifier : page header avec view-toggle, SVG search icon, ResultsCount, pills |

---

## Task 1 — Mettre à jour les tokens de layout dans theme.ts

**Files:**
- Modify: `src/lib/theme.ts`

- [ ] **Étape 1 : Modifier headerHeight**

Dans `src/lib/theme.ts`, changer :
```ts
layout: {
  sidebarWidth:        '220px',
  headerHeight:        '56px',   // était 68px — correspond au topbar mockup
  mobileHeaderHeight:  '112px',  // inchangé
  bottomNavHeight:     '64px',   // inchangé
  demoBannerHeight:    '34px',   // inchangé
  footerHeight:        '48px',   // inchangé
},
```

- [ ] **Étape 2 : Vérifier les tests**

```bash
cd /Users/macbookeden/Desktop/AppBook && npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 3 : Commit**

```bash
git add src/lib/theme.ts
git commit -m "fix(theme): headerHeight 56px pour correspondre au topbar mockup"
```

---

## Task 2 — Refonte AppLayout (flex layout + MainColumn)

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`

- [ ] **Étape 1 : Réécrire AppLayout.tsx**

```tsx
import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'
import { BurgerMenu } from './BurgerMenu'
import { DemoBanner } from '@/components/ui/DemoBanner'
import { FeedbackWidget } from '@/components/ui/FeedbackWidget'
import { AppFooter } from './AppFooter'
import { useCart } from '@/contexts/CartContext'

const LayoutRoot = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.gray[50]};
`

const MainColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const PageContent = styled.main`
  flex: 1;

  /* Mobile : espace pour la BottomNav */
  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    padding-bottom: ${({ theme }) => theme.layout.bottomNavHeight};
  }
`

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <LayoutRoot>
      <Sidebar />
      <BurgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <MainColumn>
        <Header
          cartCount={totalItems}
          onBurgerClick={() => setMenuOpen(true)}
          onCartClick={() => navigate('/panier')}
        />
        <DemoBanner />
        <PageContent>
          {children}
        </PageContent>
        <AppFooter />
      </MainColumn>
      <BottomNav />
      <FeedbackWidget />
    </LayoutRoot>
  )
}
```

- [ ] **Étape 2 : Vérifier les tests**

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 3 : Commit**

```bash
git add src/components/layout/AppLayout.tsx
git commit -m "refactor(layout): flex layout avec MainColumn — sidebar | topbar+content"
```

---

## Task 3 — Refonte Sidebar (sticky, brand en haut, user block en bas)

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

La sidebar passe de `position: fixed; top: headerHeight` à `position: sticky; top: 0; height: 100vh`, et intègre la marque FlowDiff PRO en haut (comme le mockup). Elle reste `display: none` sur mobile.

- [ ] **Étape 1 : Réécrire Sidebar.tsx**

```tsx
import { useState } from 'react'
import styled from 'styled-components'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { theme } from '@/lib/theme'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconLogout } from '@/components/ui/icons'

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

const SectionLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: rgba(255,255,255,.35);
  padding: 14px 20px 5px;
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
  { to: '/panier',  label: 'Panier'  },
  { to: '/edi',     label: 'EDI'     },
  { to: '/offices', label: 'Offices' },
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

        {/* ── Brand ── */}
        <SidebarBrand>
          <BrandText>Flow<span>Diff</span></BrandText>
          <ProTag>PRO</ProTag>
        </SidebarBrand>

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
```

- [ ] **Étape 2 : Vérifier les tests**

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 3 : Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "refactor(sidebar): sticky full-height avec brand FlowDiff PRO en haut"
```

---

## Task 4 — Refonte Header (topbar blanche, logo masqué desktop)

**Files:**
- Modify: `src/components/layout/Header.tsx`

Le header devient blanc sur desktop. Logo masqué sur desktop (il est dans la sidebar). Tous les contrôles (search, filtres, notifications, listes, panier) conservent leurs fonctionnalités.

- [ ] **Étape 1 : Modifier HeaderBar**

Dans `Header.tsx`, remplacer le style de `HeaderBar` :

```tsx
const HeaderBar = styled.header`
  /* Mobile : dark comme avant */
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => theme.layout.mobileHeaderHeight};
  background-color: ${({ theme }) => theme.colors.navy};
  border-bottom: 1px solid rgba(255,255,255,0.10);
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  gap: 12px;
  z-index: 100;
  flex-wrap: wrap;
  padding: 14px ${({ theme }) => theme.spacing.md};
  gap: 8px 0;
  align-items: center;

  /* Desktop : blanc */
  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background-color: ${({ theme }) => theme.colors.white};
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
    height: ${({ theme }) => theme.layout.headerHeight};
    flex-wrap: nowrap;
    padding: 0 ${({ theme }) => theme.spacing.md};
    gap: 12px;
    align-items: center;
  }
`
```

- [ ] **Étape 2 : Masquer LogoWrap sur desktop**

Remplacer le style de `LogoWrap` :

```tsx
const LogoWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  order: 1;

  /* Desktop : masqué — le logo est dans la sidebar */
  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`
```

- [ ] **Étape 3 : Mettre à jour SearchGroup (fond ivoire sur desktop)**

```tsx
const SearchGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.18);
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  flex: 1;
  max-width: 520px;
  transition: background 0.15s;

  &:focus-within { background: rgba(255,255,255,0.24); }

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    max-width: none;
    width: 100%;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: ${({ theme }) => theme.colors.gray[50]};
    border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
    border-radius: 20px;
    max-width: 480px;

    &:focus-within {
      background: ${({ theme }) => theme.colors.gray[50]};
      border-color: #b0a898;
    }
  }
`
```

- [ ] **Étape 4 : Mettre à jour SearchInput (texte sombre sur desktop)**

```tsx
const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 9px 10px 9px 34px;
  background: transparent;
  border: none;
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  outline: none;
  appearance: none;

  &::placeholder { color: rgba(255,255,255,0.6); font-size: 13px; }
  &::-webkit-search-cancel-button { display: none; }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    color: ${({ theme }) => theme.colors.gray[800]};
    &::placeholder { color: ${({ theme }) => theme.colors.gray[400]}; }
  }
`
```

- [ ] **Étape 5 : Mettre à jour SearchGroupDivider**

```tsx
const SearchGroupDivider = styled.span`
  width: 1px;
  height: 18px;
  background: rgba(255,255,255,0.22);
  flex-shrink: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: ${({ theme }) => theme.colors.gray[200]};
  }
`
```

- [ ] **Étape 6 : Mettre à jour FilterIconBtn (couleurs desktop)**

```tsx
const FilterIconBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  height: 100%;
  min-height: 38px;
  background: ${({ $active }) => $active ? 'rgba(255,255,255,0.12)' : 'transparent'};
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.75);
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover { background: rgba(255,255,255,0.08); }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    color: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[400]};
    background: ${({ $active }) => $active ? 'rgba(35,47,62,0.08)' : 'transparent'};
    &:hover { background: rgba(35,47,62,0.06); color: ${({ theme }) => theme.colors.navy}; }
  }
`
```

- [ ] **Étape 7 : Mettre à jour NotifBtn et HelpBtn (desktop : fond clair)**

```tsx
const NotifBtn = styled.button`
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: rgba(255,255,255,0.14); }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: transparent;
    border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
    &:hover { background: ${({ theme }) => theme.colors.gray[50]}; border-color: #b0a898; }
  }
`

const HelpBtn = styled.button`
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: rgba(255,255,255,0.14); }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: transparent;
    border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
    &:hover { background: ${({ theme }) => theme.colors.gray[50]}; border-color: #b0a898; }
  }
`
```

- [ ] **Étape 8 : Mettre à jour les icônes Bell et Help (desktop : sombres)**

Remplacer les fonctions `IconBell` et `IconHelp` pour adapter la couleur :

```tsx
function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'inherit' }}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function IconHelp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'inherit' }}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
```

Et ajouter `color: rgba(255,255,255,0.55)` sur mobile aux boutons Notif/Help via un wrapper, ou en ciblant l'SVG. Puisque `stroke="currentColor"` et que les boutons ont leur couleur via CSS `color`, c'est géré automatiquement par `currentColor`.

Ajouter dans `NotifBtn` et `HelpBtn` :
```tsx
/* couleur de l'icône */
color: rgba(255,255,255,0.55);
@media (min-width: ${theme.breakpoints.mobile}) {
  color: ${theme.colors.gray[400]};
}
```

- [ ] **Étape 9 : Mettre à jour ListsBtn (desktop : fond clair)**

```tsx
const ListsBtn = styled.button<{ $hasLists: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
  transition: all .15s;
  white-space: nowrap;

  /* Mobile : style sombre */
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.75);

  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.4);
    color: #fff;
  }

  /* Desktop : style clair */
  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    border: 1.5px solid ${({ theme }) => theme.colors.gray[200]};
    color: ${({ theme }) => theme.colors.gray[600]};
    background: transparent;

    &:hover {
      border-color: ${({ theme }) => theme.colors.navy};
      color: ${({ theme }) => theme.colors.navy};
      background: transparent;
    }

    ${({ $hasLists }) => $hasLists && `
      border-color: rgba(212,168,67,0.5);
      color: #D4A843;
    `}
  }
`
```

- [ ] **Étape 10 : Mettre à jour CartBtn (desktop : navy/white comme mockup)**

```tsx
const CartBtn = styled.button<{ $hasItems: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  transition: background 0.15s;
  white-space: nowrap;

  /* Mobile : style doré si items, transparent sinon */
  ${({ $hasItems }) => $hasItems ? `
    background: #D4A843;
    border: 1.5px solid #D4A843;
    color: #232f3e;
    box-shadow: 0 2px 8px rgba(212,168,67,0.35);
    &:hover { background: #E0B84A; border-color: #E0B84A; }
  ` : `
    background: transparent;
    border: 1.5px solid rgba(212,168,67,0.5);
    color: #D4A843;
    &:hover { background: rgba(212,168,67,0.12); }
  `}

  /* Desktop : toujours navy/blanc comme le mockup */
  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: ${({ theme }) => theme.colors.navy};
    border: none;
    color: #fff;
    box-shadow: none;

    &:hover { background: ${({ theme }) => theme.colors.navyHover}; }
  }
`
```

- [ ] **Étape 11 : Mettre à jour CartBadge (desktop : champagne)**

```tsx
const CartBadge = styled.span`
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1px 6px;
  line-height: 1.6;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background: ${({ theme }) => theme.colors.accent};
    color: #2a2a00;
  }
`
```

- [ ] **Étape 12 : Retirer l'icône de SearchIconWrap desktop pour aligner le curseur**

`SearchIconWrap` est déjà correctement positionné. Vérifier que `color` passe en sombre sur desktop :

```tsx
const SearchIconWrap = styled.span`
  position: absolute;
  left: 11px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: rgba(255,255,255,0.7);

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`
```

- [ ] **Étape 13 : Vérifier les tests**

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 14 : Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "refactor(header): topbar blanche desktop, logo masqué, couleurs light"
```

---

## Task 5 — Refonte DemoBanner (sticky dans le flux)

**Files:**
- Modify: `src/components/ui/DemoBanner.tsx`

La DemoBanner passe de `position: fixed` (décalée manuellement) à `position: sticky` dans le flux de `MainColumn`. Elle reste visible en haut de la zone de contenu en scrollant.

- [ ] **Étape 1 : Réécrire DemoBanner.tsx**

```tsx
import styled from 'styled-components'

const BannerWrap = styled.aside`
  position: sticky;
  z-index: 98;
  height: ${({ theme }) => theme.layout.demoBannerHeight};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  background: ${({ theme }) => theme.colors.accentLight};
  border-bottom: 1px solid rgba(201, 168, 76, 0.35);
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11.5px;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;

  /* Collé sous le header mobile */
  top: ${({ theme }) => theme.layout.mobileHeaderHeight};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    /* Collé sous le topbar desktop */
    top: ${({ theme }) => theme.layout.headerHeight};
  }
`

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.accent};
  flex-shrink: 0;
`

export function DemoBanner() {
  return (
    <BannerWrap role="note" aria-label="Site de démonstration">
      <Dot aria-hidden="true" />
      Site de démonstration — Toutes les données affichées sont fictives et créées à des fins pédagogiques uniquement.
    </BannerWrap>
  )
}
```

- [ ] **Étape 2 : Vérifier les tests**

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 3 : Commit**

```bash
git add src/components/ui/DemoBanner.tsx
git commit -m "refactor(demo-banner): sticky dans le flux MainColumn"
```

---

## Task 6 — Refonte AppFooter (dans le flux, plus fixed)

**Files:**
- Modify: `src/components/layout/AppFooter.tsx`

Le footer passe de `position: fixed; bottom: 0` (décalé manuellement) à un élément normal en bas de `MainColumn`. Il reste masqué sur mobile.

- [ ] **Étape 1 : Modifier le style FooterBar dans AppFooter.tsx**

Localiser le styled-component `FooterBar` et remplacer son contenu :

```tsx
const FooterBar = styled.footer`
  height: ${({ theme }) => theme.layout.footerHeight};
  background: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  flex-shrink: 0;

  /* Masqué sur mobile — BottomNav gère le bas */
  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: none;
  }
`
```

(Supprimer `position: fixed; bottom: 0; left: 0; right: 0; z-index: 90` et le `left: sidebarWidth` du desktop.)

- [ ] **Étape 2 : Vérifier les tests**

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 3 : Commit**

```bash
git add src/components/layout/AppFooter.tsx
git commit -m "refactor(footer): dans le flux MainColumn, plus position fixed"
```

---

## Task 7 — Corrections contenu HomePage

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

Corrections pour coller au mockup `homepage-full.html` :
1. `greeting-sub` ("Votre activité du mois de…")
2. Section labels ("Analyse détaillée" / "Flux & opérations")
3. `PanelCard` : ajouter `border-radius` + `box-shadow` + hover shadow
4. `ActionsBox` : ajouter `border-radius`
5. Remplacer `FooterBar` + `IconInfo` par la `ReminderCard` champagne (à paraître)

- [ ] **Étape 1 : Ajouter GreetingSub styled-component**

Après `GreetingTitle`, ajouter :

```tsx
const GreetingSub = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 2px 0 0;
`
```

- [ ] **Étape 2 : Afficher le greeting-sub dans le JSX**

Le code actuel dans `GreetingRow` a `<GreetingTitle>` directement comme premier enfant. Le mockup exige un div wrapper pour grouper titre + sous-titre. Remplacer :

```tsx
{/* AVANT */}
<GreetingRow>
  <GreetingTitle>
    {greeting} {user?.nomLibrairie ?? 'Librairie'} 👋
  </GreetingTitle>
  <DateBlock>...</DateBlock>
</GreetingRow>

{/* APRÈS */}
<GreetingRow>
  <div>
    <GreetingTitle>
      {greeting} {user?.nomLibrairie ?? 'Librairie'} 👋
    </GreetingTitle>
    <GreetingSub>
      Votre activité du mois de{' '}
      {now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
    </GreetingSub>
  </div>
  <DateBlock>...</DateBlock>
</GreetingRow>
```

- [ ] **Étape 3 : Ajouter SectionLabel styled-component**

```tsx
const SectionLabel = styled.p`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.gray[200]};
  }
`
```

- [ ] **Étape 4 : Ajouter les section labels dans le JSX**

Dans la section `sectionId === 'mainPanels'`, avant le `<ThreeColRow>` :

```tsx
<SectionLabel>Analyse détaillée</SectionLabel>
```

Dans la section `sectionId === 'bottomPanels'`, avant le `<ThreeColRow>` :

```tsx
<SectionLabel>Flux &amp; opérations</SectionLabel>
```

- [ ] **Étape 5 : Ajouter border-radius et box-shadow à PanelCard**

Modifier le styled-component `PanelCard` :

```tsx
const PanelCard = styled.div<{ $dragging?: boolean; $dropTarget?: boolean }>`
  background: white;
  border: 1px solid ${({ $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  position: relative;
  opacity: ${({ $dragging }) => $dragging ? 0.4 : 1};
  transition: opacity 0.1s, border-color 0.1s, box-shadow 0.15s;

  &:hover {
    box-shadow: 0 1px 4px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05);
  }
  &:hover ${CardDragHandle} { opacity: 1; }
`
```

- [ ] **Étape 6 : Ajouter border-radius à ActionsBox**

```tsx
const ActionsBox = styled.section`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px 20px;
`
```

- [ ] **Étape 7 : Ajouter ReminderCard styled-components**

```tsx
const ReminderCard = styled.div`
  background: ${({ theme }) => theme.colors.accentLight};
  border: 1px solid rgba(212,168,67,.35);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`

const ReminderIcon = styled.span`
  font-size: 20px;
  flex-shrink: 0;
`

const ReminderText = styled.div`
  flex: 1;

  strong {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.navy};
    display: block;
  }

  p {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.gray[400]};
    margin: 2px 0 0;
  }
`

const ReminderBtn = styled.button`
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: ${({ theme }) => theme.colors.navyHover}; }
`
```

- [ ] **Étape 8 : Remplacer FooterBar + IconInfo par ReminderCard dans le JSX**

Supprimer le bloc `<FooterBar>` et `<IconInfo>` en bas du composant, et le remplacer par :

```tsx
{/* Reminder À paraître */}
<ReminderCard>
  <ReminderIcon>📅</ReminderIcon>
  <ReminderText>
    <strong>Catalogue À paraître disponible</strong>
    <p>Consultez les nouveaux titres prévus. Commandes auprès de votre représentant.</p>
  </ReminderText>
  <ReminderBtn onClick={() => navigate('/a-paraitre')}>
    Voir le catalogue
  </ReminderBtn>
</ReminderCard>
```

Supprimer aussi les imports/styles inutilisés (`FooterBar`, `FooterText`, `IconInfo`) s'ils ne sont pas utilisés ailleurs.

- [ ] **Étape 9 : Vérifier les tests**

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 10 : Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "fix(homepage): greeting-sub, section labels, panel styles, reminder card"
```

---

## Task 8 — Corrections contenu FondsPage

**Files:**
- Modify: `src/pages/fonds/FondsPage.tsx`

Corrections pour coller au mockup `fonds.html` :
1. Page header en flex avec border-bottom + view-toggle grille/liste
2. SVG search icon (plus l'emoji)
3. ResultsCount plus grand et en ardoise
4. Padding de page correspondant au mockup

- [ ] **Étape 1 : Mettre à jour le layout de la Page**

```tsx
const Page = styled.div`
  padding: 28px 32px 48px;
  flex: 1;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`
```

- [ ] **Étape 2 : Mettre à jour PageHeader (flex + border-bottom)**

```tsx
const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(42,42,40,.12);
`
```

- [ ] **Étape 3 : Ajouter ViewToggle styled-components**

```tsx
const ViewToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.white};
  border: 1.5px solid rgba(42,42,40,.12);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`

const ViewBtn = styled.button<{ $active: boolean }>`
  width: 34px;
  height: 34px;
  background: ${({ $active, theme }) => $active ? theme.colors.navy : 'none'};
  border: none;
  cursor: pointer;
  color: ${({ $active, theme }) => $active ? theme.colors.white : theme.colors.gray[400]};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .12s, color .12s;

  &:hover:not([aria-pressed='true']) {
    background: ${({ theme }) => theme.colors.gray[50]};
  }
`
```

- [ ] **Étape 4 : Ajouter l'état view dans FondsPage et afficher le PageHeader corrigé**

Ajouter l'état :
```tsx
const [view, setView] = useState<'grid' | 'list'>('grid')
```

Dans le JSX, remplacer `<PageHeader>` par :
```tsx
<PageHeader>
  <div>
    <PageEyebrow>Catalogue</PageEyebrow>
    <PageTitle>Fonds</PageTitle>
    <PageSubtitle>Titres déjà parus, disponibles à la commande immédiate</PageSubtitle>
  </div>
  <ViewToggle>
    <ViewBtn
      $active={view === 'grid'}
      aria-pressed={view === 'grid'}
      title="Vue grille"
      onClick={() => setView('grid')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    </ViewBtn>
    <ViewBtn
      $active={view === 'list'}
      aria-pressed={view === 'list'}
      title="Vue liste"
      onClick={() => setView('list')}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    </ViewBtn>
  </ViewToggle>
</PageHeader>
```

- [ ] **Étape 5 : Remplacer l'emoji search par un SVG**

Supprimer `SearchIcon` (l'emoji) et `SearchWrapper` (avec `input { padding-left: 42px }`).

Remplacer par :
```tsx
const PageSearchWrap = styled.div`
  position: relative;
  max-width: 520px;
`

const PageSearchIcon = styled.span`
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.gray[400]};
  display: flex;
  align-items: center;
`
```

Et dans le JSX :
```tsx
<PageSearchWrap>
  <PageSearchIcon>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  </PageSearchIcon>
  <Input
    id="fonds-search"
    type="search"
    placeholder="Titre, auteur, ISBN, éditeur…"
    value={query}
    onChange={e => setQuery(e.target.value)}
    aria-label="Rechercher dans les fonds"
    style={{ paddingLeft: '40px' }}
  />
</PageSearchWrap>
```

- [ ] **Étape 6 : Mettre à jour ResultsCount (18px, gras, ardoise)**

```tsx
const ResultsCount = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  letter-spacing: -0.01em;

  span {
    font-size: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.gray[400]};
    margin-left: 6px;
  }
`
```

Et dans le JSX :
```tsx
<ResultsCount>
  {sorted.length} titre{sorted.length > 1 ? 's' : ''}
  <span>· {universe ? universe : 'toutes thématiques'}</span>
</ResultsCount>
```

- [ ] **Étape 7 : Vérifier les tests**

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] **Étape 8 : Commit**

```bash
git add src/pages/fonds/FondsPage.tsx
git commit -m "fix(fonds): page header view-toggle, SVG search, ResultsCount style mockup"
```

---

## Vérification finale

- [ ] Lancer le dev server et vérifier visuellement desktop :

```bash
npm run dev
```

Ouvrir `http://localhost:5173` et vérifier :
- [ ] Sidebar visible à gauche avec "FlowDiff PRO" en haut
- [ ] Topbar blanche avec recherche + boutons
- [ ] HomePage : greeting-sub, section labels, cards avec border-radius, reminder card champagne en bas
- [ ] FondsPage : page header avec toggle, SVG search icon, count en gros

- [ ] Tests finaux :

```bash
npm run test -- --run 2>&1 | tail -5
```
Attendu : `161 passed`

- [ ] Commit final si tout est OK

```bash
git add -p
git commit -m "chore: vérification conformité maquettes — layout + HomePage + FondsPage"
```
