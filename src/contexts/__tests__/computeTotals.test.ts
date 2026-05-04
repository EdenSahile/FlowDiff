import { describe, it, expect } from 'vitest'
import { computeTotals } from '@/contexts/CartContext'
import type { CartItem, OPCartGroup } from '@/contexts/CartContext'

const rates = { 'Littérature': 0.09, 'BD/Mangas': 0.10, 'Jeunesse': 0.08, 'Adulte-pratique': 0.09 }

function makeItem(priceTTC: number, universe: string, quantity = 1): CartItem {
  return {
    quantity,
    book: {
      id: 'b1', isbn: '0000000000000', title: 'Test', authors: [],
      publisher: 'Ed', universe: universe as CartItem['book']['universe'],
      type: 'fonds', price: priceTTC / 1.055, priceTTC,
      format: 'Poche', publicationDate: '2024-01-01', description: '',
    },
  }
}

describe('computeTotals', () => {
  it('retourne des zéros pour un panier vide', () => {
    const totals = computeTotals([], [], rates)
    expect(totals.subtotalTTC).toBe(0)
    expect(totals.remiseAmount).toBe(0)
    expect(totals.netHT).toBe(0)
    expect(totals.tva).toBe(0)
    expect(totals.totalTTC).toBe(0)
  })

  it('calcule la remise par univers correctement', () => {
    const items = [makeItem(10, 'Littérature')]   // remise 9%
    const totals = computeTotals(items, [], rates)
    expect(totals.subtotalTTC).toBeCloseTo(10)
    expect(totals.remiseAmount).toBeCloseTo(0.9)  // 10 × 9%
  })

  it('applique des taux différents par univers', () => {
    const items = [makeItem(10, 'BD/Mangas')]     // remise 10%
    const totals = computeTotals(items, [], rates)
    expect(totals.remiseAmount).toBeCloseTo(1)    // 10 × 10%
  })

  it('extrait la TVA à 5,5% du net TTC', () => {
    const items = [makeItem(10.55, 'Littérature')]
    const totals = computeTotals(items, [], rates)
    const netTTC = totals.totalTTC
    expect(totals.netHT).toBeCloseTo(netTTC / 1.055, 2)
    expect(totals.tva).toBeCloseTo(netTTC - netTTC / 1.055, 2)
  })

  it('cumule plusieurs articles', () => {
    const items = [makeItem(10, 'Littérature', 2), makeItem(5, 'BD/Mangas', 1)]
    const totals = computeTotals(items, [], rates)
    expect(totals.subtotalTTC).toBeCloseTo(25)
    expect(totals.remiseAmount).toBeCloseTo(2 * 10 * 0.09 + 5 * 0.10)
  })

  it('applique la remise sur les ouvrages OP mais pas sur la PLV', () => {
    const op: OPCartGroup = {
      id: 'op1', serieId: 's1', serieName: 'Tintin', opTitle: 'OP Test',
      opDescription: '', validUntil: undefined,
      books: [{ book: makeItem(10, 'BD/Mangas').book, quantity: 1 }],
      cadeau: { label: '', emoji: '', isbn: '', quantity: 0 },
      plv: { isbn: '', description: '', quantity: 1, pricePerUnit: 5 },
    }
    const totals = computeTotals([], [op], rates)
    expect(totals.subtotalTTC).toBeCloseTo(15)       // 10 livres + 5 PLV
    expect(totals.remiseAmount).toBeCloseTo(1)        // 10 × 10% seulement (pas la PLV)
  })

  it('retourne totalTTC = netTTC (la TVA est extraite, pas ajoutée)', () => {
    const items = [makeItem(20, 'Jeunesse')]
    const totals = computeTotals(items, [], rates)
    expect(totals.totalTTC).toBeCloseTo(totals.netHT + totals.tva, 5)
  })

  it('récap 4 articles réels — remiseAmount est la somme TTC des remises ligne par ligne', () => {
    const cartRates = { 'BD/Mangas': 0.30, 'Littérature': 0.35, 'Jeunesse': 0.30, 'Adulte-pratique': 0.35 }
    const items = [
      makeItem(12.99, 'BD/Mangas'),   // Le Lotus Bleu
      makeItem(7.99,  'BD/Mangas'),   // Kaguya-sama
      makeItem(21.00, 'Littérature'), // L'Anomalie
      makeItem(7.30,  'Littérature'), // L'Étranger
    ]
    const totals = computeTotals(items, [], cartRates)

    // remiseAmount = somme des remises TTC ligne par ligne (pas divisée par 1,055)
    const attendu = 12.99 * 0.30 + 7.99 * 0.30 + 21.00 * 0.35 + 7.30 * 0.35
    expect(totals.remiseAmount).toBeCloseTo(attendu, 2)

    // la version HT (actuellement affichée à tort) serait différente
    expect(totals.remiseAmount).not.toBeCloseTo(attendu / 1.055, 2)

    // Net HT = (subtotalTTC - remiseAmount) / 1,055
    const netTTC = totals.subtotalTTC - totals.remiseAmount
    expect(totals.netHT).toBeCloseTo(netTTC / 1.055, 2)
  })
})
