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
