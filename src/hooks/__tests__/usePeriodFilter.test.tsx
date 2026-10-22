import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePeriodFilter } from '@/hooks/usePeriodFilter'
import type { DashboardOrder } from '@/data/mockDashboard'

const januaryOrders: DashboardOrder[] = [
  {
    id: 'jan-2026', orderId: 'jan-2026', date: '2026-01-12', montantTTC: 42,
    nbExemplaires: 2, publisher: 'Gallimard', universe: 'Littérature',
    cancelled: false, deliveryDays: 2, references: ['9780000000001'], items: [],
  },
  {
    id: 'jan-2025', orderId: 'jan-2025', date: '2025-01-12', montantTTC: 36,
    nbExemplaires: 2, publisher: 'Gallimard', universe: 'Littérature',
    cancelled: false, deliveryDays: 2, references: ['9780000000002'], items: [],
  },
]

describe('usePeriodFilter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('applique une période personnalisée et compare la même période à N-1', () => {
    const { result } = renderHook(() => usePeriodFilter(januaryOrders))

    act(() => {
      result.current.setPreset('custom')
      result.current.setCustomStart('2026-01-01')
      result.current.setCustomEnd('2026-01-31')
      result.current.setCompareMode('year-ago')
    })

    expect(result.current.period.start.getFullYear()).toBe(2026)
    expect(result.current.period.start.getMonth()).toBe(0)
    expect(result.current.period.end.getDate()).toBe(31)
    expect(result.current.orders.length).toBeGreaterThan(0)
    expect(result.current.comparePeriod?.start.getFullYear()).toBe(2025)
    expect(result.current.compareOrders.length).toBeGreaterThan(0)
  })

  it('réinitialise la période et la comparaison à leur état par défaut', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => {
      result.current.setPreset('custom')
      result.current.setCompareMode('year-ago')
      result.current.resetToDefault()
    })

    expect(result.current.preset).toBe('last-30')
    expect(result.current.compareMode).toBe('none')
    expect(result.current.isDefault).toBe(true)
  })
})

/* ─────────────────────────────────────────────────
   FLOW-RM-109 : presets de période et modes de
   comparaison
─────────────────────────────────────────────────── */

describe('FLOW-RM-109 : presets de période', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('last-7 couvre les 7 derniers jours', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => result.current.setPreset('last-7'))

    const today = new Date()
    const sixDaysAgo = new Date(today)
    sixDaysAgo.setDate(today.getDate() - 6)

    expect(result.current.period.start.toDateString()).toBe(sixDaysAgo.toDateString())
    expect(result.current.period.end.toDateString()).toBe(today.toDateString())
  })

  it('this-month commence le 1er du mois courant', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => result.current.setPreset('this-month'))

    const today = new Date()

    expect(result.current.period.start.getDate()).toBe(1)
    expect(result.current.period.start.getMonth()).toBe(today.getMonth())
    expect(result.current.period.end.toDateString()).toBe(today.toDateString())
  })

  it('last-month couvre tout le mois précédent', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => result.current.setPreset('last-month'))

    const today = new Date()
    const expectedMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1
    const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate()

    expect(result.current.period.start.getDate()).toBe(1)
    expect(result.current.period.start.getMonth()).toBe(expectedMonth)
    expect(result.current.period.end.getDate()).toBe(lastDayOfPrevMonth)
  })

  it('this-year commence le 1er janvier de l\'année courante', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => result.current.setPreset('this-year'))

    const today = new Date()

    expect(result.current.period.start.getFullYear()).toBe(today.getFullYear())
    expect(result.current.period.start.getMonth()).toBe(0)
    expect(result.current.period.start.getDate()).toBe(1)
    expect(result.current.period.end.toDateString()).toBe(today.toDateString())
  })
})

describe('FLOW-RM-109 : modes de comparaison', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('previous donne une période de même durée juste avant la principale', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => {
      result.current.setPreset('last-7')
      result.current.setCompareMode('previous')
    })

    const mainDurationMs = result.current.period.end.getTime() - result.current.period.start.getTime()
    const compareDurationMs = result.current.comparePeriod!.end.getTime() - result.current.comparePeriod!.start.getTime()

    expect(compareDurationMs).toBe(mainDurationMs)
    expect(result.current.comparePeriod!.end.getTime()).toBeLessThan(result.current.period.start.getTime())
  })

  it('none ne produit pas de période de comparaison', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => result.current.setCompareMode('none'))

    expect(result.current.comparePeriod).toBeNull()
    expect(result.current.compareOrders).toEqual([])
  })

  it('custom utilise les dates de comparaison fournies', () => {
    const { result } = renderHook(() => usePeriodFilter())

    act(() => {
      result.current.setCompareMode('custom')
      result.current.setCustomCompareStart('2025-06-01')
      result.current.setCustomCompareEnd('2025-06-30')
    })

    expect(result.current.comparePeriod?.start.getFullYear()).toBe(2025)
    expect(result.current.comparePeriod?.start.getMonth()).toBe(5)
    expect(result.current.comparePeriod?.start.getDate()).toBe(1)
    expect(result.current.comparePeriod?.end.getMonth()).toBe(5)
    expect(result.current.comparePeriod?.end.getDate()).toBe(30)
  })
})
