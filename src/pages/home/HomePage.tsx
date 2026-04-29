import React, { useEffect, useMemo, useRef, useState } from 'react'
import { theme } from '@/lib/theme'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/contexts/CartContext'
import { useOrders } from '@/contexts/OrdersContext'
import { MOCK_BOOKS } from '@/data/mockBooks'
import { BookCover } from '@/components/catalogue/BookCover'
import { usePeriodFilter, type CompareMode } from '@/hooks/usePeriodFilter'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { ComparaisonToggle } from '@/components/dashboard/ComparaisonToggle'
import { useDashboardConfig } from '@/hooks/useDashboardConfig'
import { CustomizerDrawer } from '@/components/dashboard/CustomizerDrawer'
import { computeKPIs, computeChartData, computeDonutData, computeTopPublishers, orderToDashboardOrders, fmtEur, type ChartPoint, type DonutSegment } from '@/data/mockDashboard'

const GREEN = theme.colors.success

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

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

function fmtFrDate(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('fr-FR', { month: 'long' })
  const year = date.getFullYear()
  return `${day === 1 ? '1er' : day} ${month} ${year}`
}

/* ── Page layout ── */
const Page = styled.div`
  min-height: calc(100vh - ${({ theme }) => theme.layout.headerHeight});
  background-color: ${({ theme }) => theme.colors.gray[50]};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing['3xl']};
  }
`

const Content = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

/* ── Greeting row ── */
const GreetingRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`

const GreetingTitle = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.gray[800]};
  margin: 0;
`

const DateBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: right;
`

const DateText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const DateLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[400]};
  line-height: 1.2;
`

const DateValue = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.3;
`

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ color: '#6B6B68', flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ flexShrink: 0, color: '#6B6B68', marginTop: 1 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

/* ── Actions en attente ── */
const ActionsBox = styled.section`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  padding: 16px 20px;
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
  font-size: 15px;
  font-weight: 600;
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
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
`

const SeeAllBtn = styled.button`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[800]};
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

const ActionCard = styled.button<{ $empty?: boolean }>`
  background: white;
  border: 1px solid ${({ $empty }) => $empty ? '#E5E7EB' : '#FEE2E2'};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: ${({ $empty }) => $empty ? 'default' : 'pointer'};
  text-align: left;
  width: 100%;
  opacity: ${({ $empty }) => $empty ? 0.55 : 1};
  pointer-events: ${({ $empty }) => $empty ? 'none' : 'auto'};
  &:hover { border-color: ${({ $empty }) => $empty ? '#E5E7EB' : '#FECACA'}; }
`

const ActionIconWrap = styled.div<{ $bg: string; $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const ActionBody = styled.div`
  flex: 1;
`

const ActionCount = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.1;
  margin-bottom: 2px;
`

const ActionLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.3;
`

const ActionDeadline = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
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
  font-weight: 600;
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

const CustomizeBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  &:hover {
    border-color: ${({ theme }) => theme.colors.gray[400]};
    color: ${({ theme }) => theme.colors.gray[800]};
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

const KPICard = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const KPITop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const KPIIconWrap = styled.div<{ $bg: string; $color: string }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const KPILabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: 1.3;
`

const KPIValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gray[800]};
  line-height: 1.1;
`

const KPITrend = styled.div<{ $up: boolean }>`
  font-size: 12px;
  color: ${({ $up }) => $up ? '#16a34a' : '#DC2626'};
  display: flex;
  align-items: center;
  gap: 3px;
`

const KPILink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.success};
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

const PanelCard = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: 16px;
`

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`

const PanelTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
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
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.gray[600]};
  cursor: pointer;
  white-space: nowrap;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
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
        <polyline points={comparePoly} fill="none" stroke="#C9A84C" strokeWidth="1.2"
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

/* ── Footer info bar ── */
const FooterBar = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 4px;
`

const FooterText = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
  margin: 0;
  line-height: 1.5;
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

/* ── Shortcuts (old grid, kept for mobile bottom bar) ── */
const ShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const ShortcutCard = styled(Link)`
  background: ${({ theme }) => theme.colors.gray[100]};
  border: 0.5px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 12px;
  text-align: center;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.gray[600]};
  transition: border-color 0.15s;

  &:hover {
    border-color: ${GREEN};
  }
