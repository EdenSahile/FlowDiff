import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'

/* ── Constantes ── */
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const MONTHS_FULL  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS_HDR     = ['l', 'ma', 'me', 'j', 'v', 's', 'd']

/* ── Helpers ── */
function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseISO(iso: string) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

function fmtDisplay(iso: string) {
  const p = parseISO(iso)
  if (!p) return ''
  return `${String(p.day).padStart(2, '0')}/${String(p.month + 1).padStart(2, '0')}/${p.year}`
}

type Cell = { day: number; own: boolean; iso: string }

function buildGrid(year: number, month: number): Cell[][] {
  const firstDow = new Date(year, month, 1).getDay()
  const firstMon = (firstDow + 6) % 7
  const daysInM  = new Date(year, month + 1, 0).getDate()
  const prevM    = month === 0 ? 11 : month - 1
  const prevY    = month === 0 ? year - 1 : year
  const daysInP  = new Date(prevY, prevM + 1, 0).getDate()
  const nextM    = month === 11 ? 0 : month + 1
  const nextY    = month === 11 ? year + 1 : year

  const cells: Cell[] = []
  for (let i = firstMon - 1; i >= 0; i--) {
    const d = daysInP - i
    cells.push({ day: d, own: false, iso: toISO(prevY, prevM, d) })
  }
  for (let d = 1; d <= daysInM; d++) {
    cells.push({ day: d, own: true, iso: toISO(year, month, d) })
  }
  let nd = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: nd, own: false, iso: toISO(nextY, nextM, nd) })
    nd++
  }
  const weeks: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function isMonthDisabled(y: number, m: number, min?: string, max?: string) {
  const last = new Date(y, m + 1, 0).getDate()
  if (min && toISO(y, m, last) < min) return true
  if (max && toISO(y, m, 1)    > max) return true
  return false
}

/* ── Styled ── */
const Wrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`

const DisplayInput = styled.button`
  height: 38px;
  padding: 0 36px 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray[800]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.875rem;
  width: 158px;
  text-align: left;
  cursor: pointer;

  &:focus { outline: 2px solid ${({ theme }) => theme.colors.navy}; outline-offset: -1px; }
`

const PlaceholderSpan = styled.span`
  color: ${({ theme }) => theme.colors.gray[400]};
`

const CalBtn = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  height: 38px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-left: 1px solid ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.gray[400]};
  cursor: pointer;
  padding: 0;
  &:hover { color: ${({ theme }) => theme.colors.navy}; background: ${({ theme }) => theme.colors.gray[50]}; }
`

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 280px;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  z-index: 200;
  user-select: none;
`

const PHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};
`

const NavBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  &:hover { color: ${({ theme }) => theme.colors.navy}; }
`

const HeaderLabel = styled.button`
  background: none;
  border: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.9375rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.navy};
  cursor: pointer;
  padding: 2px 8px;
  &:hover { background: ${({ theme }) => theme.colors.gray[100]}; }
  &:disabled { cursor: default; background: none; }
`

/* Vue mois */
const MonthsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 12px;
`

type MonthBtnProps = { $selected?: boolean; $disabled?: boolean }
const MonthBtn = styled.button<MonthBtnProps>`
  padding: 11px 4px;
  border: none;
  background: ${({ $selected, theme }) => $selected ? theme.colors.navy : 'transparent'};
  color: ${({ $selected, $disabled, theme }) =>
    $disabled ? theme.colors.gray[200] :
    $selected  ? '#fff'                :
    theme.colors.gray[800]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  &:hover { background: ${({ $selected, theme }) =>
    $selected ? theme.colors.navy : theme.colors.accentLight}; }
`

/* Vue jours */
const DayArea = styled.div`
  padding: 8px 10px 4px;
`

const DayHeaders = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 2px;
`

const DayHdr = styled.span`
  text-align: center;
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.gray[400]};
  padding: 4px 0;
`

const DayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`

type DayBtnProps = { $selected?: boolean; $own?: boolean; $disabled?: boolean }
const DayBtn = styled.button<DayBtnProps>`
  padding: 6px 2px;
  border: none;
  background: ${({ $selected, theme }) => $selected ? theme.colors.navy : 'transparent'};
  color: ${({ $selected, $own, $disabled, theme }) =>
    $disabled ? theme.colors.gray[200] :
    $selected  ? '#fff'                :
    !$own      ? theme.colors.gray[400] :
    theme.colors.gray[800]};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.8125rem;
  text-align: center;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  &:hover { background: ${({ $selected, $disabled, theme }) =>
    $disabled  ? 'transparent'                :
    $selected  ? theme.colors.navy            :
    theme.colors.accentLight}; }
`

/* Footer */
const PFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
  padding: 8px 12px;
  text-align: center;
`

const ClearBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 0.875rem;
  cursor: pointer;
  padding: 4px 12px;
  &:hover { text-decoration: underline; }
`

