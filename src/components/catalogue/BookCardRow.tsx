import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import type { Book, Universe } from '@/data/mockBooks'
import { BookCover } from './BookCover'
import { useOrders } from '@/contexts/OrdersContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { ORDER_STATUS_LABELS } from '@/data/mockOrders'

/* ══════════════════════════════════════════════════════
   TYPES & DONNÉES
══════════════════════════════════════════════════════ */

interface EbookOption {
  hebergeur: string
  format: string
  price: number
  isbnEbook: string
  droits: { lectureEnLigne: boolean; telechargement: boolean; copierColler: boolean; impression: boolean }
  partenaireLabel: string
  partenaireColor: string
}

type Mode = 'print' | 'ebook'

const EBOOK_OPTIONS: Record<Universe, EbookOption[]> = {
  'Littérature': [
    { hebergeur: 'Amalivre',  format: 'PDF',          price: 6.99, isbnEbook: '9782072886PDF', droits: { lectureEnLigne: true,  telechargement: true,  copierColler: true,  impression: false }, partenaireLabel: 'Amalivre',  partenaireColor: '#C47B0A' },
    { hebergeur: 'OpenEdition', format: 'HTML/PDF/EPUB', price: 6.99, isbnEbook: '9782072886EPB', droits: { lectureEnLigne: true,  telechargement: true,  copierColler: false, impression: false }, partenaireLabel: 'OpenEdition', partenaireColor: '#D4500A' },
    { hebergeur: 'Cairn',       format: 'HTML/PDF/EPUB', price: 4.99, isbnEbook: '9782072886CRN', droits: { lectureEnLigne: true,  telechargement: false, copierColler: false, impression: false }, partenaireLabel: 'Cairn',       partenaireColor: '#1A5E8A' },
  ],
  'BD/Mangas': [
    { hebergeur: 'Numilog', format: 'PDF/EPUB', price: 8.99, isbnEbook: '9782756001PDF', droits: { lectureEnLigne: true, telechargement: true, copierColler: true,  impression: false }, partenaireLabel: 'Numilog', partenaireColor: '#2D7A3A' },
    { hebergeur: 'Izneo',   format: 'HTML/PDF',  price: 7.49, isbnEbook: '9782756001IZN', droits: { lectureEnLigne: true, telechargement: true, copierColler: false, impression: false }, partenaireLabel: 'Izneo',   partenaireColor: '#6B3FA0' },
  ],
  'Jeunesse': [
    { hebergeur: 'Numilog',    format: 'PDF/EPUB',      price: 5.99, isbnEbook: '9782070636PDF', droits: { lectureEnLigne: true, telechargement: true,  copierColler: true,  impression: false }, partenaireLabel: 'Numilog',    partenaireColor: '#2D7A3A' },
    { hebergeur: 'OpenEdition',format: 'HTML/PDF/EPUB', price: 4.99, isbnEbook: '9782070636EPB', droits: { lectureEnLigne: true, telechargement: false, copierColler: false, impression: false }, partenaireLabel: 'OpenEdition',partenaireColor: '#D4500A' },
  ],
  'Adulte-pratique': [
    { hebergeur: 'Cairn',   format: 'PDF',      price: 9.99, isbnEbook: '9782035000PDF', droits: { lectureEnLigne: true, telechargement: true, copierColler: true,  impression: true  }, partenaireLabel: 'Cairn',   partenaireColor: '#1A5E8A' },
    { hebergeur: 'Numilog', format: 'PDF/EPUB', price: 8.49, isbnEbook: '9782035000EPB', droits: { lectureEnLigne: true, telechargement: true, copierColler: false, impression: false }, partenaireLabel: 'Numilog', partenaireColor: '#2D7A3A' },
  ],
}

const CLASSIF: Record<Universe, [string, string][]> = {
  'Littérature':     [['843', 'Romans et nouvelles français'], ['PQ', 'Romance Literatures French lit.'], ['050', 'Bibliothèques publiques']],
  'BD/Mangas':       [['741.5', 'Bandes dessinées, comics'],  ['PN', 'Arts graphiques narratifs']],
  'Jeunesse':        [['028.5', 'Litt. pour la jeunesse'],     ['PZ', 'Fiction et poésie jeunesse']],
  'Adulte-pratique': [['640', 'Arts ménagers, vie pratique'],  ['TX', 'Cuisine, gastronomie, loisirs']],
}

