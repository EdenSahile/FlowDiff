import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MOCK_FLASH_INFOS } from '@/data/mockFlashInfos'
import { getCatalogueBookById } from '@/data/mockBooks'

describe('Flash Infos', () => {
  it('utilise uniquement des visuels locaux disponibles', () => {
    const imageUrls = MOCK_FLASH_INFOS
      .map(info => info.imageUrl)
      .filter((url): url is string => url !== null)

    expect(imageUrls).not.toHaveLength(0)
    imageUrls.forEach(url => {
      expect(url).toMatch(/^\/covers\/.+\.jpg$/)
      expect(existsSync(join(process.cwd(), 'public', url))).toBe(true)
    })
  })

  it('programme les actualités à partir de décembre 2026', () => {
    MOCK_FLASH_INFOS.forEach(info => {
      expect(info.date).toMatch(/^2026-12-(0[1-9]|[12][0-9]|3[01])$/)
    })
  })

  it('signale clairement les événements fictifs', () => {
    const events = MOCK_FLASH_INFOS.filter(info => info.category !== 'FlowDiff')

    expect(events).not.toHaveLength(0)
    expect(events.every(info => info.isFictionalEvent)).toBe(true)
  })

  it('n’associe pas de couverture aux informations FlowDiff', () => {
    const flowDiffInfos = MOCK_FLASH_INFOS.filter(info => info.category === 'FlowDiff')

    expect(flowDiffInfos).not.toHaveLength(0)
    expect(flowDiffInfos.every(info => info.imageUrl === null)).toBe(true)
  })

  it('associe chaque couverture de titre au livre affiché', () => {
    MOCK_FLASH_INFOS
      .filter((info): info is typeof info & { imageUrl: string; bookId: string; bookIsbn: string } =>
        Boolean(info.imageUrl && info.bookId && info.bookIsbn)
      )
      .forEach(info => {
        const book = getCatalogueBookById(info.bookId)
        expect(book?.isbn).toBe(info.bookIsbn)
        expect(info.imageUrl).toBe(`/covers/${info.bookIsbn}.jpg`)
      })
  })
})
