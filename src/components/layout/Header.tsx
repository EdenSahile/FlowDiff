import { useState, useRef, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Wordmark'
import {
  MOCK_BOOKS,
  GENRE_BY_UNIVERSE,
  PRICE_RANGES,
  LANGUAGES,
  searchBooks,
  type Universe,
} from '@/data/mockBooks'

const GOLD        = '#C9A84C'
const GOLD_BG     = 'rgba(201,168,76,0.15)'
const GOLD_BORDER = 'rgba(201,168,76,0.4)'

const UNIVERSES: Universe[] = ['Littérature', 'BD/Mangas', 'Jeunesse', 'Adulte-pratique']
const FORMATS = ['Poche', 'Grand format', 'Broché', 'Relié', 'Numérique']

/* ── Header bar ── */
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

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    flex-wrap: wrap;
    height: auto;
    padding: 10px ${({ theme }) => theme.spacing.md};
    gap: 8px 0;
    align-items: center;
  }
`

const LogoWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    order: 1;
  }
`

const BurgerBtn = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.10);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px;
  flex-shrink: 0;
  transition: background 0.15s;

  span {
    display: block;
    width: 100%;
    height: 2px;
    background: #fff;
    border-radius: 2px;
  }

  &:hover { background: rgba(255,255,255,0.18); }
  &:active { background: rgba(255,255,255,0.25); }
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    order: 2;
    margin-left: auto;
    gap: 8px;
  }

  @media (max-width: 479px) {
    gap: 6px;
  }
`

/* ── Search container (wraps input + filters btn + panel) ── */
const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    order: 3;
    flex: none;
    width: 100%;
    margin-top: 4px;
    justify-content: flex-start;
  }
`

const SearchWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    flex: 1;
  }
`

const SearchIconWrap = styled.span`
  position: absolute;
  left: 11px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #555;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    color: rgba(255,255,255,0.7);
    left: 11px;
  }
`

const SearchInput = styled.input`
  width: 380px;
  padding: 9px 14px 9px 34px;
  background: #dcdcdc;
  border: none;
  border-radius: 8px;
  color: #111;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  outline: none;
  transition: width 0.2s ease, background 0.15s ease, box-shadow 0.15s ease;
  appearance: none;

  &::placeholder {
    color: #777;
    font-size: 13px;
  }

  &::-webkit-search-cancel-button { display: none; }

  &:focus {
    width: 480px;
    background: #ebebeb;
    box-shadow: 0 0 0 2px rgba(34,98,65,0.25);
    outline: none;
  }

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    width: 100%;
    background: rgba(255,255,255,0.18);
    color: #fff;
    &::placeholder { color: rgba(255,255,255,0.6); }
    &:focus {
      width: 100%;
      background: rgba(255,255,255,0.24);
      box-shadow: none;
    }
    font-size: 14px;
    padding: 9px 12px 9px 36px;
  }
`

const AdvancedBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${({ $active }) => $active ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.09)'};
  border: 1px solid ${({ $active }) => $active ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.14)'};
  border-radius: 6px;
  padding: 5px 10px;
  color: ${({ $active }) => $active ? '#fff' : 'rgba(255,255,255,0.60)'};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: rgba(255,255,255,0.18);
    color: #fff;
    border-color: rgba(255,255,255,0.30);
  }

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    padding: 7px 12px;
    font-size: 13px;
    align-self: stretch;
    align-items: center;
  }
`

const AdvBtnLabel = styled.span``

const ActiveBadge = styled.span`
  background: ${GOLD};
  color: #3d2f00;
  font-size: 9px;
  font-weight: 700;
  border-radius: 10px;
  padding: 0 5px;
  line-height: 1.8;
  margin-left: 1px;
`

/* ── Advanced panel ── */
const AdvancedPanel = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.layout.headerHeight};
  right: 0;
  z-index: 200;
  background: #fff;
  border-radius: 0 0 14px 14px;
  box-shadow: 0 12px 40px rgba(28,58,95,0.20), 0 2px 8px rgba(28,58,95,0.08);
  border: 1px solid rgba(28,58,95,0.08);
  width: 480px;
  max-width: 100vw;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    top: ${({ theme }) => theme.layout.mobileHeaderHeight};
    width: 100vw;
    left: 0;
    border-radius: 0 0 16px 16px;
    padding: 0;
    gap: 0;
    max-height: calc(100dvh - ${({ theme }) => theme.layout.mobileHeaderHeight});
    overflow: hidden;
  }