const AWARDS: Record<Universe, string[]> = {
  'Littérature':     ['Prix Cinq Continents de la Francophonie 2024 – Prix des Libraires 2024'],
  'BD/Mangas':       ["Fauve d'Angoulême — Sélection officielle 2024"],
  'Jeunesse':        ['Prix Sorcières 2024 – Prix des Incorruptibles'],
  'Adulte-pratique': ['Sélection Fnac Pratique 2024'],
}

const TYPE_META: Record<string, { label: string; bg: string; color: string }> = {
  nouveaute:    { label: 'NV', bg: '#FEF5E0', color: '#B8740A' },
  'a-paraitre': { label: 'AP', bg: '#EEE8FF', color: '#5B33C1' },
  fonds:        { label: 'FC', bg: '#E8F5EE', color: '#1E7045' },
}

function fictiveId(isbn: string) {
  return parseInt(isbn.replace(/\D/g, '').slice(-6), 10).toString()
}

/* ══════════════════════════════════════════════════════
   STYLED COMPONENTS
══════════════════════════════════════════════════════ */

const Card = styled.article<{ $mode: Mode }>`
  background: ${({ $mode }) => $mode === 'ebook' ? '#EDF4FF' : '#FFFFFF'};
  border: 1px solid ${({ $mode }) => $mode === 'ebook' ? '#BEDAFF' : '#E6E1DA'};
  border-radius: 8px;
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: box-shadow 0.15s, background-color 0.25s, border-color 0.25s;

  &:hover { box-shadow: 0 4px 16px rgba(28,50,82,0.10); }
`

/* ── Rangée principale : sidebar cover + grille 3 cols ── */
const MainRow = styled.div`
  display: flex;
  cursor: pointer;
`

const CoverSidebar = styled.div`
  width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 16px 12px;
  border-right: 1px solid #E6E1DA;
  gap: 10px;

  @media (max-width: 767px) {
    width: 90px;
    padding: 12px 10px 8px;
  }
`

const CoverDots = styled.div`
  display: flex;
  gap: 4px;
`

const Dot = styled.span<{ $active?: boolean }>`
  width: 6px; height: 6px;
  border-radius: 50%;
  background: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[200]};
`

/* Grille 3 colonnes ÉGALES */
const TextGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Col = styled.div<{ $border?: boolean }>`
  padding: 12px 16px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-left: ${({ $border }) => $border ? '1px solid #E6E1DA' : 'none'};

  @media (max-width: 767px) {
    ${({ $border }) => $border && 'display: none;'}
  }
`

/* ── Col 1 : bibliographie ── */
const BookTitle = styled.h3`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.3;
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-bottom: 1px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

const Authors = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MetaLine = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
`

const MetaItalic = styled(MetaLine)`
  font-style: italic;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const IsbnLine = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 2px;
  letter-spacing: 0.01em;
`

/* ── Col 2 : classifications ── */
const ClassifItem = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ClassifCode = styled.b`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-right: 4px;
`

/* ── Col 3 : badge + avis + partenaire + droits ── */
const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
`

const TypeBadge = styled.span<{ $bg: string; $color: string }>`
  font-size: 10px;
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border-radius: 3px;
  padding: 2px 7px;
  letter-spacing: 0.05em;
`

const EbookBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  border-radius: 3px;
  padding: 2px 7px;
  letter-spacing: 0.05em;
`

const IdText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const StarsLine = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.4;
`

const AwardLine = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-style: italic;
  line-height: 1.4;
`

/* Lien partenaire — visible, coloré, avec icône */
const PartenaireLink = styled.a<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${({ $color }) => $color}15;
  border: 1px solid ${({ $color }) => $color}40;
  font-size: 11px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  text-decoration: none;
  cursor: pointer;
  transition: background .12s, transform .1s;
  white-space: nowrap;

  &:hover {
    background: ${({ $color }) => $color}25;
    transform: translateY(-1px);
  }

  svg { flex-shrink: 0; }
`

/* Droits d'usage */
const DroitsWrap = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const DroitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const DroitDot = styled.span<{ $ok: boolean }>`
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $ok, theme }) => $ok ? theme.colors.success : theme.colors.error};
`

const DroitLabel = styled.span`
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

