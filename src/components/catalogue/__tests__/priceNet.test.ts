import { describe, it, expect } from 'vitest'

function computePriceNet(priceTTC: number, rate: number): string {
  return (priceTTC * (1 - rate)).toFixed(2)
}

describe('PriceNet calculation', () => {
  it('applique une remise de 30%', () => {
    expect(computePriceNet(20, 0.30)).toBe('14.00')
  })

  it('sans remise retourne le prix TTC', () => {
    expect(computePriceNet(15.50, 0)).toBe('15.50')
  })

  it('remise 33% sur 18.99', () => {
    expect(computePriceNet(18.99, 0.33)).toBe('12.72')
  })
})