`

const PanelScrollBody = styled.div`
  display: contents;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: flex;
    flex-direction: column;
    gap: 14px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 14px 16px 8px;
    -webkit-overflow-scrolling: touch;
  }
`

const PanelSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PanelLabel = styled.p`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chip = styled.button<{ $active: boolean }>`
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
  background: ${({ $active, theme }) => $active ? theme.colors.navy : '#fff'};
  color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.gray[800]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: all .12s;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ $active, theme }) => $active ? '#fdfdfd' : theme.colors.navy};
  }

  &:disabled {
    opacity: 0.32;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.gray[100]};
    border-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`

const PanelDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.gray[100]};
`

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 2px;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    flex-shrink: 0;
    padding: 12px 16px 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
    background: #fff;
  }
`

const ResultCount = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
`

const ResultCountSub = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const ResetLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  transition: color .12s;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const ApplyBtn = styled.button`
  padding: 9px 22px;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .12s;
  &:hover { background: #25477A; }
`

/* ── Mobile backdrop ── */
const MobileBackdrop = styled.div`
  display: none;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: block;
    position: fixed;
    inset: 0;
    top: ${({ theme }) => theme.layout.mobileHeaderHeight};
    background: rgba(0,0,0,0.45);
    z-index: 99;
  }
`

/* ── Panel mobile header (titre + fermer) ── */
const MobilePanelTop = styled.div`
  display: none;

  @media (max-width: calc(${({ theme }) => theme.breakpoints.mobile} - 1px)) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    flex-shrink: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  }
`

const MobilePanelTitle = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
`

const ClosePanelBtn = styled.button`
  width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.gray[100]};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[600]};
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.gray[200]}; }
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

  @media (max-width: 479px) {
    width: 28px; height: 28px;
  }
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
const CartLabel = styled.span`
  @media (max-width: 479px) {
    display: none;
  }
