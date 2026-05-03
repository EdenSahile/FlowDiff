import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/contexts/CartContext'
import { useOrders } from '@/contexts/OrdersContext'
import { MOCK_BOOKS } from '@/data/mockBooks'
import { BookCover } from '@/components/catalogue/BookCover'
import { usePeriodFilter, type CompareMode } from '@/hooks/usePeriodFilter'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { theme } from '@/lib/theme'
import { ComparaisonToggle } from '@/components/dashboard/ComparaisonToggle'
import { useDashboardConfig, type DashboardZone } from '@/hooks/useDashboardConfig'
import { CustomizerDrawer } from '@/components/dashboard/CustomizerDrawer'
import { computeKPIs, computeChartData, computeDonutData, computeTopPublishers, orderToDashboardOrders, fmtEur, type ChartPoint, type DonutSegment } from '@/data/mockDashboard'
import { exportDashboardCSV } from '@/lib/exportCSV'

const nouveautes = MOCK_BOOKS
  .filter(b => b.type === 'nouveaute')
  .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
  .slice(0, 4)


/* ── SVG Icons ── */
function IconPackage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}

function IconBooks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  )
}

function IconChevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

function IconOrders() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function IconReceipt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  )
}

function IconAlertClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function IconEuro() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M4 14h12" />
      <path d="M19.5 7A7.5 7.5 0 1 0 19.5 17" />
    </svg>
  )
}

function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}

function IconLayout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconGrip() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="3" r="1.2" />
      <circle cx="10" cy="3" r="1.2" />
      <circle cx="4" cy="7" r="1.2" />
      <circle cx="10" cy="7" r="1.2" />
      <circle cx="4" cy="11" r="1.2" />
      <circle cx="10" cy="11" r="1.2" />
    </svg>
  )
}


/* ── Page layout ── */
const Page = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
  background-color: ${({ theme }) => theme.colors.gray[50]};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 48px;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 24px 28px 48px;
  }
`

const Content = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

/* ── Greeting row ── */
const GreetingRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`

const GreetingTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
`

const GreetingSub = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 2px 0 0;
`

const DateBlock = styled.div`
  text-align: right;
`

const DateText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const DateLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-transform: uppercase;
  letter-spacing: .5px;
  line-height: 1.2;
`

const DateValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
`

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ color: theme.colors.gray[400], flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

