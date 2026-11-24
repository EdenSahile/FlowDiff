import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  MOCK_DASHBOARD_ORDERS,
  filterDataByPeriod,
  type DashboardOrder,
} from '../data/mockDashboard'

/* ─────────────────────────────────────────
   Types publics
───────────────────────────────────────── */

export type PeriodPreset =
  | 'last-7'
  | 'last-30'
  | 'this-month'
  | 'last-month'
  | '3-months'
  | 'last-12'
  | '6-months'
  | 'this-year'
  | 'custom'

export type CompareMode = 'none' | 'previous' | 'year-ago' | 'custom'

export interface DateRange {
  start: Date
  end: Date
}

export interface UsePeriodFilterReturn {
  // Période principale
  preset: PeriodPreset
  setPreset: (p: PeriodPreset) => void
  period: DateRange
  customStart: string   // YYYY-MM-DD pour <input type="date">
  setCustomStart: (v: string) => void
  customEnd: string
  setCustomEnd: (v: string) => void

  // Comparaison
  compareMode: CompareMode
  setCompareMode: (m: CompareMode) => void
  comparePeriod: DateRange | null
  customCompareStart: string
  setCustomCompareStart: (v: string) => void
  customCompareEnd: string
  setCustomCompareEnd: (v: string) => void

  // Données filtrées
  orders: DashboardOrder[]
  compareOrders: DashboardOrder[]

  // Réinitialisation
  resetToDefault: () => void
  isDefault: boolean
}

/* ─────────────────────────────────────────
   Calcul des périodes depuis un preset
───────────────────────────────────────── */

function startOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function endOfDay(d: Date): Date {
  const r = new Date(d)
  r.setHours(23, 59, 59, 999)
  return r
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

// new Date('YYYY-MM-DD') parse en UTC → décalage heure locale.
// Ce helper crée la date en heure locale, comme tous les constructeurs new Date(y,m,d).
function parseLocalISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function resolvePreset(preset: PeriodPreset): DateRange {
  const today = startOfDay(new Date())
  const year  = today.getFullYear()
  const month = today.getMonth()

  switch (preset) {
    case 'last-7':
      return {
        start: startOfDay(addDays(today, -6)),
        end:   endOfDay(today),
      }
    case 'last-30':
      return {
        start: startOfDay(addDays(today, -29)),
        end:   endOfDay(today),
      }
    case 'last-12':
      return {
        start: startOfDay(addDays(today, -364)),
        end:   endOfDay(today),
      }
    case 'this-month':
      return {
        start: new Date(year, month, 1),
        end:   endOfDay(today),
      }
    case 'last-month': {
      const firstOfLast = new Date(year, month - 1, 1)
      const lastOfLast  = new Date(year, month, 0)      // 0 = dernier jour du mois précédent
      return {
        start: firstOfLast,
        end:   endOfDay(lastOfLast),
      }
    }
    case '3-months':
      return {
        start: startOfDay(addDays(today, -90)),
        end:   endOfDay(today),
      }
    case '6-months':
      return {
        start: startOfDay(addDays(today, -180)),
        end:   endOfDay(today),
      }
    case 'this-year':
      return {
        start: new Date(year, 0, 1),
        end:   endOfDay(today),
      }
    default:
      // 'custom' : appelant fournit les dates via customStart/End
      return {
        start: startOfDay(addDays(today, -30)),
        end:   endOfDay(today),
      }
  }
}

/* ─────────────────────────────────────────
   Calcul de la période de comparaison
───────────────────────────────────────── */

function resolveComparePeriod(
  mode: CompareMode,
  period: DateRange,
): DateRange | null {
  if (mode === 'none') return null

  if (mode === 'previous') {
    const durationMs = period.end.getTime() - period.start.getTime()
    const end   = new Date(period.start.getTime() - 1)           // veille du début
    const start = new Date(end.getTime() - durationMs)
    return { start, end }
  }

  if (mode === 'year-ago') {
    return {
      start: new Date(
        period.start.getFullYear() - 1,
        period.start.getMonth(),
        period.start.getDate(),
      ),
      end: new Date(
        period.end.getFullYear() - 1,
        period.end.getMonth(),
        period.end.getDate(),
        23, 59, 59, 999,
      ),
    }
  }

  // 'custom' : géré par l'appelant via customCompareStart/End
  return null
}

/* Les filtres de période sont volontairement éphémères : un rechargement
   revient toujours au tableau de bord par défaut. */
const LEGACY_STORAGE_KEY = 'flowdiff.periodFilter'

/* ─────────────────────────────────────────
   Hook principal
───────────────────────────────────────── */

export function usePeriodFilter(extraOrders?: DashboardOrder[]): UsePeriodFilterReturn {
  const today = new Date().toISOString().slice(0, 10)
  const monthAgo = addDays(new Date(), -30).toISOString().slice(0, 10)

  const [preset, _setPreset]               = useState<PeriodPreset>('last-30')
  const [compareMode, _setCompareMode]     = useState<CompareMode>('none')
  const [customStart, _setCustomStart]     = useState(monthAgo)
  const [customEnd, _setCustomEnd]         = useState(today)
  const [customCompareStart, _setCustomCompareStart] = useState(monthAgo)
  const [customCompareEnd, _setCustomCompareEnd]     = useState(today)

  // Nettoie la sélection persistée par les versions précédentes.
  useEffect(() => {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  }, [])

  const setPreset = useCallback((p: PeriodPreset) => {
    _setPreset(p)
  }, [])

  const setCompareMode = useCallback((m: CompareMode) => {
    _setCompareMode(m)
  }, [])

  const setCustomStart = useCallback((v: string) => {
    _setCustomStart(v)
  }, [])

  const setCustomEnd = useCallback((v: string) => {
    _setCustomEnd(v)
  }, [])

  const setCustomCompareStart = useCallback((v: string) => {
    _setCustomCompareStart(v)
  }, [])

  const setCustomCompareEnd = useCallback((v: string) => {
    _setCustomCompareEnd(v)
  }, [])

  // Résolution des plages de dates
  const period = useMemo<DateRange>(() => {
    if (preset === 'custom') {
      return {
        start: parseLocalISO(customStart),
        end:   endOfDay(parseLocalISO(customEnd)),
      }
    }
    return resolvePreset(preset)
  }, [preset, customStart, customEnd])

  const comparePeriod = useMemo<DateRange | null>(() => {
    if (compareMode === 'custom') {
      if (!customCompareStart || !customCompareEnd) return null
      return {
        start: parseLocalISO(customCompareStart),
        end:   endOfDay(parseLocalISO(customCompareEnd)),
      }
    }
    return resolveComparePeriod(compareMode, period)
  }, [compareMode, period, customCompareStart, customCompareEnd])

  // Fusion mock + commandes réelles
  const allOrders = useMemo(
    () => extraOrders && extraOrders.length > 0
      ? [...MOCK_DASHBOARD_ORDERS, ...extraOrders]
      : MOCK_DASHBOARD_ORDERS,
    [extraOrders],
  )

  // Filtrage des commandes
  const orders = useMemo(
    () => filterDataByPeriod(allOrders, period.start, period.end),
    [allOrders, period],
  )

  const compareOrders = useMemo(
    () => comparePeriod
      ? filterDataByPeriod(allOrders, comparePeriod.start, comparePeriod.end)
      : [],
    [allOrders, comparePeriod],
  )

  return {
    preset,
    setPreset,
    period,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,

    compareMode,
    setCompareMode,
    comparePeriod,
    customCompareStart,
    setCustomCompareStart,
    customCompareEnd,
    setCustomCompareEnd,

    orders,
    compareOrders,

    isDefault: preset === 'last-30' && compareMode === 'none',
    resetToDefault: useCallback(() => {
      const defaultStart = addDays(new Date(), -30).toISOString().slice(0, 10)
      const defaultEnd   = new Date().toISOString().slice(0, 10)
      _setPreset('last-30')
      _setCompareMode('none')
      _setCustomStart(defaultStart)
      _setCustomEnd(defaultEnd)
      _setCustomCompareStart(defaultStart)
      _setCustomCompareEnd(defaultEnd)
    }, []),
  }
}
