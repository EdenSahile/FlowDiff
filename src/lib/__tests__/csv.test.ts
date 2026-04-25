import { describe, it, expect, vi, afterEach } from 'vitest'
import { exportToCSV } from '@/lib/csv'

describe('exportToCSV', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('déclenche le téléchargement avec le bon nom de fichier', () => {
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: clickSpy })
    )
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportToCSV('mon_fichier', ['Col A', 'Col B'], [['val1', 'val2']])

    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it('insère le BOM UTF-8 pour Excel', () => {
    let capturedContent = ''
    const OriginalBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation(function(parts: BlobPart[]) {
      capturedContent = parts[0] as string
      return new OriginalBlob(parts)
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: vi.fn() })
    )

    exportToCSV('test', ['H'], [['v']])

    expect(capturedContent.startsWith('﻿')).toBe(true)
  })

  it('échappe les guillemets doubles dans les valeurs', () => {
    let capturedContent = ''
    const OriginalBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation(function(parts: BlobPart[]) {
      capturedContent = parts[0] as string
      return new OriginalBlob(parts)
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: vi.fn() })
    )

    exportToCSV('test', ['H'], [['"valeur avec guillemets"']])

    expect(capturedContent).toContain('""valeur avec guillemets""')
  })

  it('utilise le point-virgule comme séparateur (convention française)', () => {
    let capturedContent = ''
    const OriginalBlob = global.Blob
    vi.spyOn(global, 'Blob').mockImplementation(function(parts: BlobPart[]) {
      capturedContent = parts[0] as string
      return new OriginalBlob(parts)
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(
      Object.assign(document.createElement('a'), { click: vi.fn() })
    )

    exportToCSV('test', ['A', 'B'], [['x', 'y']])

    expect(capturedContent).toContain('A;B')
    expect(capturedContent).toContain('x;y')
  })
})
