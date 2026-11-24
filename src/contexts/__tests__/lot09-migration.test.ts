import { describe, it, expect, vi } from 'vitest'
import { STORAGE_VERSION, STORAGE_VERSION_KEY } from '@/contexts/OrdersContext'

/*
 * FLOW-RM-073 : migrateStorage efface les commandes et reinitialise
 * le compteur quand STORAGE_VERSION change.
 *
 * migrateStorage() s'execute au chargement du module OrdersContext.
 * On utilise vi.hoisted() pour remplir localStorage AVANT l'import,
 * ce qui force la migration a tourner avec une ancienne version.
 */

const ORDER_COUNTER_KEY = 'flowdiff_order_counter'

vi.hoisted(() => {
  localStorage.clear()
  localStorage.setItem('flowdiff_orders_LIB001', JSON.stringify([{ id: 'old-order-1' }]))
  localStorage.setItem('flowdiff_orders_LIB002', JSON.stringify([{ id: 'old-order-2' }]))
  localStorage.setItem('flowdiff_order_counter', '42')
  localStorage.setItem('flowdiff_storage_version', 'OLD_VERSION')
  localStorage.setItem('flowdiff_other_key', 'should_persist')
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuthContext: vi.fn(),
}))

describe('FLOW-RM-073 : Migration storage', () => {

  it('efface les cles flowdiff_orders_* quand STORAGE_VERSION change', () => {
    expect(localStorage.getItem('flowdiff_orders_LIB001')).toBeNull()
    expect(localStorage.getItem('flowdiff_orders_LIB002')).toBeNull()
  })

  it('reinitialise le compteur a 14', () => {
    expect(localStorage.getItem(ORDER_COUNTER_KEY)).toBe('14')
  })

  it('met a jour STORAGE_VERSION a la version courante', () => {
    expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe(STORAGE_VERSION)
  })

  it('ne touche pas aux cles qui ne commencent pas par flowdiff_orders_', () => {
    expect(localStorage.getItem('flowdiff_other_key')).toBe('should_persist')
  })
})