/* ── Barre de commande ── */
const OrderBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 14px;
  height: 38px;
  border-top: 1px solid #E6E1DA;
  background: #FAFAF8;

  @media (max-width: 767px) {
    flex-wrap: wrap;
    height: auto;
    padding: 8px 10px;
    gap: 6px;
  }
`

const AvailStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding-right: 12px;
  flex-shrink: 0;
`

const GreenDot = styled.span`
  width: 7px; height: 7px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.success};
`

const AvailText = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.success};
`

const VLine = styled.span`
  width: 1px; height: 18px;
  background: #E6E1DA;
  flex-shrink: 0;

  @media (max-width: 767px) {
    display: none;
  }
`

/* ── Custom dropdown ── */
const FormatSelectWrap = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  position: relative;

  @media (max-width: 767px) {
    width: 100%;
    flex: none;
    padding: 0;
  }
`

const DropdownTrigger = styled.button<{ $open: boolean; $isEbook: boolean }>`
  width: 447px;
  height: 32px;

  @media (max-width: 767px) {
    width: 100%;
  }
  padding: 0 36px 0 14px;
  border: 1.5px solid ${({ $open, $isEbook }) => $open ? '#1E3A5F' : $isEbook ? '#BEDAFF' : '#D8D3CC'};
  border-radius: 7px;
  background-color: ${({ $isEbook }) => $isEbook ? '#EDF4FF' : '#fff'};
  color: #1E3A5F;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: 0.01em;
  box-shadow: ${({ $open }) => $open ? '0 0 0 3px rgba(28,50,82,.10)' : 'none'};
  transition: border-color .15s, box-shadow .15s, background-color .15s;
  position: relative;

  &:hover { border-color: #1E3A5F; }

  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%) ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0)'};
    width: 0; height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #1E3A5F;
    transition: transform .15s;
  }
`

const TriggerLabel = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const DropdownPanel = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: 447px;
  background: #fff;
  border: 1.5px solid #1E3A5F;
  border-radius: 9px;
  box-shadow: 0 8px 24px rgba(28,50,82,0.18);
  z-index: 9999;
  overflow: hidden;

  @media (max-width: 767px) {
    left: 8px !important;
    right: 8px;
    width: auto;
  }
`

const DropGroupLabel = styled.div`
  padding: 8px 14px 4px;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: #AAA49C;
  background: #fff;
  border-bottom: 1px solid #F0EDE8;
`

const DropOption = styled.div<{ $active: boolean; $isEbook?: boolean }>`
  padding: 9px 14px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12.5px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  color: #1E3A5F;
  background: ${({ $active, $isEbook }) =>
    $active && $isEbook ? '#D6EAFF' :
    $active ? '#F0EDE8' : '#fff'};
  cursor: pointer;
  transition: background .1s;
  border-bottom: 1px solid #F7F5F2;

  &:last-child { border-bottom: none; }
  &:hover { background: ${({ $isEbook }) => $isEbook ? '#E5F2FF' : '#F5F2EE'}; }
`

const DropOptionIcon = styled.span`font-size: 13px; flex-shrink: 0;`

const DropOptionText = styled.span`flex: 1; min-width: 0;`

const DropOptionPrice = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #1E3A5F;
  opacity: 0.75;
  flex-shrink: 0;
`

const DropCheckmark = styled.span`
  font-size: 11px;
  color: #1E3A5F;
  flex-shrink: 0;
  width: 14px;
`

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding-left: 12px;
  border-left: 1px solid #E6E1DA;

  @media (max-width: 767px) {
    width: 100%;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid #E6E1DA;
    padding-top: 6px;
  }
`

const CtrlItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  border-right: 1px solid #E6E1DA;

  &:last-child { border-right: none; }
`

const CheckBox = styled.input`
  width: 14px; height: 14px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.navy};
`

const CtrlLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const QtyInput = styled.input`
  width: 34px; height: 22px;
  border: 1px solid #E6E1DA;
  border-radius: 3px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.navy};
  background: #fff;

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.navy}; }
  &::-webkit-inner-spin-button { display: none; }
`

const AmBtn = styled.button`
  padding: 5px 14px;
  border: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fdfdfd;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: background .15s;
  white-space: nowrap;

  &:hover { background: ${({ theme }) => theme.colors.navyHover}; }
`


