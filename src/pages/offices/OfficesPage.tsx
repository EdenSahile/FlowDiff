import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import type { Universe } from '@/data/mockBooks'
import { CURRENT_OFFICE } from '@/data/mockOffices'
import { theme } from '@/lib/theme'
import type { OfficeBook } from '@/data/mockOffices'
import { BookCover } from '@/components/catalogue/BookCover'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

// ── Types ──────────────────────────────────────────────────────────
type BookStatus = 'inclus' | 'retire'
type FilterUniverse = Universe | 'Tous'

// ── Constants ──────────────────────────────────────────────────────
const UNIVERSE_COLORS: Record<Universe, { bg: string; text: string; border: string }> = {
  'BD/Mangas':       { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  'Littérature':     { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  'Jeunesse':        { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'Adulte-pratique': { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
}

// ── Utils ──────────────────────────────────────────────────────────
function fmtDate(str: string): string {
  const [, m, d] = str.split('-')
  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${parseInt(d)} ${months[parseInt(m) - 1]} 2026`
}

function fmtDateRelative(str: string): string {
  const pub = new Date(str)
  const now = new Date()
  const days = Math.round((pub.getTime() - now.getTime()) / (1000 * 86400))
  if (days < 0) return `Il y a ${Math.abs(days)} j`
  if (days === 0) return "Aujourd'hui"
  return `Dans ${days} j`
}

function downloadCSV(
  books: OfficeBook[],
  statuses: Record<string, BookStatus>,
  qties: Record<string, number>,
  label: string,
) {
  const included = books.filter(b => (statuses[b.isbn] ?? 'inclus') === 'inclus')
  const sep = ';'
  const header = ['ISBN', 'Titre', 'Auteur(s)', 'Thématique', 'Parution', 'Prix TTC', 'Quantité']
  const rows = included.map(b => [
    b.isbn,
    `"${b.title}"`,
    `"${b.authors.join(', ')}"`,
    b.universe,
    fmtDate(b.publicationDate),
    `${b.priceTTC.toFixed(2)} EUR`,
    String(qties[b.isbn] ?? b.proposedQty),
  ])
  const csv = [header.join(sep), ...rows.map(r => r.join(sep))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `office-${label.replace(/\s+/g, '-').toLowerCase()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── SVG Icons ──────────────────────────────────────────────────────
function IconCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconPencil() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
function IconPackage() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconDownload() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function IconHistory() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-5.01" />
    </svg>
  )
}
function IconInfo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function IconBox() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}
function IconXCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

// ── Styled components ───────────────────────────────────────────────
const Page = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
  background: ${({ theme }) => theme.colors.gray[50]};
  padding: 28px 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px;
  }
`

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

/* ── Page header ── */
const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
`

const PeriodBadge = styled.span`
  background: ${({ theme }) => theme.colors.accentLight};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 4px;
  white-space: nowrap;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`

const HeaderBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, opacity 0.15s;
  white-space: nowrap;

  ${({ $primary, theme }) =>
    $primary
      ? `background: ${theme.colors.navy}; color: #fff; border: 1px solid ${theme.colors.navy}; &:hover { background: ${theme.colors.primaryHover}; border-color: ${theme.colors.primaryHover}; }`
      : `background: #fff; color: ${theme.colors.gray[800]}; border: 1px solid ${theme.colors.gray[200]}; &:hover { border-color: ${theme.colors.gray[400]}; }`}
`

/* ── Summary cards ── */
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const SummaryCard = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 4px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`

const SummaryIcon = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color}22;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const SummaryBody = styled.div`
  flex: 1;
  min-width: 0;
`

const SummaryLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-bottom: 3px;
  line-height: 1.3;
`

const SummaryValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
`

const AlertValue = styled.span`
  color: ${({ theme }) => theme.colors.error};
`

/* ── Info banner ── */
const InfoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 4px;
  color: #1D4ED8;
`

const InfoBannerText = styled.p`
  font-size: 13px;
  color: inherit;
  margin: 0;
  line-height: 1.5;
`

/* ── Filter tags ── */
const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const FilterSectionLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
`

const FilterTag = styled.button<{ $active: boolean; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid;
  white-space: nowrap;

  ${({ $active, $color, theme }) =>
    $active
      ? `background: ${$color}; color: #fff; border-color: ${$color};`
      : `background: #fff; color: ${$color}; border-color: ${theme.colors.gray[200]}; &:hover { border-color: ${$color}; background: ${$color}12; }`}
`

const TagDot = styled.span<{ $color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

/* ── Table ── */
const TableWrap = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 4px;
  overflow: hidden;
`

const TableHead = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 120px 150px 150px 130px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 0 16px;

  @media (max-width: 900px) {
    display: none;
  }
`

const TableHeadCell = styled.div`
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const UniverseGroup = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`

const UniverseGroupHeader = styled.div<{ $bg: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ $bg }) => $bg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
`

const UniverseGroupLabel = styled.span<{ $color: string }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $color }) => $color};
`

const UniverseGroupCount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const BookRow = styled.div<{ $retired: boolean }>`
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 120px 150px 150px 130px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  align-items: center;
  transition: background 0.15s;
  background: ${({ $retired, theme }) => $retired ? theme.colors.gray[50] : '#fff'};
  opacity: ${({ $retired }) => $retired ? 0.65 : 1};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