`

const CartBtn = styled.button<{ $hasItems: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;

  @media (max-width: 479px) {
    padding: 0 10px;
    min-height: 36px;
    gap: 4px;
  }

  ${({ $hasItems }) => $hasItems ? `
    background: ${GOLD};
    border: 1.5px solid ${GOLD};
    color: #1E3A5F;
    box-shadow: 0 2px 8px rgba(201,168,76,0.35);
    &:hover { background: #d4b05a; border-color: #d4b05a; box-shadow: 0 4px 14px rgba(201,168,76,0.45); }
    &:active { background: #b8962e; border-color: #b8962e; }
  ` : `
    background: transparent;
    border: 1.5px solid rgba(201,168,76,0.5);
    color: ${GOLD};
    &:hover { background: rgba(201,168,76,0.12); border-color: ${GOLD}; }
  `}

  &:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
`

const CartBadge = styled.span`
  background: #1E3A5F;
  color: #fff;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 1.6;
`

/* ── Icônes SVG ── */
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function IconSliders() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
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

function IconCartSvg({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" fill={filled ? 'currentColor' : 'none'}/>
      <circle cx="20" cy="21" r="1" fill={filled ? 'currentColor' : 'none'}/>
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
  const [showPanel, setShowPanel]     = useState(false)
  const [selUniverse, setSelUniverse] = useState<Universe | null>(null)
  const [selGenre, setSelGenre]       = useState<string | null>(null)
  const [selLangue, setSelLangue]     = useState<string | null>(null)
  const [selPrix, setSelPrix]         = useState<string | null>(null)
  const [selFormat, setSelFormat]     = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  const activeCount = (selUniverse ? 1 : 0) + (selGenre ? 1 : 0) + (selLangue ? 1 : 0) + (selPrix ? 1 : 0) + (selFormat ? 1 : 0)

  /* ── Base books (by search query) ── */
  const baseBooks = useMemo(() =>
    search.trim() ? searchBooks(search) : [...MOCK_BOOKS],
    [search]
  )

  /* ── Helper: apply price range filter ── */
  function applyPrix(books: typeof MOCK_BOOKS, label: string | null) {
    if (!label) return books
    const r = PRICE_RANGES.find(r => r.label === label)
    return r ? books.filter(b => b.priceTTC >= r.min && b.priceTTC < r.max) : books
  }

  /* ── For each group: books filtered by ALL OTHER groups ── */
  const booksForUniverse = useMemo(() => {
    let b = baseBooks
    if (selGenre)  b = b.filter(x => x.genre === selGenre)
    if (selLangue) b = b.filter(x => x.language === selLangue)
    b = applyPrix(b, selPrix)
    if (selFormat) b = b.filter(x => x.format === selFormat)
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selGenre, selLangue, selPrix, selFormat])

  const booksForGenre = useMemo(() => {
    let b = baseBooks
    if (selUniverse) b = b.filter(x => x.universe === selUniverse)
    if (selLangue)   b = b.filter(x => x.language === selLangue)
    b = applyPrix(b, selPrix)
    if (selFormat)   b = b.filter(x => x.format === selFormat)
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selLangue, selPrix, selFormat])

  const booksForLangue = useMemo(() => {
    let b = baseBooks
    if (selUniverse) b = b.filter(x => x.universe === selUniverse)
    if (selGenre)    b = b.filter(x => x.genre === selGenre)
    b = applyPrix(b, selPrix)
    if (selFormat)   b = b.filter(x => x.format === selFormat)
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selGenre, selPrix, selFormat])

  const booksForPrix = useMemo(() => {
    let b = baseBooks
    if (selUniverse) b = b.filter(x => x.universe === selUniverse)
    if (selGenre)    b = b.filter(x => x.genre === selGenre)
    if (selLangue)   b = b.filter(x => x.language === selLangue)
    if (selFormat)   b = b.filter(x => x.format === selFormat)
    return b
  }, [baseBooks, selUniverse, selGenre, selLangue, selFormat])

  const booksForFormat = useMemo(() => {
    let b = baseBooks
    if (selUniverse) b = b.filter(x => x.universe === selUniverse)
    if (selGenre)    b = b.filter(x => x.genre === selGenre)
    if (selLangue)   b = b.filter(x => x.language === selLangue)
    b = applyPrix(b, selPrix)
    return b
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selGenre, selLangue, selPrix])

  /* ── Available options per group ── */
  const availableUniverses = useMemo(() => new Set(booksForUniverse.map(b => b.universe)), [booksForUniverse])
  const availableGenres    = useMemo(() => new Set(booksForGenre.map(b => b.genre).filter(Boolean) as string[]), [booksForGenre])
  const availableLangues   = useMemo(() => new Set(booksForLangue.map(b => b.language).filter(Boolean) as string[]), [booksForLangue])
  const availablePrix      = useMemo(() => {
    const s = new Set<string>()
    PRICE_RANGES.forEach(r => {
      if (booksForPrix.some(b => b.priceTTC >= r.min && b.priceTTC < r.max)) s.add(r.label)
    })
    return s
  }, [booksForPrix])
  const availableFormats   = useMemo(() => new Set(booksForFormat.map(b => b.format).filter(Boolean) as string[]), [booksForFormat])

  /* ── Auto-clear selections that become unavailable ── */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selGenre  && !availableGenres.has(selGenre))   setSelGenre(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableGenres])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selLangue && !availableLangues.has(selLangue)) setSelLangue(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableLangues])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selPrix   && !availablePrix.has(selPrix))      setSelPrix(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availablePrix])
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selFormat && !availableFormats.has(selFormat)) setSelFormat(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFormats])

  /* ── Filtered count (all filters applied) ── */
  const filteredCount = useMemo(() => {
    let b = baseBooks
    if (selUniverse) b = b.filter(x => x.universe === selUniverse)
    if (selGenre)    b = b.filter(x => x.genre === selGenre)
    if (selLangue)   b = b.filter(x => x.language === selLangue)
    b = applyPrix(b, selPrix)
    if (selFormat)   b = b.filter(x => x.format === selFormat)
    return b.length
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseBooks, selUniverse, selGenre, selLangue, selPrix, selFormat])

  /* close panel on outside click */
  useEffect(() => {
    if (!showPanel) return
    function handler(e: MouseEvent) {
      if (containerRef.current?.contains(e.target as Node)) return
      setShowPanel(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPanel])

  function handleReset() {
    setSelUniverse(null)
    setSelGenre(null)
    setSelLangue(null)
    setSelPrix(null)
    setSelFormat(null)
  }

  function buildParams(q: string) {
    const params = new URLSearchParams()
    if (q.trim())    params.set('q', q.trim())
    if (selUniverse) params.set('universe', selUniverse)
    if (selGenre)    params.set('genres',   selGenre)
    if (selLangue)   params.set('langues',  selLangue)
    if (selPrix)     params.set('prix',     selPrix)
    if (selFormat)   params.set('formats',  selFormat)
    return params.toString()
  }

  function handleApply() {
    navigate(`/recherche?${buildParams(search)}`)
    setShowPanel(false)
  }

  function handleSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && (search.trim() || activeCount > 0)) {
      navigate(`/recherche?${buildParams(search)}`)
      setSearch('')
    }
  }

  return (
    <>
      {showPanel && <MobileBackdrop onClick={() => setShowPanel(false)} aria-hidden="true" />}

      <HeaderBar>
        <LogoWrap>
          <BurgerBtn onClick={onBurgerClick} aria-label="Ouvrir le menu">
            <span /><span /><span />
          </BurgerBtn>
          <Wordmark onDark size="sm" />
        </LogoWrap>

        <SearchContainer ref={containerRef}>
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

          <AdvancedBtn
            $active={showPanel || activeCount > 0}
            onClick={() => setShowPanel(v => !v)}
            aria-label="Filtres avancés"
            aria-expanded={showPanel}
          >
            <IconSliders />
            <AdvBtnLabel>Filtres</AdvBtnLabel>
            {activeCount > 0 && <ActiveBadge>{activeCount}</ActiveBadge>}
          </AdvancedBtn>

          {showPanel && (
            <AdvancedPanel role="dialog" aria-label="Filtres de recherche avancée">

              <MobilePanelTop>
                <MobilePanelTitle>Filtres</MobilePanelTitle>
                <ClosePanelBtn onClick={() => setShowPanel(false)} aria-label="Fermer les filtres">✕</ClosePanelBtn>
              </MobilePanelTop>

              <PanelScrollBody>
                <PanelSection>
                  <PanelLabel>Thématique</PanelLabel>
                  <ChipGroup>
                    <Chip $active={selUniverse === null} onClick={() => setSelUniverse(null)}>Toutes</Chip>
                    {UNIVERSES.map(u => (
                      <Chip
                        key={u}
                        $active={selUniverse === u}
                        disabled={!availableUniverses.has(u)}
                        onClick={() => setSelUniverse(selUniverse === u ? null : u)}
                      >
                        {u}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                {selUniverse && (
                  <PanelSection>
                    <PanelLabel>Genre</PanelLabel>
                    <ChipGroup>
                      {GENRE_BY_UNIVERSE[selUniverse].map(g => (
                        <Chip
                          key={g}
                          $active={selGenre === g}
                          disabled={!availableGenres.has(g)}
                          onClick={() => setSelGenre(selGenre === g ? null : g)}
                        >
                          {g}
                        </Chip>
                      ))}
                    </ChipGroup>
                  </PanelSection>
                )}

                <PanelDivider />

                <PanelSection>
                  <PanelLabel>Langue</PanelLabel>
                  <ChipGroup>
                    {LANGUAGES.map(l => (
                      <Chip
                        key={l}
                        $active={selLangue === l}
                        disabled={!availableLangues.has(l)}
                        onClick={() => setSelLangue(selLangue === l ? null : l)}
                      >
                        {l}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                <PanelSection>
                  <PanelLabel>Prix</PanelLabel>
                  <ChipGroup>
                    {PRICE_RANGES.map(r => (
                      <Chip
                        key={r.label}
                        $active={selPrix === r.label}
                        disabled={!availablePrix.has(r.label)}
                        onClick={() => setSelPrix(selPrix === r.label ? null : r.label)}
                      >
                        {r.label}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                <PanelSection>
                  <PanelLabel>Format</PanelLabel>
                  <ChipGroup>
                    {FORMATS.map(f => (
                      <Chip
                        key={f}
                        $active={selFormat === f}
                        disabled={!availableFormats.has(f)}
                        onClick={() => setSelFormat(selFormat === f ? null : f)}
                      >
                        {f}
                      </Chip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                <PanelDivider />
              </PanelScrollBody>

              <PanelFooter>
                <ResetLink onClick={handleReset}>Réinitialiser les filtres</ResetLink>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ResultCount>
                    {filteredCount}{' '}
                    <ResultCountSub>ouvrage{filteredCount !== 1 ? 's' : ''}</ResultCountSub>
                  </ResultCount>
                  <ApplyBtn onClick={handleApply}>Voir les résultats</ApplyBtn>
                </div>
              </PanelFooter>

            </AdvancedPanel>
          )}
        </SearchContainer>

        <RightSection>
          <NotifBtn aria-label="Notifications">
            <IconBell />
            {hasNotif && <NotifDot />}
          </NotifBtn>

          <CartBtn
            $hasItems={cartCount > 0}
            onClick={onCartClick}
            aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
          >
            <IconCartSvg filled={cartCount > 0} />
            <CartLabel>Panier</CartLabel>
            {cartCount > 0 && (
              <CartBadge>{cartCount > 99 ? '99+' : cartCount}</CartBadge>
            )}
          </CartBtn>
        </RightSection>
      </HeaderBar>
    </>
  )
}