/* Icône */
function IconCal() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  )
}

/* ════════════════════════════════════════════════════════
   Composant
════════════════════════════════════════════════════════ */
export interface DatePickerProps {
  value:        string
  onChange:     (v: string) => void
  min?:         string
  max?:         string
  placeholder?: string
}

export function DatePicker({ value, onChange, min, max, placeholder = 'JJ/MM/AAAA' }: DatePickerProps) {
  const now    = new Date()
  const parsed = parseISO(value)

  const [open,     setOpen]     = useState(false)
  const [prevOpen, setPrevOpen] = useState(false)
  const [view,     setView]     = useState<'months' | 'days'>('months')
  const [navYear,  setNavYear]  = useState(parsed?.year  ?? now.getFullYear())
  const [navMonth, setNavMonth] = useState(parsed?.month ?? now.getMonth())

  const containerRef = useRef<HTMLDivElement>(null)

  if (open && !prevOpen) {
    const p = parseISO(value)
    setNavYear(p?.year   ?? now.getFullYear())
    setNavMonth(p?.month ?? now.getMonth())
    setView('months')
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  /* Fermeture clic extérieur */
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown',   onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown',   onKey)
    }
  }, [open])

  function selectMonth(m: number) { setNavMonth(m); setView('days') }
  function selectDay(iso: string)  { onChange(iso); setOpen(false) }
  function clear()                 { onChange('');  setOpen(false) }

  function prevYear()  { setNavYear(y => y - 1) }
  function nextYear()  { setNavYear(y => y + 1) }
  function prevMonth() {
    if (navMonth === 0) { setNavYear(y => y - 1); setNavMonth(11) }
    else setNavMonth(m => m - 1)
  }
  function nextMonth() {
    if (navMonth === 11) { setNavYear(y => y + 1); setNavMonth(0) }
    else setNavMonth(m => m + 1)
  }

  const grid = buildGrid(navYear, navMonth)

  return (
    <Wrap ref={containerRef}>
      <DisplayInput type="button" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open}>
        {value ? fmtDisplay(value) : <PlaceholderSpan>{placeholder}</PlaceholderSpan>}
      </DisplayInput>
      <CalBtn type="button" tabIndex={-1} onClick={() => setOpen(o => !o)} aria-label="Ouvrir le calendrier">
        <IconCal />
      </CalBtn>

      {open && (
        <Dropdown role="dialog" aria-label="Sélecteur de date">

          {/* ── Vue : sélection du mois ── */}
          {view === 'months' && (
            <>
              <PHeader>
                <NavBtn type="button" onClick={prevYear} aria-label="Année précédente">«</NavBtn>
                <HeaderLabel type="button" disabled>{navYear}</HeaderLabel>
                <NavBtn type="button" onClick={nextYear} aria-label="Année suivante">»</NavBtn>
              </PHeader>
              <MonthsGrid>
                {MONTHS_SHORT.map((label, i) => (
                  <MonthBtn
                    key={i}
                    type="button"
                    $selected={!!parsed && parsed.year === navYear && parsed.month === i}
                    $disabled={isMonthDisabled(navYear, i, min, max)}
                    onClick={() => selectMonth(i)}
                    aria-label={MONTHS_FULL[i]}
                  >
                    {label}
                  </MonthBtn>
                ))}
              </MonthsGrid>
            </>
          )}

          {/* ── Vue : sélection du jour ── */}
          {view === 'days' && (
            <>
              <PHeader>
                <NavBtn type="button" onClick={prevMonth} aria-label="Mois précédent">«</NavBtn>
                <HeaderLabel type="button" onClick={() => setView('months')} title="Retour aux mois">
                  {MONTHS_FULL[navMonth]} {navYear}
                </HeaderLabel>
                <NavBtn type="button" onClick={nextMonth} aria-label="Mois suivant">»</NavBtn>
              </PHeader>
              <DayArea>
                <DayHeaders>
                  {DAYS_HDR.map(d => <DayHdr key={d}>{d}</DayHdr>)}
                </DayHeaders>
                {grid.map((week, wi) => (
                  <DayRow key={wi}>
                    {week.map((cell, di) => {
                      const disabled =
                        (!!min && cell.iso < min) ||
                        (!!max && cell.iso > max)
                      return (
                        <DayBtn
                          key={di}
                          type="button"
                          $selected={cell.iso === value}
                          $own={cell.own}
                          $disabled={disabled}
                          onClick={() => !disabled && selectDay(cell.iso)}
                          aria-label={fmtDisplay(cell.iso)}
                          aria-pressed={cell.iso === value}
                        >
                          {cell.day}
                        </DayBtn>
                      )
                    })}
                  </DayRow>
                ))}
              </DayArea>
            </>
          )}

          <PFooter>
            <ClearBtn type="button" onClick={clear}>Effacer</ClearBtn>
          </PFooter>

        </Dropdown>
      )}
    </Wrap>
  )
}