/* ── Title cell ── */
const TitleCell = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
`

const BookMeta = styled.div`
  flex: 1;
  min-width: 0;
`

const BookIsbnLine = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  letter-spacing: 0.02em;
  margin-bottom: 3px;
`

const UniverseBadge = styled.span<{ $bg: string; $text: string; $border: string }>`
  display: inline-block;
  background: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  border: 1px solid ${({ $border }) => $border};
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 3px;
`

const BookTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 2px;
`

const BookAuthor = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`

const BookPriceLine = styled.div`
  font-size: 11px;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 500;
`

/* ── Data cells ── */
const DataCell = styled.div`
  padding: 0 8px;

  @media (max-width: 900px) {
    padding: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

const MobileLabel = styled.span`
  display: none;

  @media (max-width: 900px) {
    display: inline-block;
    font-size: 11px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.gray[400]};
    min-width: 130px;
  }
`

const ParutionDate = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[800]};
  font-weight: 500;
`

const ParutionRelative = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-top: 1px;
`

const ProposedQtyVal = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: 500;
`

const ProposedQtySub = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin-top: 1px;
`

/* ── Qty stepper ── */
const QtyStepper = styled.div<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`

const QtyBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.gray[600]};
  transition: border-color 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.navy};
    color: ${({ theme }) => theme.colors.navy};
  }
  &:disabled {
    cursor: default;
    pointer-events: none;
  }

  @media (max-width: 900px) {
    width: 36px;
    height: 36px;
  }
`

const QtyValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  min-width: 28px;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`

/* ── Status badge with tooltip ── */
const TooltipWrap = styled.div`
  position: relative;
  display: inline-flex;

  .tt {
    position: absolute;
    bottom: calc(100% + 7px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(17, 17, 17, 0.88);
    color: #fff;
    font-size: 11px;
    line-height: 1.4;
    padding: 5px 10px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    z-index: 50;
    max-width: 220px;
    white-space: normal;
    width: max-content;
    text-align: center;
  }

  &:hover .tt {
    opacity: 1;
  }
`

const StatusBadge = styled.button<{ $inclus: boolean }>`
  padding: 5px 14px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid;

  ${({ $inclus }) =>
    $inclus
      ? `background: #DCFCE7; color: #166534; border-color: #86EFAC; &:hover { background: #BBF7D0; }`
      : `background: #FEE2E2; color: #991B1B; border-color: #FCA5A5; &:hover { background: #FECACA; }`}
`

/* ── Table footer ── */
const TableFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-top: 2px solid ${({ theme }) => theme.colors.gray[200]};
  flex-wrap: wrap;
`

const FooterStat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const FooterStatValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
`

const FooterStatIcon = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
`

/* ── Action buttons ── */
const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const CancelBtn = styled.button`
  padding: 10px 20px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: #fff;
  color: ${({ theme }) => theme.colors.gray[800]};
  font-size: 14px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.gray[400]}; }
`