`

const ShortcutLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.gray[600]};
`

/* ── Nouveautés ── */
const NouveautesSection = styled.section`
  width: 100%;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
`

const SeeAllLink = styled(Link)`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  font-weight: 500;
  color: ${GREEN};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`

/* max-width = 4 cards × 230px + 3 gaps × 20px = 980px */
const CarouselWrapper = styled.div`
  position: relative;
  max-width: calc(4 * 230px + 3 * 20px);
`

const CardScroll = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 8px 4px 16px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const CardSlot = styled.div`
  flex-shrink: 0;
  width: 230px;
`

const ArrowBtn = styled.button<{ $side: 'left' | 'right'; $visible: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => $side === 'left' ? 'left: -18px;' : 'right: -18px;'}
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.navy};
  transition: box-shadow 0.15s, opacity 0.15s;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};

  &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.18); }
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const novelRef = useRef<HTMLDivElement>(null)
  const [canNovLeft,  setCanNovLeft]  = useState(false)
  const [canNovRight, setCanNovRight] = useState(true)

  const [customizerOpen, setCustomizerOpen] = useState(false)
  const dashConfig = useDashboardConfig()

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const dateLabel = 'Aujourd\'hui'
  const dateValue = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

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

  const nbEnvoyees  = kpi.nbCommandes - Math.round(kpi.nbCommandes * kpi.tauxRupture)
  const nbAnnulees  = Math.round(kpi.nbCommandes * kpi.tauxRupture)
  const cmpEnvoyees = compareKpi
    ? compareKpi.nbCommandes - Math.round(compareKpi.nbCommandes * compareKpi.tauxRupture)
    : null
  const cmpAnnulees = compareKpi ? Math.round(compareKpi.nbCommandes * compareKpi.tauxRupture) : null

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

  /* Mise à jour des flèches au scroll */
  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows)
    return () => el.removeEventListener('scroll', updateArrows)
  }, [])

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(updateArrows, 50)
  }

  function updateNovArrows() {
    const el = novelRef.current
    if (!el) return
    setCanNovLeft(el.scrollLeft > 4)
    setCanNovRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = novelRef.current
    if (!el) return
    updateNovArrows()
    el.addEventListener('scroll', updateNovArrows)
    return () => el.removeEventListener('scroll', updateNovArrows)
  }, [])

  function scrollNovBy(delta: number) {
    novelRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(updateNovArrows, 50)
  }

  const actionCardDefs: Record<string, ActionCardDef> = {
    'action-offices': {
      icon: <IconPackage />,
      iconBg: '#F0FDF4', iconColor: '#16A34A',
      count: 1, label: 'office à valider',
      deadline: 'Limite : 13 mai 2026',
      route: '/offices',
    },
    'action-panier': {
      icon: <IconOrders />,
      iconBg: cartCount === 0 ? '#F3F4F6' : '#FFF7ED',
      iconColor: cartCount === 0 ? '#9CA3AF' : '#EA580C',
      count: cartCount,
      label: cartCount === 0 ? 'Panier vide' : cartCount <= 1 ? 'Ouvrage dans le panier' : 'Ouvrages dans le panier',
      route: '/panier',
      empty: cartCount === 0,
    },
    'action-commandes': {
      icon: <IconReceipt />,
      iconBg: '#FFFBEB', iconColor: '#D97706',
      count: 2, label: 'commandes à vérifier',
      route: '/edi?filter=ORDRSP',
    },
    'action-edi-error': {
      icon: <IconAlertClock />,
      iconBg: '#FEF2F2', iconColor: '#DC2626',
      count: 1, label: 'erreur EDI à corriger',
      route: '/edi',
    },
    'action-expeditions': {
      icon: <IconTruck />,
      iconBg: '#EFF6FF', iconColor: '#2563EB',
      count: 3, label: 'expéditions en retard',
      route: '/edi?filter=DESADV',
    },
  }

  const kpiCardDefs: Record<string, KpiCardDef> = {
    'kpi-commandes': {
      icon: <IconCart />,
      iconBg: '#DCFCE7', iconColor: '#16a34a',
      label: 'Commandes passées',
      value: kpi.nbCommandes,
      trend: compareKpi
        ? <KpiTrendLine current={kpi.nbCommandes} compare={compareKpi.nbCommandes} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-montant': {
      icon: <IconEuro />,
      iconBg: '#DCFCE7', iconColor: '#16a34a',
      label: 'Montant total commandé (TTC)',
      value: fmtEur(kpi.montantTotal),
      trend: compareKpi
        ? <KpiTrendLine current={kpi.montantTotal} compare={compareKpi.montantTotal} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-exemplaires': {
      icon: <IconBox />,
      iconBg: '#DCFCE7', iconColor: '#16a34a',
      label: 'Exemplaires commandés',
      value: kpi.nbExemplaires.toLocaleString('fr-FR'),
      trend: compareKpi
        ? <KpiTrendLine current={kpi.nbExemplaires} compare={compareKpi.nbExemplaires} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-panier-moyen': {
      icon: <IconBarChart />,
      iconBg: '#EDE9FE', iconColor: '#7C3AED',
      label: 'Panier moyen',
      value: fmtEur(kpi.panierMoyen),
      trend: compareKpi
        ? <KpiTrendLine current={kpi.panierMoyen} compare={compareKpi.panierMoyen} mode={periodFilter.compareMode} />
        : undefined,
      link: <KPILink onClick={() => navigate('/historique')}>Voir le détail →</KPILink>,
    },
    'kpi-delai': {
      icon: <IconAlertClock />,
      iconBg: '#FFF7ED', iconColor: '#EA580C',
      label: 'Délai moyen de livraison',
      value: `${kpi.delaiMoyen.toFixed(1).replace('.', ',')} j`,
      trend: compareKpi
        ? <KpiTrendLine current={kpi.delaiMoyen} compare={compareKpi.delaiMoyen} mode={periodFilter.compareMode} invert />
        : undefined,
    },
    'kpi-rupture': {
      icon: <IconXCircle />,
      iconBg: '#FEE2E2', iconColor: '#DC2626',
      label: 'Taux de rupture',
      value: `${(kpi.tauxRupture * 100).toFixed(1).replace('.', ',')} %`,
      trend: compareKpi
        ? <KpiTrendLine current={kpi.tauxRupture} compare={compareKpi.tauxRupture} mode={periodFilter.compareMode} invert />
        : undefined,
    },
    'kpi-references': {
      icon: <IconBooks />,
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
          <GreetingTitle>
            {greeting} {user?.nomLibrairie ?? 'Librairie'} 👋
          </GreetingTitle>
          <DateBlock>
            <DateText>
              <DateLabel>{dateLabel}</DateLabel>
              <DateValue>{dateValue}</DateValue>
            </DateText>
            <IconCalendar />
          </DateBlock>
        </GreetingRow>

        {/* 2 — Actions en attente */}
        <ActionsBox aria-label="Actions en attente">
          <ActionsHeader>
            <ActionsLeft>
              <ActionsTitleRow>
                <ActionsTitle>Actions en attente</ActionsTitle>
                <ActionsBadge>10</ActionsBadge>
              </ActionsTitleRow>
              <ActionsSubtitle>Ce sont des éléments qui nécessitent votre attention.</ActionsSubtitle>
            </ActionsLeft>
            <SeeAllBtn onClick={() => navigate('/historique')}>Voir toutes les actions →</SeeAllBtn>
          </ActionsHeader>
          <ActionsGrid>
            {dashConfig.config.actionCards
              .filter(c => c.visible)
              .map(c => {
                const def = actionCardDefs[c.id]
                if (!def) return null
                return (
                  <ActionCard
                    key={c.id}
                    $empty={def.empty}
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
                )
              })
            }
          </ActionsGrid>
        </ActionsBox>

        {/* 3 — Tableau de bord (KPI + graphiques) */}
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
              <CustomizeBtn type="button" onClick={() => setCustomizerOpen(true)}>
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
                  <KPICard key={c.id}>
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
          </KPIGrid>
        </BilanSection>

        {/* Ligne 4-5-6 */}
        <ThreeColRow $count={dashConfig.config.mainPanels.filter(c => c.visible).length}>
          {dashConfig.config.mainPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-evolution') return (
                <PanelCard key={c.id}>
                  <PanelHeader>
                    <PanelTitle>
                      Évolution des commandes
                      <IconCalendar />
                    </PanelTitle>
                  </PanelHeader>
                  {compareChartData && (
                    <ChartLegend>
                      <ChartLegendItem>
                        <ChartLegendLine $color="#16a34a" />
                        Période sélectionnée
                      </ChartLegendItem>
                      <ChartLegendItem>
                        <ChartLegendLine $color="#C9A84C" $dashed />
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
                          <ChartStatIcon $bg="#DCFCE7" $color="#16a34a"><IconSend /></ChartStatIcon>
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
                          <ChartStatIcon $bg="#FEE2E2" $color="#DC2626"><IconXCircle /></ChartStatIcon>
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
                          <ChartStatIcon $bg="#FEE2E2" $color="#DC2626"><IconXCircle /></ChartStatIcon>
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
                <PanelCard key={c.id}>
                  <PanelHeader>
                    <PanelTitle>Répartition de vos achats</PanelTitle>
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
                <PanelCard key={c.id}>
                  <PanelHeader>
                    <PanelTitle>Top éditeurs</PanelTitle>
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

        {/* Ligne 7-8-9 */}
        <ThreeColRow $count={dashConfig.config.bottomPanels.filter(c => c.visible).length}>
          {dashConfig.config.bottomPanels
            .filter(c => c.visible)
            .map(c => {
              if (c.id === 'panel-edi') return (
                <PanelCard key={c.id}>
                  <PanelHeader>
                    <PanelTitle>Suivi des flux EDI</PanelTitle>
                  </PanelHeader>
                  <EdiStatsGrid>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#DCFCE7" $color="#16a34a"><IconSend /></EdiStatIcon>
                      <div>
                        <EdiStatNum>12</EdiStatNum>
                        <EdiStatLabel>Commandes envoyées</EdiStatLabel>
                      </div>
                    </EdiStatItem>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#EFF6FF" $color="#2563EB"><IconTruck /></EdiStatIcon>
                      <div>
                        <EdiStatNum>5</EdiStatNum>
                        <EdiStatLabel>Expéditions en cours</EdiStatLabel>
                      </div>
                    </EdiStatItem>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#FFF7ED" $color="#EA580C"><IconReceipt /></EdiStatIcon>
                      <div>
                        <EdiStatNum>3</EdiStatNum>
                        <EdiStatLabel>Factures reçues</EdiStatLabel>
                      </div>
                    </EdiStatItem>
                    <EdiStatItem>
                      <EdiStatIcon $bg="#FEF2F2" $color="#DC2626"><IconXCircle /></EdiStatIcon>
                      <div>
                        <EdiStatNum>1</EdiStatNum>
                        <EdiStatLabel>Erreur EDI</EdiStatLabel>
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
                <PanelCard key={c.id}>
                  <PanelHeader>
                    <PanelTitle>Nouveautés du mois</PanelTitle>
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
                          </MiniCard>
                        )
                      })}
                    </NovelScroll>
                  </NovelPanelWrap>
                </PanelCard>
              )
              if (c.id === 'panel-raccourcis') return (
                <PanelCard key={c.id}>
                  <PanelHeader>
                    <PanelTitle>Raccourcis</PanelTitle>
                  </PanelHeader>
                  <ShortcutList>
                    {([
                      { icon: <IconPackage />, label: 'Passer une commande',    to: '/fonds'      },
                      { icon: <IconCart />,    label: 'Accéder au panier',       to: '/panier'     },
                      { icon: <IconClipboard />, label: 'Gérer mes listes',      to: '/compte'     },
                      { icon: <IconOrders />, label: 'Consulter mon historique', to: '/historique' },
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

        {/* 10 — Footer info bar */}
        <FooterBar>
          <IconInfo />
          <FooterText>
            Les statistiques intègrent vos commandes passées via l'application et sont calculées en temps réel. L'historique de démonstration couvre la période du {fmtFrDate(new Date('2024-01-01'))} à aujourd'hui.
          </FooterText>
        </FooterBar>

        <CustomizerDrawer
          open={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          config={dashConfig.config}
          onReorder={dashConfig.reorder}
          onToggle={dashConfig.toggle}
          onReset={dashConfig.reset}
        />

      </Content>
    </Page>
  )
}