/* ── Drag handles ── */
const CardDragHandle = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 5px;
  cursor: grab;
  color: ${({ theme }) => theme.colors.gray[400]};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;

  &:active { cursor: grabbing; }
  &:hover {
    background: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`

/* ── Actions en attente ── */
const ActionsBox = styled.section`
  background: #FDECEA;
  border: 1px solid #FECACA;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px 18px;
`

const ActionsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
`

const ActionsLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const ActionsTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const ActionsTitle = styled.h2`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
`

const ActionsBadge = styled.span`
  background: #EF4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 99px;
  line-height: 1.6;
`

const ActionsSubtitle = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  margin: 0;
`

const SeeAllBtn = styled.button`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.gray[400]}; }
`

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const ActionCard = styled.button<{ $empty?: boolean; $dragging?: boolean; $dropTarget?: boolean }>`
  background: white;
  border: 1px solid ${({ $empty, $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : $empty ? '#E5E7EB' : '#FEE2E2'};
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: ${({ $empty }) => $empty ? 'default' : 'pointer'};
  text-align: left;
  width: 100%;
  opacity: ${({ $empty, $dragging }) => $dragging ? 0.4 : $empty ? 0.55 : 1};
  pointer-events: ${({ $empty }) => $empty ? 'none' : 'auto'};
  transition: opacity 0.1s, border-color 0.1s;
  &:hover { border-color: ${({ $empty, $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : $empty ? '#E5E7EB' : '#FECACA'}; }
`

const ActionCardWrap = styled.div`
  position: relative;
  &:hover ${CardDragHandle} { opacity: 1; }
`

const ActionIconWrap = styled.div<{ $bg: string; $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
`

const ActionBody = styled.div`
  flex: 1;
`

const ActionCount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.1;
  margin-bottom: 2px;
`

const ActionLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  line-height: 1.3;
`

const ActionDeadline = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 600;
  margin-top: 2px;
  line-height: 1.2;
`

const ActionArrow = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray[400]};
  flex-shrink: 0;
`

/* ── Bilan du mois précédent ── */
const BilanSection = styled.section``

const BilanHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
  flex-wrap: wrap;
`

const BilanTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
  white-space: nowrap;
`

const DashboardControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
  }
`

const CustomizeBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${({ $primary, theme }) => $primary ? theme.colors.navy : 'white'};
  border: 1px solid ${({ $primary, theme }) => $primary ? theme.colors.navy : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 6px 12px;
  font-size: 12px;
  font-weight: ${({ $primary }) => $primary ? 600 : 500};
  color: ${({ $primary, theme }) => $primary ? '#fff' : theme.colors.gray[600]};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    background: ${({ $primary, theme }) => $primary ? theme.colors.primaryHover : 'white'};
    border-color: ${({ $primary, theme }) => $primary ? theme.colors.primaryHover : theme.colors.navy};
    color: ${({ $primary, theme }) => $primary ? '#fff' : theme.colors.navy};
  }
`

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const KPICard = styled.div<{ $dragging?: boolean; $dropTarget?: boolean }>`
  background: white;
  border: 1px solid ${({ $dropTarget, theme }) =>
    $dropTarget ? theme.colors.navy : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  opacity: ${({ $dragging }) => $dragging ? 0.4 : 1};
  transition: opacity 0.1s, border-color 0.1s, box-shadow 0.15s;

  &:hover {
    box-shadow: 0 1px 4px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05);
  }
  &:hover ${CardDragHandle} { opacity: 1; }
`

const KPITop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const KPIIconWrap = styled.div<{ $bg: string; $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
`

const KPILabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.3;
`

const KPIValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  line-height: 1.1;
`

const KPITrend = styled.div<{ $up: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: ${({ $up }) => $up ? '#16a34a' : '#DC2626'};
`

const KPILink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  text-align: left;
  margin-top: 2px;
  &:hover { text-decoration: underline; }
`

/* ── Ligne 3 colonnes (étapes 4-5-6 et 7-8-9) ── */
const ThreeColRow = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: ${({ $count }) =>
    $count === 3 ? '45fr 30fr 25fr' :
    $count === 2 ? '1fr 1fr' :
    '1fr'
  };
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

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

const PanelEyebrow = styled.p`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 2px;
`

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

const FAB = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(45,58,74,0.35), 0 2px 8px rgba(0,0,0,0.12);
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  z-index: 1000;

  &:hover {
    transform: scale(1.08);
    background: ${({ theme }) => theme.colors.primaryHover};
    box-shadow: 0 6px 24px rgba(45,58,74,0.45), 0 3px 12px rgba(0,0,0,0.15);
  }
`

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`

const PanelTitle = styled.h3`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`

const PanelSeeAll = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  white-space: nowrap;
  &:hover { opacity: .75; }
`

/* ── Évolution des commandes (dynamique) ── */
const CW = 210, CH = 85, COX = 25, COY = 90

function toPolyline(pts: ChartPoint[], yMax: number): string {
  if (pts.length < 2) return ''
  return pts.map((p, i) => {
    const x = COX + (i / (pts.length - 1)) * CW
    const y = COY - (p.count / yMax) * CH
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function xLabel(iso: string): string {
  if (!iso) return ''
  return `${iso.slice(8)}/${iso.slice(5, 7)}`
}

function ChartEvolution({
  main,
  compare,
}: {
  main: ChartPoint[]
  compare: ChartPoint[] | null
}) {
  const mainMax    = Math.max(...main.map(p => p.count), 1)
  const compareMax = compare ? Math.max(...compare.map(p => p.count), 1) : 0
  const yMaxRaw    = Math.max(mainMax, compareMax, 5)
  const yMax       = Math.ceil(yMaxRaw / 5) * 5
  const yTicks     = Array.from({ length: 6 }, (_, i) => Math.round((i / 5) * yMax))

  const xIdxs = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(t * Math.max(main.length - 1, 0)))

  const mainPoly    = toPolyline(main, yMax)
  const comparePoly = compare ? toPolyline(compare, yMax) : null

  return (
    <svg viewBox="0 0 260 105" width="100%" aria-label="Évolution des commandes">
      {yTicks.map(v => {
        const y = COY - (v / yMax) * CH
        return (
          <g key={v}>
            <line x1={COX} y1={y} x2={COX + CW} y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
            <text x={COX - 4} y={y + 3.5} textAnchor="end" fontSize="7" fill="#9CA3AF">{v}</text>
          </g>
        )
      })}
      {comparePoly && (
        <polyline points={comparePoly} fill="none" stroke={theme.colors.accent} strokeWidth="1.2"
          strokeDasharray="4 2" strokeLinejoin="round" strokeLinecap="round" opacity="0.75" />
      )}
      {mainPoly && (
        <polyline points={mainPoly} fill="none" stroke="#16a34a" strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round" />
      )}
      <line x1={COX} y1={COY} x2={COX + CW} y2={COY} stroke="#D1D5DB" strokeWidth="0.8" />
      {xIdxs.map((idx, k) => {
        const x = COX + (idx / Math.max(main.length - 1, 1)) * CW
        return (
          <text key={k} x={x} y={COY + 10} textAnchor="middle" fontSize="7" fill="#9CA3AF">
            {xLabel(main[idx]?.date ?? '')}
          </text>
        )
      })}
      <text x={COX} y="6" fontSize="7" fill="#9CA3AF">Commandes / jour</text>
    </svg>
  )
}

const ChartInner = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`

const ChartSvgWrap = styled.div`
  flex: 1;
  min-width: 0;
`

const ChartLegend = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
`

const ChartLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const ChartLegendLine = styled.span<{ $color: string; $dashed?: boolean }>`
  display: inline-block;
  width: 14px;
  height: 0;
  border-top: 2px ${({ $dashed }) => ($dashed ? 'dashed' : 'solid')} ${({ $color }) => $color};
`

const ChartStatsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 120px;
`

const ChartStatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ChartStatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const ChartStatValueRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const ChartStatIcon = styled.div<{ $bg: string; $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 13px;
  line-height: 1;
`

const ChartStatNum = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
`

const ChartStatDelta = styled.span<{ $up: boolean }>`
  font-size: 11px;
  color: ${({ $up }) => $up ? '#16a34a' : '#DC2626'};
`

function IconSend() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function IconXCircle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

/* ── Donut chart (dynamique) ── */
function buildDonutArcs(segments: DonutSegment[], r: number) {
  const circ = 2 * Math.PI * r
  let cumulative = 0
  return segments.map(({ percent, color }) => {
    const dash   = (percent / 100) * circ
    const offset = circ * 0.25 - cumulative
    cumulative  += dash
    return { dash, offset, circ, color }
  })
}

function ChartDonut({
  main,
  compare,
}: {
  main: DonutSegment[]
  compare: DonutSegment[] | null
}) {
  const outerR = compare ? 36 : 35
  const outerW = compare ? 10 : 14
  const innerR = 22
  const innerW = 10

  const mainArcs    = buildDonutArcs(main, outerR)
  const compareArcs = compare ? buildDonutArcs(compare, innerR) : null

  return (
    <svg viewBox="0 0 100 100" width="110" height="110" aria-label="Répartition des achats">
      {/* Fond anneau principal */}
      <circle cx="50" cy="50" r={outerR} fill="none" stroke="#F3F4F6" strokeWidth={outerW} />
      {/* Segments principaux */}
      {mainArcs.map(({ dash, offset, circ, color }, i) => (
        <circle key={i} cx="50" cy="50" r={outerR} fill="none"
          stroke={color} strokeWidth={outerW}
          strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
          strokeDashoffset={offset.toFixed(2)}
        />
      ))}
      {/* Fond + segments anneau de comparaison */}
      {compareArcs && (
        <>
          <circle cx="50" cy="50" r={innerR} fill="none" stroke="#F3F4F6" strokeWidth={innerW} />
          {compareArcs.map(({ dash, offset, circ, color }, i) => (
            <circle key={i} cx="50" cy="50" r={innerR} fill="none"
              stroke={color} strokeWidth={innerW} opacity="0.5"
              strokeDasharray={`${dash.toFixed(2)} ${circ.toFixed(2)}`}
              strokeDashoffset={offset.toFixed(2)}
            />
          ))}
        </>
      )}
    </svg>
  )
}

const DonutInner = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

const DonutLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`

const LegendDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const LegendLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  flex: 1;
`

const LegendPct = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
`

const LegendPctCompare = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
`

/* ── Top éditeurs ── */

const TopEdList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const TopEdRow = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr 34px 56px;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child { border-bottom: none; }
`

const TopEdRank = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const TopEdName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[800]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TopEdPct = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
  text-align: right;
`

const TopEdAmount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[800]};
  text-align: right;
`

const TopEdFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
`

const TopEdFooterLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

/* ── Nouveautés du mois (panel) ── */
const UNIVERSE_BADGE_COLOR: Record<string, { bg: string; text: string }> = {
  'BD/Mangas':       { bg: '#EA580C', text: '#fff' },
  'Littérature':     { bg: '#166534', text: '#fff' },
  'Adulte-pratique': { bg: '#7C3AED', text: '#fff' },
  'Jeunesse':        { bg: '#0369A1', text: '#fff' },
}

const NovelScroll = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  position: relative;
`

const MiniCard = styled.div`
  flex-shrink: 0;
  width: 110px;
  cursor: pointer;
`

const MiniCoverWrap = styled.div`
  position: relative;
  margin-bottom: 6px;
`

const UniverseBadge = styled.span<{ $bg: string; $text: string }>`
  display: inline-block;
  background: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1.4;
  margin-bottom: 4px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MiniTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 2px;
`

const MiniAuthor = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.gray[400]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const NovelPanelWrap = styled.div`
  position: relative;
`

const NovelArrow = styled.button<{ $side: 'left' | 'right'; $visible: boolean }>`
  position: absolute;
  top: 50px;
  ${({ $side }) => $side === 'right' ? 'right: -10px;' : 'left: -10px;'}
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.navy};
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};
`

/* ── Suivi des flux EDI ── */
const EdiStatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
`

const EdiStatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const EdiStatIcon = styled.div<{ $bg: string; $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
`

const EdiStatNum = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.1;
`

const EdiStatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.3;
`

const EdiMetricsRow = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  margin-bottom: 12px;
  flex-wrap: wrap;
`

const EdiMetricLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

const EdiMetricValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin-left: 4px;
`

const EdiLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.success};
  cursor: pointer;
  &:hover { text-decoration: underline; }
`

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

  &:hover { background: ${({ theme }) => theme.colors.primaryHover ?? theme.colors.navy}; }
`

/* ── Shortcuts panel (step 9) ── */
const ShortcutList = styled.div`
  display: flex;
  flex-direction: column;
`

const ShortcutRow = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
  text-decoration: none;
  color: inherit;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.colors.gray[50]}; }
`

const ShortcutIconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
`

const ShortcutRowLabel = styled.span`
  flex: 1;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.gray[800]};
`

const ShortcutChevron = styled.span`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.gray[400]};
  line-height: 1;
`

/* ── Section reorder controls ── */
const SectionWrap = styled.div`
  position: relative;
`

const SectionControls = styled.div`
  position: absolute;
  top: -28px;
  right: 0;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity .2s;

  ${SectionWrap}:hover & {
    opacity: 1;
  }
`

const SectionArrowBtn = styled.button<{ $disabled?: boolean }>`
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => $disabled ? 'default' : 'pointer'};
  color: ${({ $disabled, theme }) => $disabled ? theme.colors.gray[200] : theme.colors.gray[600]};
  padding: 0;
  flex-shrink: 0;
  &:hover:not([disabled]) {
    border-color: ${({ theme }) => theme.colors.gray[400]};
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`

/* ── Ghost cards (emplacements libres) ── */
const GhostRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`

const GhostCard = styled.div`
  flex: 1;
  background: rgba(255,255,255,.5);
  border: 1.5px dashed ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 14px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  opacity: .5;
  transition: opacity .2s, border-color .2s, background .2s;
  min-height: 68px;
  &:hover {
    opacity: .8;
    border-color: ${({ theme }) => theme.colors.accent};
    background: rgba(212,168,67,.05);
  }
`

const GhostCardIcon = styled.div`
  width: 32px; height: 32px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[200]};
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 300; flex-shrink: 0;
  transition: background .2s, color .2s;
  ${GhostCard}:hover & {
    background: rgba(212,168,67,.15);
    color: ${({ theme }) => theme.colors.accent};
  }
`

const GhostCardLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const GhostKpiCard = styled.div`
  flex: 1;
  background: rgba(255,255,255,.5);
  border: 1.5px dashed ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  opacity: .45;
  transition: opacity .2s, border-color .2s, background .2s;
  min-height: 100px;
  &:hover {
    opacity: .75;
    border-color: ${({ theme }) => theme.colors.accent};
    background: rgba(212,168,67,.04);
  }
`

const GhostKpiIcon = styled.div`
  width: 32px; height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[200]};
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 300;
  transition: background .2s, color .2s;
  ${GhostKpiCard}:hover & {
    background: rgba(212,168,67,.15);
    color: ${({ theme }) => theme.colors.accent};
  }
`

const GhostKpiLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const GhostPanel = styled.div`
  background: rgba(255,255,255,.45);
  border: 1.5px dashed ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  opacity: .45;
  min-height: 120px;
  transition: opacity .2s, border-color .2s, background .2s;
  &:hover {
    opacity: .75;
    border-color: ${({ theme }) => theme.colors.accent};
    background: rgba(212,168,67,.04);
  }
`

const GhostPanelIcon = styled.div`
  width: 36px; height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[200]};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 300;
  transition: background .2s, color .2s;
  ${GhostPanel}:hover & {
    background: rgba(212,168,67,.15);
    color: ${({ theme }) => theme.colors.accent};
  }