const ValidateBtn = styled.button`
  padding: 10px 24px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  font-size: 14px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
`

/* ── Export modal ── */
const ExportOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`

const ExportPanel = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  max-width: 820px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
`

const ExportTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0 0 3px;
`

const ExportMeta = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0 0 20px;
`

const ExportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`

const ExportTh = styled.th`
  text-align: left;
  padding: 9px 12px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray[200]};
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-weight: 700;
  white-space: nowrap;
`

const ExportTd = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[800]};
  vertical-align: top;
`

const ExportActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
`

// ── Component ───────────────────────────────────────────────────────
export function OfficesPage() {
  const office = CURRENT_OFFICE

  const initialStatuses = useMemo(
    () => Object.fromEntries(office.books.map(b => [b.isbn, 'inclus' as BookStatus])),
    [office.books],
  )
  const initialQties = useMemo(
    () => Object.fromEntries(office.books.map(b => [b.isbn, b.proposedQty])),
    [office.books],
  )

  const [bookStatuses, setBookStatuses] = useState<Record<string, BookStatus>>(initialStatuses)
  const [bookQties, setBookQties] = useState<Record<string, number>>(initialQties)
  const [pendingRetireIsbn, setPendingRetireIsbn] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterUniverse>('Tous')
  const [showExport, setShowExport] = useState(false)

  /* Derived */
  const universes = useMemo(() => {
    const seen = new Set<Universe>()
    office.books.forEach(b => seen.add(b.universe))
    return Array.from(seen)
  }, [office.books])

  const filteredBooks = useMemo(
    () => (activeFilter === 'Tous' ? office.books : office.books.filter(b => b.universe === activeFilter)),
    [office.books, activeFilter],
  )

  const groupedBooks = useMemo(() => {
    if (activeFilter !== 'Tous') {
      return [{ universe: activeFilter as Universe, books: filteredBooks }]
    }
    const map = new Map<Universe, typeof filteredBooks>()
    filteredBooks.forEach(b => {
      if (!map.has(b.universe)) map.set(b.universe, [])
      map.get(b.universe)!.push(b)
    })
    return Array.from(map.entries()).map(([universe, books]) => ({ universe, books }))
  }, [filteredBooks, activeFilter])

  const totalIncluded = office.books.filter(b => (bookStatuses[b.isbn] ?? 'inclus') === 'inclus').length
  const totalRetire = office.books.filter(b => bookStatuses[b.isbn] === 'retire').length
  const totalExemplaires = office.books.reduce((sum, b) => {
    if (bookStatuses[b.isbn] === 'retire') return sum
    return sum + (bookQties[b.isbn] ?? b.proposedQty)
  }, 0)
  const retireExemplaires = office.books.reduce((sum, b) => {
    if (bookStatuses[b.isbn] !== 'retire') return sum
    return sum + (bookQties[b.isbn] ?? b.proposedQty)
  }, 0)

  const includedForExport = office.books.filter(b => (bookStatuses[b.isbn] ?? 'inclus') === 'inclus')
  const pendingBook = pendingRetireIsbn ? office.books.find(b => b.isbn === pendingRetireIsbn) : null

  /* Handlers */
  function handleStatusClick(isbn: string) {
    const current = bookStatuses[isbn] ?? 'inclus'
    if (current === 'inclus') {
      setPendingRetireIsbn(isbn)
    } else {
      setBookStatuses(prev => ({ ...prev, [isbn]: 'inclus' }))
    }
  }

  function confirmRetire() {
    if (!pendingRetireIsbn) return
    setBookStatuses(prev => ({ ...prev, [pendingRetireIsbn]: 'retire' }))
    setPendingRetireIsbn(null)
  }

  function handleQtyChange(isbn: string, delta: number) {
    setBookQties(prev => ({ ...prev, [isbn]: Math.max(0, (prev[isbn] ?? 0) + delta) }))
  }

  function handleCancel() {
    setBookStatuses(initialStatuses)
    setBookQties(initialQties)
  }

  return (
    <Page>
      <Content>

        {/* ── Header ── */}
        <PageHeader>
          <HeaderLeft>
            <PageTitle>Mon office — {office.label}</PageTitle>
            <PeriodBadge>Période concernée</PeriodBadge>
          </HeaderLeft>
          <HeaderRight>
            <HeaderBtn>
              <IconHistory />
              Historique des offices
            </HeaderBtn>
            <HeaderBtn $primary onClick={() => setShowExport(true)}>
              <IconDownload />
              Exporter office
            </HeaderBtn>
          </HeaderRight>
        </PageHeader>

        {/* ── Summary cards ── */}
        <SummaryGrid>
          <SummaryCard>
            <SummaryIcon $color="#EA580C"><IconCalendar /></SummaryIcon>
            <SummaryBody>
              <SummaryLabel>Bordereau envoyé le</SummaryLabel>
              <SummaryValue>{office.dateEnvoi}</SummaryValue>
            </SummaryBody>
          </SummaryCard>
          <SummaryCard>
            <SummaryIcon $color="#D97706"><IconPencil /></SummaryIcon>
            <SummaryBody>
              <SummaryLabel>Modifications possibles jusqu'au</SummaryLabel>
              <SummaryValue>
                <AlertValue>{office.dateLimiteMod}</AlertValue>
                {' '}
                <span style={{ fontSize: 11, fontWeight: 400, color: '#6B6B68' }}>
                  (J − {office.daysLeft} jours)
                </span>
              </SummaryValue>
            </SummaryBody>
          </SummaryCard>
          <SummaryCard>
            <SummaryIcon $color="#1D4ED8"><IconPackage /></SummaryIcon>
            <SummaryBody>
              <SummaryLabel>Parution des titres</SummaryLabel>
              <SummaryValue>du {office.parutionDebut} au {office.parutionFin}</SummaryValue>
            </SummaryBody>
          </SummaryCard>
          <SummaryCard>
            <SummaryIcon $color="#166534"><IconShield /></SummaryIcon>
            <SummaryBody>
              <SummaryLabel>Exemplaires prévus</SummaryLabel>
              <SummaryValue>{totalExemplaires} ex. — {totalIncluded} titres</SummaryValue>
            </SummaryBody>
          </SummaryCard>
        </SummaryGrid>

        {/* ── Info banner ── */}
        <InfoBanner>
          <IconInfo />
          <InfoBannerText>
            Vous pouvez ajuster les quantités proposées. Passé ce délai, l'envoi sera préparé automatiquement.
          </InfoBannerText>
        </InfoBanner>

        {/* ── Filter tags ── */}
        <FilterRow>
          <FilterSectionLabel>Thématiques :</FilterSectionLabel>
          <FilterTag
            $active={activeFilter === 'Tous'}
            $color={activeFilter === 'Tous' ? theme.colors.navy : theme.colors.gray[600]}
            onClick={() => setActiveFilter('Tous')}
          >
            Tous ({office.books.length})
          </FilterTag>
          {universes.map(u => {
            const c = UNIVERSE_COLORS[u]
            const count = office.books.filter(b => b.universe === u).length
            return (
              <FilterTag
                key={u}
                $active={activeFilter === u}
                $color={c.text}
                onClick={() => setActiveFilter(u)}
              >
                <TagDot $color={activeFilter === u ? 'rgba(255,255,255,0.75)' : c.text} />
                {u} ({count})
              </FilterTag>
            )
          })}
        </FilterRow>

        {/* ── Table ── */}
        <TableWrap>
          <TableHead>
            <TableHeadCell>Titre</TableHeadCell>
            <TableHeadCell>Parution</TableHeadCell>
            <TableHeadCell>Quantité proposée</TableHeadCell>
            <TableHeadCell>Votre quantité</TableHeadCell>
            <TableHeadCell>Statut</TableHeadCell>
          </TableHead>

          {groupedBooks.map(({ universe, books }) => {
            const c = UNIVERSE_COLORS[universe]
            return (
              <UniverseGroup key={universe}>
                {activeFilter === 'Tous' && (
                  <UniverseGroupHeader $bg={c.bg}>
                    <TagDot $color={c.text} />
                    <UniverseGroupLabel $color={c.text}>{universe}</UniverseGroupLabel>
                    <UniverseGroupCount>
                      {books.length} titre{books.length > 1 ? 's' : ''}
                    </UniverseGroupCount>
                  </UniverseGroupHeader>
                )}

                {books.map(book => {
                  const status = bookStatuses[book.isbn] ?? 'inclus'
                  const qty = bookQties[book.isbn] ?? book.proposedQty
                  const isInclus = status === 'inclus'
                  const bc = UNIVERSE_COLORS[book.universe]

                  return (
                    <BookRow key={book.isbn} $retired={!isInclus}>
                      {/* Titre */}
                      <TitleCell>
                        <div style={{ flexShrink: 0 }}>
                          <BookCover
                            isbn={book.isbn}
                            alt={book.title}
                            width={42}
                            height={58}
                            universe={book.universe}
                            authors={book.authors}
                            publisher={book.publisher}
                          />
                        </div>
                        <BookMeta>
                          <BookIsbnLine>{book.isbn}</BookIsbnLine>
                          <UniverseBadge $bg={bc.bg} $text={bc.text} $border={bc.border}>
                            {book.universe}
                          </UniverseBadge>
                          <BookTitle>{book.title}</BookTitle>
                          <BookAuthor>{book.authors.join(', ')} · {book.publisher}</BookAuthor>
                          <BookPriceLine>{book.priceTTC.toFixed(2)} € TTC</BookPriceLine>
                        </BookMeta>
                      </TitleCell>

                      {/* Parution */}
                      <DataCell>
                        <MobileLabel>Parution :</MobileLabel>
                        <div>
                          <ParutionDate>{fmtDate(book.publicationDate)}</ParutionDate>
                          <ParutionRelative>{fmtDateRelative(book.publicationDate)}</ParutionRelative>
                        </div>
                      </DataCell>

                      {/* Qté proposée */}
                      <DataCell>
                        <MobileLabel>Qté proposée :</MobileLabel>
                        <div>
                          <ProposedQtyVal>{book.proposedQty} ex.</ProposedQtyVal>
                          <ProposedQtySub>selon votre profil</ProposedQtySub>
                        </div>
                      </DataCell>

                      {/* Votre quantité */}
                      <DataCell>
                        <MobileLabel>Votre quantité :</MobileLabel>
                        <QtyStepper $disabled={!isInclus}>
                          <QtyBtn
                            onClick={() => handleQtyChange(book.isbn, -1)}
                            disabled={qty <= 0 || !isInclus}
                            aria-label="Diminuer la quantité"
                          >
                            −
                          </QtyBtn>
                          <QtyValue>{qty}</QtyValue>
                          <QtyBtn
                            onClick={() => handleQtyChange(book.isbn, 1)}
                            disabled={!isInclus}
                            aria-label="Augmenter la quantité"
                          >
                            +
                          </QtyBtn>
                        </QtyStepper>
                      </DataCell>

                      {/* Statut */}
                      <DataCell>
                        <MobileLabel>Statut :</MobileLabel>
                        <TooltipWrap>
                          <StatusBadge
                            $inclus={isInclus}
                            onClick={() => handleStatusClick(book.isbn)}
                            aria-label={
                              isInclus
                                ? "Retirer le titre de l'office"
                                : "Maintenir le titre dans l'office"
                            }
                          >
                            {isInclus ? 'Inclus' : 'Retiré'}
                          </StatusBadge>
                          <span className="tt">
                            {isInclus
                              ? "Cliquer pour retirer le titre de l'office"
                              : "Cliquer pour maintenir le titre dans l'office"}
                          </span>
                        </TooltipWrap>
                      </DataCell>
                    </BookRow>
                  )
                })}
              </UniverseGroup>
            )
          })}

          {/* Footer */}
          <TableFooter>
            <FooterStat>
              <FooterStatIcon $color="#166534"><IconBook /></FooterStatIcon>
              Titres inclus :&nbsp;<FooterStatValue>{totalIncluded}</FooterStatValue>
            </FooterStat>
            <FooterStat>
              <FooterStatIcon $color="#1D4ED8"><IconBox /></FooterStatIcon>
              Exemplaires :&nbsp;<FooterStatValue>{totalExemplaires} ex.</FooterStatValue>
            </FooterStat>
            <FooterStat>
              <FooterStatIcon $color="#991B1B"><IconXCircle /></FooterStatIcon>
              Retirés :&nbsp;
              <FooterStatValue>
                {totalRetire} titre{totalRetire > 1 ? 's' : ''} ({retireExemplaires} ex.)
              </FooterStatValue>
            </FooterStat>
          </TableFooter>
        </TableWrap>

        {/* ── Action buttons ── */}
        <ActionsRow>
          <CancelBtn onClick={handleCancel}>Annuler mes modifications</CancelBtn>
          <ValidateBtn onClick={() => alert('Office validé !')}>Valider mon office</ValidateBtn>
        </ActionsRow>

      </Content>

      {/* ── Confirm retire dialog ── */}
      <ConfirmDialog
        open={!!pendingRetireIsbn}
        title="Retirer ce titre ?"
        message={
          pendingBook
            ? `Voulez-vous retirer « ${pendingBook.title} » de votre office ? Vous pourrez le réintégrer à tout moment avant la date limite.`
            : ''
        }
        confirmLabel="Oui, retirer"
        cancelLabel="Annuler"
        destructive={false}
        onConfirm={confirmRetire}
        onCancel={() => setPendingRetireIsbn(null)}
      />

      {/* ── Export modal ── */}
      {showExport &&
        createPortal(
          <ExportOverlay onClick={() => setShowExport(false)}>
            <ExportPanel onClick={e => e.stopPropagation()}>
              <ExportTitle>Export — {office.label}</ExportTitle>
              <ExportMeta>
                {includedForExport.length} titre{includedForExport.length > 1 ? 's' : ''} inclus ·{' '}
                {totalExemplaires} exemplaires
              </ExportMeta>

              <ExportTable>
                <thead>
                  <tr>
                    <ExportTh>ISBN</ExportTh>
                    <ExportTh>Titre</ExportTh>
                    <ExportTh>Auteur(s)</ExportTh>
                    <ExportTh>Thématique</ExportTh>
                    <ExportTh>Parution</ExportTh>
                    <ExportTh style={{ textAlign: 'right' }}>Prix TTC</ExportTh>
                    <ExportTh style={{ textAlign: 'center' }}>Qté</ExportTh>
                  </tr>
                </thead>
                <tbody>
                  {includedForExport.map(b => (
                    <tr key={b.isbn}>
                      <ExportTd style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#6B6B68' }}>
                        {b.isbn}
                      </ExportTd>
                      <ExportTd style={{ fontWeight: 500, maxWidth: 220 }}>{b.title}</ExportTd>
                      <ExportTd style={{ color: theme.colors.gray[600] }}>{b.authors.join(', ')}</ExportTd>
                      <ExportTd>{b.universe}</ExportTd>
                      <ExportTd>{fmtDate(b.publicationDate)}</ExportTd>
                      <ExportTd style={{ fontFamily: "'DM Mono', monospace", textAlign: 'right' }}>
                        {b.priceTTC.toFixed(2)} €
                      </ExportTd>
                      <ExportTd style={{ textAlign: 'center', fontWeight: 700 }}>
                        {bookQties[b.isbn] ?? b.proposedQty}
                      </ExportTd>
                    </tr>
                  ))}
                </tbody>
              </ExportTable>

              <ExportActions>
                <HeaderBtn onClick={() => setShowExport(false)}>Fermer</HeaderBtn>
                <HeaderBtn
                  $primary
                  onClick={() => {
                    downloadCSV(office.books, bookStatuses, bookQties, office.label)
                    setShowExport(false)
                  }}
                >
                  <IconDownload />
                  Télécharger CSV
                </HeaderBtn>
              </ExportActions>
            </ExportPanel>
          </ExportOverlay>,
          document.body,
        )}
    </Page>
  )
}
