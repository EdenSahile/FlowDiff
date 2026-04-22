import { describe, it, expect } from 'vitest'
import { getTooltipText } from '@/components/ui/StockStatus'

describe('getTooltipText', () => {
  it('retourne null pour disponible', () => {
    expect(getTooltipText('disponible', undefined)).toBeNull()
  })

  it('retourne null pour stock_limite', () => {
    expect(getTooltipText('stock_limite', undefined)).toBeNull()
  })

  it('retourne null pour epuise', () => {
    expect(getTooltipText('epuise', undefined)).toBeNull()
  })

  it('retourne le message sur_commande', () => {
    expect(getTooltipText('sur_commande', undefined)).toBe(
      "Commandé spécialement auprès de l'éditeur — délai 7 à 15 jours ouvrés"
    )
  })

  it('retourne le délai quand delaiReimp est fourni', () => {
    expect(getTooltipText('en_reimp', '2 semaines')).toBe('Délai prévu : 2 semaines')
  })

  it('retourne "Délai non communiqué" si pas de delaiReimp', () => {
    expect(getTooltipText('en_reimp', undefined)).toBe('Délai non communiqué')
  })
})