`

const GhostPanelLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[400]};
`

const MiniPrice = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  margin-top: 3px;
`

/* ── KPI trend helper ── */
function compareModeShort(mode: CompareMode): string {
  if (mode === 'previous') return 'période préc.'
  if (mode === 'year-ago') return 'N-1'
  return 'période perso.'
}

function KpiTrendLine({
  current,
  compare,
  mode,
  invert = false,
}: {
  current: number
  compare: number
  mode: CompareMode
  invert?: boolean
}) {
  if (compare === 0 || mode === 'none') return null
  const raw       = ((current - compare) / compare) * 100
  const increased = raw >= 0
  const up        = invert ? !increased : increased
  const pct       = Math.round(Math.abs(raw))
  return (
    <KPITrend $up={up}>
      {increased ? `▲ +${pct}%` : `▼ -${pct}%`} vs {compareModeShort(mode)}
    </KPITrend>
  )
}

type ActionCardDef = {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  count: React.ReactNode
  label: string
  deadline?: string
  route?: string
  empty?: boolean
}

type KpiCardDef = {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: React.ReactNode
  trend?: React.ReactNode
  link?: React.ReactNode
}

/* ── Component ── */
export function HomePage() {
  const { user } = useAuth()
  const { totalItems: cartCount } = useCart()
  const { userOrders } = useOrders()
  const navigate = useNavigate()
  const novelRef = useRef<HTMLDivElement>(null)
  const [canNovRight, setCanNovRight] = useState(true)

  const [customizerOpen, setCustomizerOpen] = useState(false)
  const dashConfig = useDashboardConfig()
  const cardDragRef = useRef<{ zone: DashboardZone; id: string } | null>(null)
  const [cardDrag, setCardDrag] = useState<{ zone: DashboardZone; id: string } | null>(null)
  const [cardDrop, setCardDrop] = useState<{ zone: DashboardZone; id: string } | null>(null)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const dateLabel = 'Aujourd\'hui'
  const dateValue = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const extraDashboardOrders = useMemo(
    () => userOrders.flatMap(orderToDashboardOrders),
    [userOrders],
  )
  const periodFilter = usePeriodFilter(extraDashboardOrders)

  const kpi        = useMemo(() => computeKPIs(periodFilter.orders),        [periodFilter.orders])
  const compareKpi = useMemo(
    () => periodFilter.compareOrders.length > 0 ? computeKPIs(periodFilter.compareOrders) : null,
    [periodFilter.compareOrders],
  )

  const mainChartData = useMemo(
    () => computeChartData(periodFilter.orders, periodFilter.period.start, periodFilter.period.end),
    [periodFilter.orders, periodFilter.period.start, periodFilter.period.end],
  )
  const compareChartData = useMemo(
    () => periodFilter.comparePeriod
      ? computeChartData(periodFilter.compareOrders, periodFilter.comparePeriod.start, periodFilter.comparePeriod.end)
      : null,
    [periodFilter.compareOrders, periodFilter.comparePeriod],
  )

  const donutData = useMemo(
    () => computeDonutData(periodFilter.orders),
    [periodFilter.orders],
  )
  const compareDonutData = useMemo(
    () => periodFilter.compareOrders.length > 0 ? computeDonutData(periodFilter.compareOrders) : null,
    [periodFilter.compareOrders],
  )

  const topPublishers = useMemo(
    () => computeTopPublishers(periodFilter.orders),
    [periodFilter.orders],
  )

  const nbEnvoyees  = kpi.nbActive
  const nbAnnulees  = kpi.nbCancelled
  const cmpEnvoyees = compareKpi ? compareKpi.nbActive    : null
  const cmpAnnulees = compareKpi ? compareKpi.nbCancelled : null

  /* Raccourci / → focus champ de recherche du header */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== '/') return
      const active = document.activeElement
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
      e.preventDefault()
      const headerInput = document.getElementById('header-search-input') as HTMLInputElement | null
      headerInput?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  function updateNovArrows() {
    const el = novelRef.current
    if (!el) return
    setCanNovRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = novelRef.current
    if (!el) return
    updateNovArrows()
    el.addEventListener('scroll', updateNovArrows)
    return () => el.removeEventListener('scroll', updateNovArrows)
  }, [])

  function handleDragStart(zone: DashboardZone, id: string) {
    cardDragRef.current = { zone, id }
    setCardDrag({ zone, id })
  }

  function handleDragOver(e: React.DragEvent, zone: DashboardZone, id: string) {
    e.preventDefault()
    if (cardDragRef.current?.zone === zone) setCardDrop({ zone, id })
  }

  function handleDrop(zone: DashboardZone, toId: string) {
    const drag = cardDragRef.current
    if (!drag || drag.zone !== zone) return
    if (drag.id !== toId) {
      const items = dashConfig.config[zone]
      const fromIdx = items.findIndex(i => i.id === drag.id)
      const toIdx   = items.findIndex(i => i.id === toId)
      if (fromIdx !== -1 && toIdx !== -1) dashConfig.reorder(zone, fromIdx, toIdx)
    }
    cardDragRef.current = null
    setCardDrag(null)
    setCardDrop(null)
  }

  function handleDragEnd() {
    cardDragRef.current = null
    setCardDrag(null)
    setCardDrop(null)
  }

  function scrollNovBy(delta: number) {
    novelRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(updateNovArrows, 50)
  }

  const actionCardDefs: Record<string, ActionCardDef> = {
    'action-offices': {
      icon: '📦',
      iconBg: '#E6F2EC', iconColor: '#226241',
      count: 1, label: 'office à valider',
      deadline: 'Limite : 13 mai',
      route: '/offices',
    },
    'action-panier': {
      icon: '🛒',
      iconBg: cartCount === 0 ? '#F3F4F6' : '#FFF7ED',
      iconColor: cartCount === 0 ? '#9CA3AF' : '#EA580C',
      count: cartCount,
      label: cartCount === 0 ? 'Panier vide' : cartCount <= 1 ? 'Ouvrage dans le panier' : 'Ouvrages dans le panier',
      route: '/panier',
      empty: cartCount === 0,
    },
    'action-commandes': {
      icon: '📋',
      iconBg: '#FFFBEB', iconColor: '#D97706',
      count: 2, label: 'commandes à vérifier',
      route: '/edi?filter=ORDRSP',
    },
    'action-edi-error': {
      icon: '⚠️',
      iconBg: '#FDECEA', iconColor: '#C0392B',
      count: 1, label: 'erreur EDI à corriger',
      route: '/edi',
    },
    'action-expeditions': {
      icon: '🚚',
      iconBg: '#EFF6FF', iconColor: '#2563EB',
      count: 3, label: 'expéditions en retard',
      route: '/edi?filter=DESADV',
    },
  }

  const totalActionCount = dashConfig.config.actionCards
    .filter(c => c.visible)
    .reduce((sum, c) => {
      const def = actionCardDefs[c.id]
      if (!def || def.empty) return sum
      return sum + (typeof def.count === 'number' ? def.count : 0)
    }, 0)

  const kpiCardDefs: Record<string, KpiCardDef> = {
    'kpi-commandes': {
      icon: '🛒',
      iconBg: '#E6F2EC', iconColor: '#226241',
      label: 'Commandes passées',
      value: kpi.nbCommandes,
      trend: compareKpi
        ? <KpiTrendLine current={kpi.nbCommandes} compare={compareKpi.nbCommandes} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-montant': {
      icon: '€',
      iconBg: '#E6F2EC', iconColor: '#226241',
      label: 'Montant total commandé (TTC)',
      value: fmtEur(kpi.montantTotal),
      trend: compareKpi
        ? <KpiTrendLine current={kpi.montantTotal} compare={compareKpi.montantTotal} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-exemplaires': {
      icon: '📦',
      iconBg: '#E6F2EC', iconColor: '#226241',
      label: 'Exemplaires commandés',
      value: kpi.nbExemplaires.toLocaleString('fr-FR'),
      trend: compareKpi
        ? <KpiTrendLine current={kpi.nbExemplaires} compare={compareKpi.nbExemplaires} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-panier-moyen': {
      icon: '📊',
      iconBg: '#EDE9FE', iconColor: '#7C3AED',
      label: 'Panier moyen (hors annulées)',
      value: fmtEur(kpi.panierMoyen),
      trend: compareKpi
        ? <KpiTrendLine current={kpi.panierMoyen} compare={compareKpi.panierMoyen} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-delai': {
      icon: '⏱',
      iconBg: '#FFF7ED', iconColor: '#EA580C',
      label: 'Délai moyen de livraison',
      value: `${kpi.delaiMoyen.toFixed(1).replace('.', ',')} j`,
      trend: compareKpi
        ? <KpiTrendLine current={kpi.delaiMoyen} compare={compareKpi.delaiMoyen} mode={periodFilter.compareMode} invert />
        : undefined,
    },
    'kpi-rupture': {
      icon: '✕',
      iconBg: '#FDECEA', iconColor: '#C0392B',
      label: 'Taux de rupture',
      value: `${(kpi.tauxRupture * 100).toFixed(1).replace('.', ',')} %`,
      trend: compareKpi
        ? <KpiTrendLine current={kpi.tauxRupture} compare={compareKpi.tauxRupture} mode={periodFilter.compareMode} invert />
        : undefined,
    },
    'kpi-references': {
      icon: '📚',
      iconBg: '#EFF6FF', iconColor: '#2563EB',
      label: 'Références distinctes',
      value: kpi.nbReferences.toLocaleString('fr-FR'),
      trend: compareKpi
        ? <KpiTrendLine current={kpi.nbReferences} compare={compareKpi.nbReferences} mode={periodFilter.compareMode} />
        : undefined,
    },
  }

  return (
    <Page>
      <Content>

        {/* 1 — Greeting row */}
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
          <DateBlock>
            <DateText>
              <DateLabel>{dateLabel}</DateLabel>
              <DateValue>{dateValue}</DateValue>
            </DateText>
          </DateBlock>
        </GreetingRow>

        {/* 2-5 — Sections réordonnables */}
        {dashConfig.config.sectionOrder.map((sectionId, sectionIdx) => {
          const isFirst = sectionIdx === 0
          const isLast  = sectionIdx === dashConfig.config.sectionOrder.length - 1

          const sectionControls = (
            <SectionControls>
              <SectionArrowBtn
                type="button"
                title="Remonter"
                aria-label="Remonter cette section"
                $disabled={isFirst}
                disabled={isFirst}
                onClick={() => dashConfig.reorderSection(sectionId, 'up')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </SectionArrowBtn>
              <SectionArrowBtn
                type="button"
                title="Descendre"
                aria-label="Descendre cette section"
                $disabled={isLast}
                disabled={isLast}
                onClick={() => dashConfig.reorderSection(sectionId, 'down')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </SectionArrowBtn>
            </SectionControls>
          )

          if (sectionId === 'actions') return (
        <SectionWrap key="actions">
          {sectionControls}
        <ActionsBox aria-label="Actions en attente">
          <ActionsHeader>
            <ActionsLeft>
              <ActionsTitleRow>
                <ActionsTitle>Actions en attente</ActionsTitle>
                <ActionsBadge>{totalActionCount}</ActionsBadge>
              </ActionsTitleRow>
              <ActionsSubtitle>Éléments nécessitant votre attention</ActionsSubtitle>
            </ActionsLeft>
            <SeeAllBtn onClick={() => navigate('/historique')}>Voir tout →</SeeAllBtn>
          </ActionsHeader>
          <ActionsGrid>
            {dashConfig.config.actionCards
              .filter(c => c.visible)
              .map(c => {
                const def = actionCardDefs[c.id]
                if (!def) return null
                return (
                  <ActionCardWrap
                    key={c.id}
                    draggable
                    onDragStart={() => handleDragStart('actionCards', c.id)}
                    onDragOver={e => handleDragOver(e, 'actionCards', c.id)}
                    onDrop={() => handleDrop('actionCards', c.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardDragHandle title="Déplacer" aria-label="Déplacer cette carte">
                      <IconGrip />
                    </CardDragHandle>
                    <ActionCard
                      $empty={def.empty}
                      $dragging={cardDrag?.id === c.id}
                      $dropTarget={cardDrop?.id === c.id}
                      onClick={!def.empty && def.route ? () => navigate(def.route!) : undefined}
                    >
                      <ActionIconWrap $bg={def.iconBg} $color={def.iconColor}>
                        {def.icon}
                      </ActionIconWrap>
                      <ActionBody>
                        <ActionCount>{def.count}</ActionCount>
                        <ActionLabel>{def.label}</ActionLabel>
                        {def.deadline && <ActionDeadline>{def.deadline}</ActionDeadline>}
                      </ActionBody>
                      {!def.empty && def.route && <ActionArrow>→</ActionArrow>}
                    </ActionCard>
                  </ActionCardWrap>
                )
              })
            }
          </ActionsGrid>
          <GhostRow>
            <GhostCard><GhostCardIcon>+</GhostCardIcon><GhostCardLabel>Emplacement libre</GhostCardLabel></GhostCard>
            <GhostCard><GhostCardIcon>+</GhostCardIcon><GhostCardLabel>Emplacement libre</GhostCardLabel></GhostCard>
            <GhostCard><GhostCardIcon>+</GhostCardIcon><GhostCardLabel>Emplacement libre</GhostCardLabel></GhostCard>
          </GhostRow>
        </ActionsBox>
        </SectionWrap>
          )

          if (sectionId === 'kpi') return (
        <SectionWrap key="kpi">
          {sectionControls}
        <BilanSection aria-label="Tableau de bord">
          <BilanHeader>
            <BilanTitle>Tableau de bord</BilanTitle>
            <DashboardControls>
              <PeriodSelector
                preset={periodFilter.preset}
                setPreset={periodFilter.setPreset}
                period={periodFilter.period}
                customStart={periodFilter.customStart}
                setCustomStart={periodFilter.setCustomStart}
                customEnd={periodFilter.customEnd}
                setCustomEnd={periodFilter.setCustomEnd}
              />
              <ComparaisonToggle
                compareMode={periodFilter.compareMode}
                setCompareMode={periodFilter.setCompareMode}
                comparePeriod={periodFilter.comparePeriod}
                customCompareStart={periodFilter.customCompareStart}
                setCustomCompareStart={periodFilter.setCustomCompareStart}
                customCompareEnd={periodFilter.customCompareEnd}
                setCustomCompareEnd={periodFilter.setCustomCompareEnd}
              />
              <CustomizeBtn type="button" onClick={() =>
                exportDashboardCSV(kpi, periodFilter.orders, periodFilter.period, periodFilter.preset)
              }>
                <IconDownload /> Exporter CSV
              </CustomizeBtn>
              <CustomizeBtn $primary type="button" onClick={() => setCustomizerOpen(true)}>
                <IconLayout /> Personnaliser
              </CustomizeBtn>
            </DashboardControls>
          </BilanHeader>
          <KPIGrid>
            {dashConfig.config.kpiCards
              .filter(c => c.visible)
              .map(c => {
                const def = kpiCardDefs[c.id]
                if (!def) return null
                return (
                  <KPICard
                    key={c.id}
                    $dragging={cardDrag?.id === c.id}
                    $dropTarget={cardDrop?.id === c.id}
                    draggable
                    onDragStart={() => handleDragStart('kpiCards', c.id)}
                    onDragOver={e => handleDragOver(e, 'kpiCards', c.id)}
                    onDrop={() => handleDrop('kpiCards', c.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardDragHandle title="Déplacer" aria-label="Déplacer cette carte">
                      <IconGrip />
                    </CardDragHandle>
                    <KPITop>
                      <KPIIconWrap $bg={def.iconBg} $color={def.iconColor}>
                        {def.icon}
                      </KPIIconWrap>
                      <KPILabel>{def.label}</KPILabel>
                    </KPITop>
                    <KPIValue>{def.value}</KPIValue>
                    {def.trend}
                    {def.link}
                  </KPICard>
                )
              })
            }
            <GhostKpiCard>
              <GhostKpiIcon>+</GhostKpiIcon>
              <GhostKpiLabel>Emplacement libre</GhostKpiLabel>
            </GhostKpiCard>
          </KPIGrid>
          <GhostRow style={{ marginTop: '12px' }}>
            <GhostKpiCard><GhostKpiIcon>+</GhostKpiIcon><GhostKpiLabel>Emplacement libre</GhostKpiLabel></GhostKpiCard>
            <GhostKpiCard><GhostKpiIcon>+</GhostKpiIcon><GhostKpiLabel>Emplacement libre</GhostKpiLabel></GhostKpiCard>
          </GhostRow>
        </BilanSection>
        </SectionWrap>
          )

          if (sectionId === 'mainPanels') return (
        <SectionWrap key="mainPanels">
          {sectionControls}
          <SectionLabel>Analyse détaillée</SectionLabel>
        <ThreeColRow $count={dashConfig.config.mainPanels.filter(c => c.visible).length}>
          {dashConfig.config.mainPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-evolution') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('mainPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'mainPanels', c.id)}
                  onDrop={() => handleDrop('mainPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
                  <PanelHeader>
                    <PanelTitle>📈 Évolution des commandes</PanelTitle>
                  </PanelHeader>
                  {compareChartData && (
                    <ChartLegend>
                      <ChartLegendItem>
                        <ChartLegendLine $color="#16a34a" />
                        Période sélectionnée
                      </ChartLegendItem>
                      <ChartLegendItem>
                        <ChartLegendLine $color={theme.colors.accent} $dashed />
                        {compareModeShort(periodFilter.compareMode)}
                      </ChartLegendItem>
                    </ChartLegend>
                  )}
                  <ChartInner>
                    <ChartSvgWrap>
                      <ChartEvolution main={mainChartData} compare={compareChartData} />
                    </ChartSvgWrap>
                    <ChartStatsList>
                      <ChartStatRow>
                        <ChartStatLabel>Commandes envoyées</ChartStatLabel>
                        <ChartStatValueRow>
                          <ChartStatIcon $bg="#E6F2EC" $color="#226241">↑</ChartStatIcon>
                          <ChartStatNum>{nbEnvoyees}</ChartStatNum>
                          {cmpEnvoyees !== null && (
                            <ChartStatDelta $up={nbEnvoyees >= cmpEnvoyees}>
                              {nbEnvoyees >= cmpEnvoyees ? '▲' : '▼'}
                              {cmpEnvoyees > 0
                                ? ` ${Math.abs(Math.round(((nbEnvoyees - cmpEnvoyees) / cmpEnvoyees) * 100))}%`
                                : ''}
                            </ChartStatDelta>
                          )}
                        </ChartStatValueRow>
                      </ChartStatRow>
                      <ChartStatRow>
                        <ChartStatLabel>Commandes annulées</ChartStatLabel>
                        <ChartStatValueRow>
                          <ChartStatIcon $bg="#FDECEA" $color="#C0392B">✕</ChartStatIcon>
                          <ChartStatNum>{nbAnnulees}</ChartStatNum>
                          {cmpAnnulees !== null && (
                            <ChartStatDelta $up={nbAnnulees <= cmpAnnulees}>
                              {nbAnnulees <= cmpAnnulees ? '▼' : '▲'}
                              {cmpAnnulees > 0
                                ? ` ${Math.abs(Math.round(((nbAnnulees - cmpAnnulees) / cmpAnnulees) * 100))}%`
                                : ''}
                            </ChartStatDelta>
                          )}
                        </ChartStatValueRow>
                      </ChartStatRow>
                      <ChartStatRow>
                        <ChartStatLabel>Taux d'annulation</ChartStatLabel>
                        <ChartStatValueRow>
                          <ChartStatIcon $bg="#FDECEA" $color="#C0392B">%</ChartStatIcon>
                          <ChartStatNum>{(kpi.tauxRupture * 100).toFixed(1).replace('.', ',')} %</ChartStatNum>
                          {compareKpi && (
                            <ChartStatDelta $up={kpi.tauxRupture <= compareKpi.tauxRupture}>
                              {kpi.tauxRupture <= compareKpi.tauxRupture ? '▼' : '▲'}
                              {' '}{Math.abs(Math.round((kpi.tauxRupture - compareKpi.tauxRupture) * 1000) / 10).toFixed(1)} pts
                            </ChartStatDelta>
                          )}
                        </ChartStatValueRow>
                      </ChartStatRow>
                    </ChartStatsList>
                  </ChartInner>
                </PanelCard>
              )
              if (c.id === 'panel-donut') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('mainPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'mainPanels', c.id)}
                  onDrop={() => handleDrop('mainPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
                  <PanelHeader>
                    <PanelTitle>🍩 Répartition achats</PanelTitle>
                  </PanelHeader>
                  <DonutInner>
                    <ChartDonut main={donutData} compare={compareDonutData} />
                    <DonutLegend>
                      {donutData.map((seg, i) => {
                        const cmpSeg = compareDonutData?.[i]
                        return (
                          <LegendItem key={seg.label}>
                            <LegendDot $color={seg.color} />
                            <LegendLabel>{seg.label}</LegendLabel>
                            <LegendPct>{seg.percent}%</LegendPct>
                            {cmpSeg && (
                              <LegendPctCompare>vs {cmpSeg.percent}%</LegendPctCompare>
                            )}
                          </LegendItem>
                        )
                      })}
                    </DonutLegend>
                  </DonutInner>
                </PanelCard>
              )
              if (c.id === 'panel-editeurs') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('mainPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'mainPanels', c.id)}
                  onDrop={() => handleDrop('mainPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
                  <PanelHeader>
                    <PanelTitle>🏅 Top éditeurs</PanelTitle>
                    <PanelSeeAll onClick={() => navigate('/fonds')}>Voir tout →</PanelSeeAll>
                  </PanelHeader>
                  <TopEdList>
                    {topPublishers.map(({ name, pct, montant }, i) => (
                      <TopEdRow key={name}>
                        <TopEdRank>{i + 1}</TopEdRank>
                        <TopEdName>{name}</TopEdName>
                        <TopEdPct>{pct}%</TopEdPct>
                        <TopEdAmount>{fmtEur(montant)}</TopEdAmount>
                      </TopEdRow>
                    ))}
                  </TopEdList>
                  <TopEdFooter>
                    <TopEdFooterLabel>Part du montant</TopEdFooterLabel>
                    <TopEdFooterLabel>Montant commandé</TopEdFooterLabel>
                  </TopEdFooter>
                </PanelCard>
              )
              return null
            })
          }
        </ThreeColRow>
          <div style={{ display: 'grid', gridTemplateColumns: '45fr 30fr 25fr', gap: '14px', marginTop: '12px' }}>
            <GhostPanel><GhostPanelIcon>+</GhostPanelIcon><GhostPanelLabel>Emplacement libre</GhostPanelLabel></GhostPanel>
            <GhostPanel><GhostPanelIcon>+</GhostPanelIcon><GhostPanelLabel>Emplacement libre</GhostPanelLabel></GhostPanel>
            <GhostPanel><GhostPanelIcon>+</GhostPanelIcon><GhostPanelLabel>Emplacement libre</GhostPanelLabel></GhostPanel>
          </div>
        </SectionWrap>
          )

          if (sectionId === 'bottomPanels') return (
        <SectionWrap key="bottomPanels">
          {sectionControls}
          <SectionLabel>Flux &amp; opérations</SectionLabel>
        <ThreeColRow $count={dashConfig.config.bottomPanels.filter(c => c.visible).length}>
          {dashConfig.config.bottomPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-edi') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('bottomPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'bottomPanels', c.id)}
                  onDrop={() => handleDrop('bottomPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
                  <PanelHeader>
                    <PanelTitle>🔗 Suivi des flux EDI</PanelTitle>
                    <PanelSeeAll onClick={() => navigate('/edi')}>Accéder →</PanelSeeAll>
                  </PanelHeader>
                  <EdiStatsGrid>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#E6F2EC" $color="#226241">↑</EdiStatIcon>
                      <div>
                        <EdiStatNum>12</EdiStatNum>
                        <EdiStatLabel>Commandes envoyées</EdiStatLabel>
                      </div>
                    </EdiStatItem>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#EFF6FF" $color="#2563EB">🚚</EdiStatIcon>
                      <div>
                        <EdiStatNum>5</EdiStatNum>
                        <EdiStatLabel>Expéditions en cours</EdiStatLabel>
                      </div>
                    </EdiStatItem>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#FFF7ED" $color="#EA580C">📄</EdiStatIcon>
                      <div>
                        <EdiStatNum>3</EdiStatNum>
                        <EdiStatLabel>Factures reçues</EdiStatLabel>
                      </div>
                    </EdiStatItem>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#FDECEA" $color="#C0392B">⚠️</EdiStatIcon>
                      <div>
                        <EdiStatNum>1</EdiStatNum>
                        <EdiStatLabel>Erreur à traiter</EdiStatLabel>
                      </div>
                    </EdiStatItem>
                  </EdiStatsGrid>
                  <EdiMetricsRow>
                    <div>
                      <EdiMetricLabel>Délai moyen de livraison</EdiMetricLabel>
                      <EdiMetricValue>3,2 jours</EdiMetricValue>
                    </div>
                    <div>
                      <EdiMetricLabel>Taux de réception</EdiMetricLabel>
                      <EdiMetricValue>92%</EdiMetricValue>
                    </div>
                  </EdiMetricsRow>
                  <EdiLink onClick={() => navigate('/edi')}>Accéder au suivi EDI →</EdiLink>
                </PanelCard>
              )
              if (c.id === 'panel-nouveautes') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('bottomPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'bottomPanels', c.id)}
                  onDrop={() => handleDrop('bottomPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
                  <PanelHeader>
                    <PanelTitle>✨ Nouveautés du mois</PanelTitle>
                    <PanelSeeAll onClick={() => navigate('/nouveautes')}>Voir tout →</PanelSeeAll>
                  </PanelHeader>
                  <NovelPanelWrap>
                    <NovelArrow $side="right" $visible={canNovRight}
                      onClick={() => scrollNovBy(120)} aria-label="Suivant">
                      <IconChevron dir="right" />
                    </NovelArrow>
                    <NovelScroll ref={novelRef}>
                      {nouveautes.map(book => {
                        const badge = UNIVERSE_BADGE_COLOR[book.universe] ?? { bg: '#6B7280', text: '#fff' }
                        return (
                          <MiniCard key={book.id} onClick={() => navigate(`/livre/${book.id}`)}>
                            <MiniCoverWrap>
                              <BookCover
                                isbn={book.isbn}
                                alt={book.title}
                                width={110}
                                height={150}
                                universe={book.universe}
                                authors={book.authors}
                                publisher={book.publisher}
                              />
                            </MiniCoverWrap>
                            <UniverseBadge $bg={badge.bg} $text={badge.text}>
                              {book.universe}
                            </UniverseBadge>
                            <MiniTitle>{book.title}</MiniTitle>
                            <MiniAuthor>{book.authors[0]}</MiniAuthor>
                            <MiniPrice>{book.priceTTC.toFixed(2).replace('.', ',')} €</MiniPrice>
                          </MiniCard>
                        )
                      })}
                    </NovelScroll>
                  </NovelPanelWrap>
                </PanelCard>
              )
              if (c.id === 'panel-raccourcis') return (
                <PanelCard
                  key={c.id}
                  $dragging={cardDrag?.id === c.id}
                  $dropTarget={cardDrop?.id === c.id}
                  draggable
                  onDragStart={() => handleDragStart('bottomPanels', c.id)}
                  onDragOver={e => handleDragOver(e, 'bottomPanels', c.id)}
                  onDrop={() => handleDrop('bottomPanels', c.id)}
                  onDragEnd={handleDragEnd}
                >
                  <CardDragHandle title="Déplacer" aria-label="Déplacer ce panneau">
                    <IconGrip />
                  </CardDragHandle>
                  <PanelHeader>
                    <PanelTitle>⚡ Raccourcis</PanelTitle>
                  </PanelHeader>
                  <ShortcutList>
                    {([
                      { icon: '📦', label: 'Passer une commande',    to: '/fonds'      },
                      { icon: '🛒', label: 'Accéder au panier',       to: '/panier'     },
                      { icon: '📋', label: 'Gérer mes listes',        to: '/compte'     },
                      { icon: '📊', label: 'Consulter mon historique', to: '/historique' },
                    ] as { icon: React.ReactNode; label: string; to: string }[]).map(({ icon, label, to }) => (
                      <ShortcutRow key={to} to={to}>
                        <ShortcutIconWrap>{icon}</ShortcutIconWrap>
                        <ShortcutRowLabel>{label}</ShortcutRowLabel>
                        <ShortcutChevron>›</ShortcutChevron>
                      </ShortcutRow>
                    ))}
                  </ShortcutList>
                </PanelCard>
              )
              return null
            })
          }
        </ThreeColRow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '12px' }}>
            <GhostPanel><GhostPanelIcon>+</GhostPanelIcon><GhostPanelLabel>Emplacement libre</GhostPanelLabel></GhostPanel>
            <GhostPanel><GhostPanelIcon>+</GhostPanelIcon><GhostPanelLabel>Emplacement libre</GhostPanelLabel></GhostPanel>
            <GhostPanel><GhostPanelIcon>+</GhostPanelIcon><GhostPanelLabel>Emplacement libre</GhostPanelLabel></GhostPanel>
          </div>
        </SectionWrap>
          )

          return null
        })}

        {/* Reminder À paraître */}
        <ReminderCard>
          <ReminderIcon>📅</ReminderIcon>
          <ReminderText>
            <strong>Catalogue À paraître — Été 2026 disponible</strong>
            <p>Consultez les 127 nouveaux titres prévus pour juin–août 2026. Commandes auprès de votre représentant.</p>
          </ReminderText>
          <ReminderBtn onClick={() => navigate('/a-paraitre')}>
            Voir le catalogue
          </ReminderBtn>
        </ReminderCard>

        <CustomizerDrawer
          open={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          config={dashConfig.config}
          onReorder={dashConfig.reorder}
          onToggle={dashConfig.toggle}
          onReset={dashConfig.reset}
        />

      </Content>

      <FAB title="Donner un feedback" aria-label="Ouvrir le formulaire de feedback" onClick={() => navigate('/contact')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </FAB>

    </Page>
  )
}
