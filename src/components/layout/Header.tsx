import { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Wordmark'

const GOLD        = '#C9A84C'
const GOLD_BG     = 'rgba(201,168,76,0.15)'
const GOLD_BORDER = 'rgba(201,168,76,0.4)'

const HeaderBar = styled.header`
  position: fixed;
  top: 0; left: 0; right: 0;
  height: ${({ theme }) => theme.layout.headerHeight};
  background-color: ${({ theme }) => theme.colors.navy};
  border-bottom: 1px solid rgba(255,255,255,0.10);
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  gap: 12px;
  z-index: 100;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    left: ${({ theme }) => theme.layout.sidebarWidth};
  }
`

const LogoWrap = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

const RightSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
`

/* ── Recherche ── */
const SearchWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const SearchIconWrap = styled.span`
  position: absolute;
  left: 9px;
  display: flex;
  align-items: center;
  pointer-events: none;
  opacity: 0.5;
`

const SearchInput = styled.input`
  width: 220px;
  padding: 6px 12px 6px 30px;
  background: rgba(255,255,255,0.10);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  outline: none;
  transition: width 0.2s ease, background 0.15s ease;
  appearance: none;

  &::placeholder {
    color: rgba(255,255,255,0.45);
    font-size: 12px;
  }

  &::-webkit-search-cancel-button { display: none; }

  &:focus {
    width: 260px;
    background: rgba(255,255,255,0.15);
    outline: none;
  }
`

/* ── Notifications ── */
const NotifBtn = styled.button`
  width: 32px; height: 32px;
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
`

const NotifDot = styled.span`
  position: absolute;
  top: 4px; right: 4px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #e24b4a;
  pointer-events: none;
`

/* ── Panier ── */
const CartBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${GOLD_BG};
  border: 1px solid ${GOLD_BORDER};
  border-radius: 6px;
  padding: 5px 12px;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 500;
  color: ${GOLD};
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: rgba(201,168,76,0.24); }
`

const CartBadge = styled.span`
  background: ${GOLD};
  color: #3d2f00;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 0 6px;
  margin-left: 4px;
  line-height: 1.7;
`

/* ── Icônes SVG ── */
function IconSearch() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function IconCartSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

/* ── Props ── */
interface HeaderProps {
  cartCount?: number
  onBurgerClick?: () => void
  onCartClick?: () => void
  hasNotif?: boolean
}

export function Header({ cartCount = 0, onBurgerClick, onCartClick, hasNotif = true }: HeaderProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <HeaderBar>
      <LogoWrap onClick={onBurgerClick}>
        <Wordmark onDark size="sm" />
      </LogoWrap>

      <RightSection>
        <SearchWrap>
          <SearchIconWrap><IconSearch /></SearchIconWrap>
          <SearchInput
            id="header-search-input"
            type="search"
            placeholder="Titre, auteur, ISBN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKey}
            aria-label="Recherche globale"
          />
        </SearchWrap>

        <NotifBtn aria-label="Notifications">
          <IconBell />
          {hasNotif && <NotifDot />}
        </NotifBtn>

        <CartBtn
          onClick={onCartClick}
          aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
        >
          <IconCartSvg />
          Panier
          {cartCount > 0 && (
            <CartBadge>{cartCount > 99 ? '99+' : cartCount}</CartBadge>
          )}
        </CartBtn>
      </RightSection>
    </HeaderBar>
  )
}
