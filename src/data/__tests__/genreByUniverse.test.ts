import { describe, it, expect } from 'vitest'
import { GENRE_BY_UNIVERSE } from '../mockBooks'
import type { Universe } from '../mockBooks'

const expectedUniverses: Universe[] = ['Littérature', 'BD/Mangas', 'Jeunesse', 'Adulte-pratique']

describe('GENRE_BY_UNIVERSE', () => {
  it('contient les 4 univers comme cles', () => {
    const universeKeys = Object.keys(GENRE_BY_UNIVERSE)

    expect(universeKeys).toHaveLength(4)
    expectedUniverses.forEach(u => {
      expect(GENRE_BY_UNIVERSE).toHaveProperty(u)
    })
  })

  it('chaque univers a au moins 1 genre', () => {
    expectedUniverses.forEach(u => {
      expect(GENRE_BY_UNIVERSE[u].length).toBeGreaterThanOrEqual(1)
    })
  })

  it('aucun genre n\'est une chaine vide', () => {
    const allGenres = Object.values(GENRE_BY_UNIVERSE).flat()

    allGenres.forEach(genre => {
      expect(genre.trim()).not.toBe('')
    })
  })

  it('aucun genre n\'apparait dans plusieurs univers', () => {
    const genreToUniverse = new Map<string, string>()
    const duplicates: string[] = []

    for (const [universe, genres] of Object.entries(GENRE_BY_UNIVERSE)) {
      for (const genre of genres) {
        if (genreToUniverse.has(genre)) {
          duplicates.push(`"${genre}" dans "${genreToUniverse.get(genre)}" et "${universe}"`)
        }
        genreToUniverse.set(genre, universe)
      }
    }

    expect(duplicates).toEqual([])
  })
})
