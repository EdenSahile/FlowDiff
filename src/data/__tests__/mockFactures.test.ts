import { describe, expect, it } from 'vitest'
import { MOCK_FACTURES } from '@/data/mockFactures'

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

const allFactures = Object.values(MOCK_FACTURES).flat()
const allLignes = allFactures.flatMap(f => f.lignes)

describe('MOCK_FACTURES', () => {
  it('affiche un éditeur renseigné pour chaque ligne de facture', () => {
    const lines = Object.values(MOCK_FACTURES).flatMap(factures =>
      factures.flatMap(facture => facture.lignes),
    )

    expect(lines).not.toHaveLength(0)
    expect(lines.every(line => !/^Éditeur \d+$/.test(line.editeur))).toBe(true)
  })
})

/* ─────────────────────────────────────────────────
   FLOW-RM-116 : calcul remise facture
   puHT = ppHT × (1 − remisePct / 100)
─────────────────────────────────────────────────── */

describe('FLOW-RM-116 : calcul remise facture', () => {
  it('puHT = ppHT × (1 − remisePct / 100) arrondi à 2 décimales', () => {
    const lignesAvecRemise = allLignes.filter(l => l.remisePct > 0)

    expect(lignesAvecRemise.length).toBeGreaterThan(0)
    lignesAvecRemise.forEach(ligne => {
      const expectedPuHT = round2(ligne.ppHT * (1 - ligne.remisePct / 100))

      expect(ligne.puHT).toBe(expectedPuHT)
    })
  })

  it('puHT = ppHT quand la remise est à 0', () => {
    const lignesSansRemise = allLignes.filter(l => l.remisePct === 0)

    expect(lignesSansRemise.length).toBeGreaterThan(0)
    lignesSansRemise.forEach(ligne => {
      expect(ligne.puHT).toBe(ligne.ppHT)
    })
  })

  it('montantHT = puHT × quantité pour chaque ligne', () => {
    allLignes.forEach(ligne => {
      const expectedMontantHT = round2(ligne.puHT * ligne.quantite)

      expect(ligne.montantHT).toBe(expectedMontantHT)
    })
  })
})

/* ─────────────────────────────────────────────────
   FLOW-RM-117 : TVA 5,5 % sur les factures
─────────────────────────────────────────────────── */

describe('FLOW-RM-117 : TVA 5,5 % sur les factures', () => {
  it('le taux de TVA est toujours 5,5 %', () => {
    allFactures.forEach(facture => {
      expect(facture.tauxTVA).toBe(5.5)
    })
  })

  it('montantTVA = netHT × 5,5 / 100 arrondi à 2 décimales', () => {
    allFactures.forEach(facture => {
      const expectedTVA = round2(facture.netHT * 5.5 / 100)

      expect(facture.montantTVA).toBe(expectedTVA)
    })
  })

  it('totalTTC = netHT + montantTVA', () => {
    allFactures.forEach(facture => {
      const expectedTTC = round2(facture.netHT + facture.montantTVA)

      expect(facture.totalTTC).toBe(expectedTTC)
    })
  })
})

/* ─────────────────────────────────────────────────
   Totaux de facture cohérents
─────────────────────────────────────────────────── */

describe('Totaux de facture', () => {
  it('totalBrutHT = somme(ppHT × quantité)', () => {
    allFactures.forEach(facture => {
      const expectedBrutHT = round2(facture.lignes.reduce((s, l) => s + l.ppHT * l.quantite, 0))

      expect(facture.totalBrutHT).toBe(expectedBrutHT)
    })
  })

  it('netHT = somme(montantHT)', () => {
    allFactures.forEach(facture => {
      const expectedNetHT = round2(facture.lignes.reduce((s, l) => s + l.montantHT, 0))

      expect(facture.netHT).toBe(expectedNetHT)
    })
  })

  it('remiseMontant = totalBrutHT − netHT', () => {
    allFactures.forEach(facture => {
      const expectedRemiseMontant = round2(facture.totalBrutHT - facture.netHT)

      expect(facture.remiseMontant).toBe(expectedRemiseMontant)
    })
  })
})

/* ─────────────────────────────────────────────────
   Remise par univers (taux réels du compte LIB001)
─────────────────────────────────────────────────── */

describe('Remise par univers', () => {
  // Taux réels LIB001 (spec : remisesParUnivers dans src/lib/mockUsers.ts)
  const remiseAttendueParUnivers: Record<string, number> = {
    'Littérature':     35,
    'Adulte-pratique': 35,
    'BD/Mangas':       30,
    'Jeunesse':        30,
  }

  it('chaque ligne porte le taux de son univers, ou 0 pour une commande spéciale', () => {
    allLignes.forEach(ligne => {
      const tauxUnivers = remiseAttendueParUnivers[ligne.univers]

      expect([tauxUnivers, 0]).toContain(ligne.remisePct)
    })
  })

  it('aucune ligne ne porte un ancien taux arbitraire (5 %, 7 %, 9 %)', () => {
    const lignesTauxArbitraire = allLignes.filter(l => [5, 7, 9].includes(l.remisePct))

    expect(lignesTauxArbitraire).toEqual([])
  })
})

/* ─────────────────────────────────────────────────
   Factures récentes 2026
─────────────────────────────────────────────────── */

describe('Factures récentes', () => {
  it('contient des factures émises à partir de mai 2026', () => {
    const facturesRecentes = allFactures.filter(f => f.date >= '2026-05-01')

    expect(facturesRecentes.length).toBeGreaterThanOrEqual(3)
  })
})