/* ══════════════════════════════════════════════════════
   MODALE ANTÉCÉDENTS AM
══════════════════════════════════════════════════════ */
const AMOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(10,20,40,0.55);
  z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`

const AMBox = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(10,20,40,0.25);
  width: 100%; max-width: 960px;
  max-height: 80vh;
  display: flex; flex-direction: column;
  overflow: hidden;

  @media (max-width: 767px) {
    max-width: calc(100vw - 16px);
    border-radius: 10px;
  }
`

const AMBodyScroll = styled.div`
  overflow-x: auto;
  flex: 1;
`

const AMHead = styled.div`
  background: ${({ theme }) => theme.colors.navy};
  padding: 14px 18px;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
`

const AMHeadLeft = styled.div`display: flex; flex-direction: column; gap: 2px;`

const AMHeadLabel = styled.span`
  font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
`

const AMHeadTitle = styled.span`
  font-size: 14px; font-weight: 700; color: #fff;
`

const AMHeadIsbn = styled.span`
  font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.02em;
`

const AMCloseBtn = styled.button`
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25);
  border-radius: 6px; color: rgba(255,255,255,0.8); font-size: 15px;
  width: 30px; height: 30px; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
  &:hover { background: rgba(255,255,255,0.22); color: #fff; }
`

const AMBody = styled.div`overflow-y: auto; flex: 1;`

const AMTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

const AMThead = styled.thead`
  background: #F5F3EF; position: sticky; top: 0;
`

const AMTh = styled.th`
  text-align: left; padding: 8px 12px;
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: ${({ theme }) => theme.colors.gray[400]};
  border-bottom: 2px solid #E6E1DA; white-space: nowrap;
  &:last-child { text-align: right; }
`

const AMTr = styled.tr`
  border-bottom: 1px solid #F0EDE8;
  &:last-child { border-bottom: none; }
  &:hover { background: #FAFAF8; }
`

const AMTd = styled.td<{ $right?: boolean; $bold?: boolean }>`
  padding: 9px 12px;
  color: ${({ theme }) => theme.colors.navy};
  font-weight: ${({ $bold }) => $bold ? 600 : 400};
  text-align: ${({ $right }) => $right ? 'right' : 'left'};
  white-space: nowrap;
`

const TypeBadgeAM = styled.span<{ $type: 'MONO' | 'AP' | 'SUITE' }>`
  display: inline-block;
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
  border-radius: 3px; padding: 2px 7px;
  background: ${({ $type }) =>
    $type === 'MONO'  ? '#EEF2FF' :
    $type === 'AP'    ? '#FFF3E0' :
    '#E8F5E9'};
  color: ${({ $type }) =>
    $type === 'MONO'  ? '#3B5FD9' :
    $type === 'AP'    ? '#B8740A' :
    '#2E7D32'};
`

const StatusDot = styled.span<{ $status: string }>`
  display: inline-flex; align-items: center; gap: 5px;
  &::before {
    content: '';
    display: inline-block; width: 7px; height: 7px; border-radius: 50%;
    background: ${({ $status }) =>
      $status === 'en cours' ? '#FFC000' :
      $status === 'expédié'  ? '#1E7045' :
      $status === 'reçu'     ? '#1A5E8A' :
      '#757575'};
  }
`

const AMEmpty = styled.div`
  padding: 40px; text-align: center;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
`

const AMFooter = styled.div`
  padding: 10px 18px;
  background: #FAFAF8; border-top: 1px solid #E6E1DA;
  display: flex; align-items: center; justify-content: space-between;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px; color: ${({ theme }) => theme.colors.gray[400]};
`

const AMFooterTotal = styled.span`
  font-weight: 700; font-size: 13px;
  color: ${({ theme }) => theme.colors.navy};
`

/* ══════════════════════════════════════════════════════
   COMPOSANT
══════════════════════════════════════════════════════ */

interface Props {
  book: Book
  selected: boolean
  onToggle: () => void
}

