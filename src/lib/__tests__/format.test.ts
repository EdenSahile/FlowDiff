import { describe, expect, it } from 'vitest'
import { formatPrice, roundCurrency } from '@/lib/format'

describe('formatPrice', () => {
  it('arrondit les demi-centimes au centime supérieur avant affichage', () => {
    const netPrice = 21.9 * (1 - 0.35)

    expect(roundCurrency(netPrice)).toBe(14.24)
    expect(formatPrice(netPrice)).toBe('14,24')
  })
})
