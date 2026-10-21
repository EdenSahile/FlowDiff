import { describe, expect, it } from 'vitest'
import { MOCK_FACTURES } from '@/data/mockFactures'

describe('MOCK_FACTURES', () => {
  it('affiche un éditeur renseigné pour chaque ligne de facture', () => {
    const lines = Object.values(MOCK_FACTURES).flatMap(factures =>
      factures.flatMap(facture => facture.lignes),
    )

    expect(lines).not.toHaveLength(0)
    expect(lines.every(line => !/^Éditeur \d+$/.test(line.editeur))).toBe(true)
  })
})
