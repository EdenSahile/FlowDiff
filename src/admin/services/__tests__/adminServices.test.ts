import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '@/lib/supabase'
import { computeCAMois, computeTop5 } from '@/admin/services/adminServices'
import type { Commande } from '@/admin/types'

const mockCommandes: Commande[] = [
  {
    id: '1', code_client: 'LIB001', librairie: 'Test',
    date: new Date().toISOString(),
    statut: 'livre', montant_ht: 94.79, montant_ttc: 100.00,
    articles: [{ isbn: '123', titre: 'Livre A', quantite: 5, prix_ttc: 10 }],
  },
  {
    id: '2', code_client: 'LIB002', librairie: 'Test2',
    date: new Date().toISOString(),
    statut: 'annule', montant_ht: 47.39, montant_ttc: 50.00,
    articles: [{ isbn: '456', titre: 'Livre B', quantite: 3, prix_ttc: 10 }],
  },
  {
    id: '3', code_client: 'LIB003', librairie: 'Test3',
    date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(),
    statut: 'livre', montant_ht: 47.39, montant_ttc: 50.00,
    articles: [{ isbn: '123', titre: 'Livre A', quantite: 2, prix_ttc: 10 }],
  },
]

describe('computeCAMois', () => {
  it('sums TTC for current month, excludes annule', () => {
    expect(computeCAMois(mockCommandes)).toBe(100.00)
  })
})

describe('computeTop5', () => {
  it('aggregates quantities by isbn and sorts descending', () => {
    const top = computeTop5(mockCommandes)
    expect(top[0].isbn).toBe('123')
    expect(top[0].total).toBe(7) // 5 + 2
    expect(top[1].isbn).toBe('456')
    expect(top[1].total).toBe(3)
  })
})
