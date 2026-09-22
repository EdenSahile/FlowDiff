import { describe, it, expect, vi } from 'vitest'
import { STORAGE_VERSION, STORAGE_VERSION_KEY } from '@/contexts/OrdersContext'

/*
 * FLOW-RM-073 (cas no-op) : migrateStorage ne fait rien
 * quand STORAGE_VERSION est deja a jour.
 */

const ORDER_COUNTER_KEY = 'bookflow_order_counter'

vi.hoisted(() => {
  localStorage.clear()
  localStorage.setItem('bookflow_orders_LIB001', JSON.stringify([{ id: 'keep-this' }]))
  localStorage.setItem('bookflow_order_counter', '42')
  localStorage.setItem('bookflow_storage_version', '3')
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

describe('FLOW-RM-073 (no-op) : Migration storage version a jour', () => {

  it('conserve les commandes existantes', () => {
    expect(localStorage.getItem('bookflow_orders_LIB001')).toBe(
      JSON.stringify([{ id: 'keep-this' }]),
    )
  })

  it('conserve le compteur existant', () => {
    expect(localStorage.getItem(ORDER_COUNTER_KEY)).toBe('42')
  })

  it('conserve la version', () => {
    expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe(STORAGE_VERSION)
  })
})