export function BookCardRow({ book, selected, onToggle }: Props) {
  const navigate   = useNavigate()
  const { orders } = useOrders()
  const { user }   = useAuthContext()

  const [mode, setMode]           = useState<Mode>('print')
  const [selectedEbook, setEbook] = useState<EbookOption | null>(null)
  const [qty, setQty]             = useState(1)
  const [dropOpen, setDropOpen]   = useState(false)
  const [amOpen, setAmOpen]       = useState(false)
  const [panelPos, setPanelPos]   = useState({ top: 0, left: 0 })
  const dropRef                   = useRef<HTMLDivElement>(null)
  const triggerRef                = useRef<HTMLButtonElement>(null)
  const panelRef                  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropOpen) return
    function onOutside(e: MouseEvent) {
      const t = e.target as Node
      const insideTrigger = dropRef.current?.contains(t)
      const insidePanel   = panelRef.current?.contains(t)
      if (!insideTrigger && !insidePanel) setDropOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [dropOpen])

  function openDropdown() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPanelPos({ top: r.bottom + 4, left: r.left + (r.width - 447) / 2 })
    }
    setDropOpen(o => !o)
  }

  const isOrderable = book.type !== 'a-paraitre'
  const badge       = TYPE_META[book.type] ?? TYPE_META['fonds']
  const classif     = CLASSIF[book.universe] ?? []
  const awards      = AWARDS[book.universe] ?? []
  const ebookOpts   = EBOOK_OPTIONS[book.universe] ?? []
  const bookId      = fictiveId(book.isbn)
  const pubYear     = book.publicationDate.slice(0, 4)
  const isReed      = book.publicationDate < '2023-01-01'

  const authorsStr = book.authors.map(a => {
    const parts = a.split(' ')
    return parts.length > 1 ? `${parts.at(-1)}, ${parts.slice(0,-1).join(' ')}` : a
  }).join(' ; ')

  /* Historique de commande pour ce titre — filtré sur le compte connecté */
  const bookOrders = orders
    .filter(o => !user?.codeClient || o.codeClient === user.codeClient)
    .map(o => ({ order: o, item: o.items.find(i => i.bookId === book.id) }))
    .filter((x): x is { order: typeof x.order; item: NonNullable<typeof x.item> } => !!x.item)
    .sort((a, b) => b.order.date.localeCompare(a.order.date))

  const lastType = bookOrders[0]?.item.typeCommande ?? null
  const amLabel  = lastType === 'SUITE' ? 'S' : lastType === 'AP' ? 'A' : lastType === 'MONO' ? 'M' : null

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })

  const isbnDisplay = mode === 'ebook' && selectedEbook
    ? `${selectedEbook.isbnEbook} (${selectedEbook.format})`
    : book.isbn


  return (
    <>
    <Card $mode={mode}>

      {/* ── Rangée principale ── */}
      <MainRow onClick={() => navigate(`/livre/${book.id}`)}>

        {/* Sidebar couverture */}
        <CoverSidebar>
          <BookCover isbn={book.isbn} alt={book.title} width={110} height={154} universe={book.universe} authors={book.authors} publisher={book.publisher} />
          <CoverDots><Dot $active /><Dot /></CoverDots>
        </CoverSidebar>

        {/* 3 colonnes égales */}
        <TextGrid>

          {/* Col 1 — Bibliographie */}
          <Col>
            <BookTitle>{book.title}</BookTitle>
            <Authors>{authorsStr}</Authors>
            <MetaLine>Paris, France : {book.publisher}, {pubYear}</MetaLine>
            {isReed && <MetaLine>Rééd.</MetaLine>}
            {book.pages && <MetaLine>{book.pages} p. – en français</MetaLine>}
            {book.collection && <MetaItalic>({book.collection})</MetaItalic>}
            <IsbnLine>ISBN {isbnDisplay}</IsbnLine>
          </Col>

          {/* Col 2 — Classifications */}
          <Col $border>
            {classif.map(([code, label]) => (
              <ClassifItem key={code}>
                <ClassifCode>[{code}]</ClassifCode>{label}
              </ClassifItem>
            ))}
          </Col>

          {/* Col 3 — Badge, étoiles, avis, droits, partenaire */}
          <Col $border>
            <BadgeRow>
              {mode === 'ebook'
                ? <EbookBadge>EBOOK</EbookBadge>
                : <TypeBadge $bg={badge.bg} $color={badge.color}>{badge.label}</TypeBadge>
              }
              <IdText>ID : {mode === 'ebook' ? '000000' : bookId}</IdText>
            </BadgeRow>

            <StarsLine>★★★ Reviewed by Amalivre</StarsLine>
            {awards.map((a, i) => <AwardLine key={i}>{a}</AwardLine>)}

            {mode === 'ebook' && selectedEbook?.droits && (
              <DroitsWrap>
                {([
                  [selectedEbook.droits.lectureEnLigne,  'Lecture en ligne'],
                  [selectedEbook.droits.telechargement,  'Téléchargement'],
                  [selectedEbook.droits.copierColler,    'Copier/coller'],
                  [selectedEbook.droits.impression,      selectedEbook.droits.impression ? 'Impression' : 'Impression indisponible'],
                ] as [boolean, string][]).map(([ok, label], i) => (
                  <DroitItem key={i}>
                    <DroitDot $ok={ok} />
                    <DroitLabel>{label}</DroitLabel>
                  </DroitItem>
                ))}
              </DroitsWrap>
            )}

            {mode === 'ebook' && selectedEbook && selectedEbook.hebergeur !== 'Amalivre' && (
              <PartenaireLink
                $color={selectedEbook.partenaireColor}
                onClick={e => e.stopPropagation()}
                href="#"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 2H2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V5.5M7 1h3m0 0v3m0-3L5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                En partenariat avec {selectedEbook.partenaireLabel}
              </PartenaireLink>
            )}
          </Col>

        </TextGrid>
      </MainRow>

      {/* ── Barre de commande ── */}
      <OrderBar>

        {/* Statut disponibilité */}
        <AvailStatus>
          <GreenDot />
          <AvailText>{isOrderable ? 'Available' : 'À paraître'}</AvailText>
        </AvailStatus>

        <VLine />

        {/* ─ Select format — centré, taille fixe ─ */}
        <FormatSelectWrap ref={dropRef} onClick={e => e.stopPropagation()}>
          <DropdownTrigger
            ref={triggerRef}
            type="button"
            $open={dropOpen}
            $isEbook={mode === 'ebook'}
            onClick={openDropdown}
          >
            <DropOptionIcon>{mode === 'ebook' ? '💻' : '📖'}</DropOptionIcon>
            <TriggerLabel>
              {mode === 'print'
                ? `Version papier (PRINT) — ${book.priceTTC.toFixed(2)} €`
                : selectedEbook
                  ? `${selectedEbook.hebergeur} · ${selectedEbook.format} — ${selectedEbook.price.toFixed(2)} €`
                  : 'Choisir un format'}
            </TriggerLabel>
          </DropdownTrigger>

          {dropOpen && createPortal(
            <DropdownPanel ref={panelRef} $top={panelPos.top} $left={panelPos.left} onMouseDown={e => e.stopPropagation()}>
              <DropGroupLabel>Version papier</DropGroupLabel>
              <DropOption
                $active={mode === 'print'}
                onClick={() => { setMode('print'); setEbook(null); setDropOpen(false) }}
              >
                <DropOptionIcon>📖</DropOptionIcon>
                <DropOptionText>Version papier (PRINT)</DropOptionText>
                <DropOptionPrice>{book.priceTTC.toFixed(2)} €</DropOptionPrice>
                <DropCheckmark>{mode === 'print' ? '✓' : ''}</DropCheckmark>
              </DropOption>

              {ebookOpts.length > 0 && (
                <>
                  <DropGroupLabel>Versions numériques (EBOOK)</DropGroupLabel>
                  {ebookOpts.map((opt, i) => {
                    const isActive = mode === 'ebook' && selectedEbook?.hebergeur === opt.hebergeur
                    return (
                      <DropOption
                        key={i}
                        $active={isActive}
                        $isEbook
                        onClick={() => { setMode('ebook'); setEbook(opt); setDropOpen(false) }}
                      >
                        <DropOptionIcon>💻</DropOptionIcon>
                        <DropOptionText>{opt.hebergeur} · {opt.format}</DropOptionText>
                        <DropOptionPrice>{opt.price.toFixed(2)} €</DropOptionPrice>
                        <DropCheckmark>{isActive ? '✓' : ''}</DropCheckmark>
                      </DropOption>
                    )
                  })}
                </>
              )}
            </DropdownPanel>,
            document.body
          )}
        </FormatSelectWrap>

        <VLine />

        {/* Contrôles droite */}
        {isOrderable && (
          <RightControls onClick={e => e.stopPropagation()}>
            <CtrlItem>
              <CheckBox
                type="checkbox"
                checked={selected}
                onChange={onToggle}
                id={`sel-${book.id}`}
              />
              <CtrlLabel as="label" htmlFor={`sel-${book.id}`} style={{ cursor: 'pointer' }}>
                Select
              </CtrlLabel>
            </CtrlItem>

            {mode === 'print' && (
              <CtrlItem>
                <CtrlLabel>Qty</CtrlLabel>
                <QtyInput
                  type="number"
                  min={1}
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </CtrlItem>
            )}

            <CtrlItem>
              <AmBtn onClick={e => { e.stopPropagation(); setAmOpen(true) }}>
                {amLabel ? amLabel : 'A M'}
              </AmBtn>
            </CtrlItem>
          </RightControls>
        )}
      </OrderBar>
    </Card>

    {/* ── Modale Historique de commande ── */}
    {amOpen && createPortal(
      <AMOverlay onClick={() => setAmOpen(false)}>
        <AMBox onClick={e => e.stopPropagation()}>

          <AMHead>
            <AMHeadLeft>
              <AMHeadLabel>Historique de commande</AMHeadLabel>
              <AMHeadTitle>{book.title}</AMHeadTitle>
              <AMHeadIsbn>ISBN {book.isbn} · {book.publisher}</AMHeadIsbn>
            </AMHeadLeft>
            <AMCloseBtn onClick={() => setAmOpen(false)} aria-label="Fermer">✕</AMCloseBtn>
          </AMHead>

          <AMBodyScroll>
            {bookOrders.length === 0 ? (
              <AMEmpty>Aucune commande passée pour ce titre.</AMEmpty>
            ) : (
              <AMTable>
                <AMThead>
                  <tr>
                    <AMTh>Type cde.</AMTh>
                    <AMTh>N° compte</AMTh>
                    <AMTh>Commandé par</AMTh>
                    <AMTh>Date cde.</AMTh>
                    <AMTh>N° cde.</AMTh>
                    <AMTh style={{ textAlign: 'center' }}>Date fact.</AMTh>
                    <AMTh style={{ textAlign: 'center' }}>Réf cde.</AMTh>
                    <AMTh>Statut</AMTh>
                  </tr>
                </AMThead>
                <tbody>
                  {bookOrders.map(({ order, item }) => {
                    const typeCde     = item.typeCommande ?? 'MONO'
                    const commandePar = order.commandePar ?? '—'
                    const dateFactStr = order.dateFacturation ? fmtDate(order.dateFacturation) : '—'
                    const refStr      = order.numFacture ?? '—'
                    return (
                      <AMTr key={`${order.id}-${typeCde}`}>
                        <AMTd>
                          <TypeBadgeAM $type={typeCde}>{typeCde}</TypeBadgeAM>
                        </AMTd>
                        <AMTd $bold>{order.codeClient}</AMTd>
                        <AMTd>{commandePar}</AMTd>
                        <AMTd>{fmtDate(order.date)}</AMTd>
                        <AMTd $bold>{order.numero}</AMTd>
                        <AMTd style={{ textAlign: 'center', color: order.dateFacturation ? 'inherit' : '#B5AFA7' }}>
                          {dateFactStr}
                        </AMTd>
                        <AMTd style={{ textAlign: 'center', color: order.numFacture ? 'inherit' : '#B5AFA7' }}>
                          {refStr}
                        </AMTd>
                        <AMTd>
                          <StatusDot $status={order.status}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </StatusDot>
                        </AMTd>
                      </AMTr>
                    )
                  })}
                </tbody>
              </AMTable>
            )}
          </AMBodyScroll>

          <AMFooter>
            <span>{bookOrders.length} commande{bookOrders.length > 1 ? 's' : ''} trouvée{bookOrders.length > 1 ? 's' : ''}</span>
            <span>Qté totale : <AMFooterTotal>{bookOrders.reduce((s, { item }) => s + item.quantity, 0)} ex.</AMFooterTotal></span>
          </AMFooter>

        </AMBox>
      </AMOverlay>,
      document.body
    )}
    </>
  )
}
