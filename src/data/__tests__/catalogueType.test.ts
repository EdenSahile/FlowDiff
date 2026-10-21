import { describe, expect, it } from 'vitest'
import { getCatalogueType } from '../catalogueType'
import { getCatalogueBooks } from '../mockBooks'

describe('getCatalogueType', () => {
  const referenceDate = new Date('2026-10-21T12:00:00')

  it('classe une parution future dans les titres à paraître', () => {
    expect(getCatalogueType('2026-10-22', referenceDate)).toBe('a-paraitre')
  })

  it('classe une parution récente dans les nouveautés', () => {
    expect(getCatalogueType('2026-10-21', referenceDate)).toBe('nouveaute')
  })

  it('conserve une parution au jour exact de ses 6 mois dans les nouveautés', () => {
    expect(getCatalogueType('2026-04-21', referenceDate)).toBe('nouveaute')
  })

  it('classe une parution de plus de 6 mois dans les fonds', () => {
    expect(getCatalogueType('2026-04-20', referenceDate)).toBe('fonds')
  })

  it('charge un programme de relève quand aucun titre daté ne reste à paraître', () => {
    const catalogue = getCatalogueBooks(new Date('2027-08-01T12:00:00'))
    const titles = catalogue.filter(book => book.type === 'a-paraitre')

    expect(titles).toHaveLength(5)
    expect(titles.every(book => book.id.startsWith('rolling-ap-'))).toBe(true)
    expect(titles.every(book => book.publicationDate > '2027-08-01')).toBe(true)
  })
})
