import { describe, it, expect } from 'vitest'
import {
  computeTotals, REMISE_RATES, getItemUnitPriceTTC, getItemRemiseRate, REMISE_NUMERIQUE,
} from '@/contexts/CartContext'
import type { CartItem, OPCartGroup, EbookCartOption } from '@/contexts/CartContext'

const rates = { 'Littérature': 0.09, 'BD/Mangas': 0.10, 'Jeunesse': 0.08, 'Adulte-pratique': 0.09 }

const ebookPdf: EbookCartOption = { isbn: '9789990030022', format: 'PDF', priceTTC: 9.99 }

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

describe('FLOW-RM-041 : remises par défaut par univers', () => {
  it('définit BD/Mangas à 30%, Jeunesse à 30%, Littérature à 35%, Adulte-pratique à 35%', () => {
    expect(REMISE_RATES).toStrictEqual({
      'BD/Mangas': 0.30,
      'Jeunesse': 0.30,
      'Littérature': 0.35,
      'Adulte-pratique': 0.35,
    })
  })
})

/*
  Une ligne numérique se facture au prix de son offre, pas à celui du papier.
  Les totaux lisaient le prix du livre, donc le récapitulatif contredisait le
  prix affiché sur la ligne.
*/
describe('prix public d\'une ligne de panier', () => {
  it('retient le prix du papier sur une ligne sans offre numérique', () => {
    const lignePapier = makeItem(20, 'Littérature')

    expect(getItemUnitPriceTTC(lignePapier)).toBe(20)
  })

  it('retient le prix de l\'offre sur une ligne numérique', () => {
    const ligneEbook = { ...makeItem(20, 'Littérature'), ebookOption: ebookPdf }

    expect(getItemUnitPriceTTC(ligneEbook)).toBe(9.99)
  })

  it('facture un ebook à son prix, pas à celui du grand format', () => {
    const ligneEbook = { ...makeItem(20, 'Littérature'), ebookOption: ebookPdf }

    const totals = computeTotals([ligneEbook], [], rates)

    expect(totals.subtotalTTC).toBeCloseTo(9.99)
  })

  it('compte la quantité au prix de l\'offre', () => {
    const ligneEbook = { ...makeItem(20, 'Littérature', 3), ebookOption: ebookPdf }

    const totals = computeTotals([ligneEbook], [], rates)

    expect(totals.subtotalTTC).toBeCloseTo(29.97)
  })

  it('assoit la remise sur le prix de l\'offre', () => {
    const ligneEbook = { ...makeItem(20, 'Littérature'), ebookOption: ebookPdf }

    const totals = computeTotals([ligneEbook], [], rates)

    expect(totals.remiseAmount).toBeCloseTo(9.99 * REMISE_NUMERIQUE)
  })

  /*
    Sur le papier, la remise varie par univers parce qu'elle rémunère le
    risque du libraire : stock acheté ferme, invendus, mise en place. Rien de
    tout cela n'existe sur un fichier, donc le numérique a un taux unique.
  */
  it('applique au numérique un taux unique, quel que soit l\'univers', () => {
    const ebookLitterature = { ...makeItem(20, 'Littérature'), ebookOption: ebookPdf }
    const ebookBD = { ...makeItem(20, 'BD/Mangas'), ebookOption: ebookPdf }

    const totalsLitterature = computeTotals([ebookLitterature], [], rates)
    const totalsBD = computeTotals([ebookBD], [], rates)

    expect(totalsLitterature.remiseAmount).toBeCloseTo(totalsBD.remiseAmount)
  })

  it('laisse le papier suivre le taux de son univers', () => {
    const papierLitterature = makeItem(20, 'Littérature')  // 9 %
    const papierBD = makeItem(20, 'BD/Mangas')             // 10 %

    const totalsLitterature = computeTotals([papierLitterature], [], rates)
    const totalsBD = computeTotals([papierBD], [], rates)

    expect(totalsLitterature.remiseAmount).toBeCloseTo(1.8)
    expect(totalsBD.remiseAmount).toBeCloseTo(2)
  })

  it('retient le taux du numérique sur une ligne numérique, celui de l\'univers sinon', () => {
    const lignePapier = makeItem(20, 'Littérature')
    const ligneEbook = { ...lignePapier, ebookOption: ebookPdf }

    expect(getItemRemiseRate(ligneEbook, rates)).toBe(REMISE_NUMERIQUE)
    expect(getItemRemiseRate(lignePapier, rates)).toBe(0.09)
  })

  it('additionne le papier et le numérique du même titre à leurs prix respectifs', () => {
    const lignePapier = makeItem(20, 'Littérature')
    const ligneEbook = { ...lignePapier, ebookOption: ebookPdf }

    const totals = computeTotals([lignePapier, ligneEbook], [], rates)

    expect(totals.subtotalTTC).toBeCloseTo(29.99)
  })
})

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

  it('ventile la TVA : taux réduit sur les ouvrages, taux normal sur la PLV', () => {
    const opAvecPLV: OPCartGroup = {
      id: 'op1', serieId: 's1', serieName: 'Tintin', opTitle: 'OP Test',
      opDescription: '', validUntil: undefined,
      books: [{ book: makeItem(10, 'BD/Mangas').book, quantity: 1 }],
      cadeau: { label: '', emoji: '', isbn: '', quantity: 0 },
      plv: { isbn: '', description: '', quantity: 1, pricePerUnit: 5 },
    }

    const totalsAvecPLV = computeTotals([], [opAvecPLV], rates)

    // Ouvrages : 10 TTC − 10% = 9 net, soit 8,53 HT et 0,47 de TVA à 5,5%.
    // PLV : 5 TTC non remisée, soit 4,17 HT et 0,83 de TVA à 20%.
    expect(totalsAvecPLV.netHT).toBeCloseTo(12.70, 2)
    expect(totalsAvecPLV.tva).toBeCloseTo(1.30, 2)
    expect(totalsAvecPLV.totalTTC).toBeCloseTo(14, 2)
  })

  it('garde le seul taux réduit quand le panier ne contient aucune PLV', () => {
    const opSansPLV: OPCartGroup = {
      id: 'op2', serieId: 's2', serieName: 'Tintin', opTitle: 'OP Test',
      opDescription: '', validUntil: undefined,
      books: [{ book: makeItem(10, 'BD/Mangas').book, quantity: 1 }],
      cadeau: { label: '', emoji: '', isbn: '', quantity: 0 },
      plv: { isbn: '', description: '', quantity: 0, pricePerUnit: 5 },
    }

    const totalsSansPLV = computeTotals([], [opSansPLV], rates)

    // 10 TTC − 10% = 9 net, intégralement au taux du livre.
    expect(totalsSansPLV.netHT).toBeCloseTo(9 / 1.055, 2)
    expect(totalsSansPLV.tva).toBeCloseTo(9 - 9 / 1.055, 2)
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

    // remiseAmount = somme des remises TTC ligne par ligne
    const attendu = 12.99 * 0.30 + 7.99 * 0.30 + 21.00 * 0.35 + 7.30 * 0.35
    expect(totals.remiseAmount).toBeCloseTo(attendu, 2)

    // Net HT = (subtotalTTC − remiseTTC) / 1,055 (remise appliquée sur HT)
    const netTTC = totals.subtotalTTC - totals.remiseAmount
    expect(totals.netHT).toBeCloseTo(netTTC / 1.055, 2)
  })
})
