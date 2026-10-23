import { describe, it, expect, vi, afterEach } from 'vitest'
import { exportToCSV } from '@/lib/csv'

/**
 * `exportToCSV` ne renvoie rien : elle construit un Blob et déclenche un clic.
 * Ce helper espionne le constructeur Blob et l'ancre pour rendre observables
 * le contenu produit et le nom du fichier téléchargé.
 */
function captureExport(filename: string, headers: string[], rows: (string | number)[][]) {
  const anchor = Object.assign(document.createElement('a'), { click: vi.fn() })
  const OriginalBlob = global.Blob
  let content = ''

  vi.spyOn(global, 'Blob').mockImplementation(function(parts?: BlobPart[]) {
    content = (parts?.[0] ?? '') as string
    return new OriginalBlob(parts)
  })
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.spyOn(document, 'createElement').mockReturnValue(anchor)

  exportToCSV(filename, headers, rows)

  return { content, downloadName: anchor.download, click: anchor.click }
}

describe('exportToCSV', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('déclenche le téléchargement', () => {
    const { click } = captureExport('mon_fichier', ['Col A', 'Col B'], [['val1', 'val2']])

    expect(click).toHaveBeenCalledOnce()
  })

  /* FLOW-RM-123 */
  it('insère le BOM UTF-8 pour Excel', () => {
    const { content } = captureExport('test', ['H'], [['v']])

    expect(content.startsWith('﻿')).toBe(true)
  })

  /* FLOW-RM-124 */
  it('utilise le point-virgule comme séparateur (convention française)', () => {
    const { content } = captureExport('test', ['A', 'B'], [['x', 'y']])

    expect(content).toContain('A;B')
    expect(content).toContain('x;y')
  })

  it('sépare les lignes par un CRLF', () => {
    const { content } = captureExport('test', ['A'], [['x'], ['y']])

    expect(content).toBe('﻿A\r\nx\r\ny')
  })

  /* FLOW-RM-125 */
  it('échappe les guillemets doubles dans les valeurs', () => {
    const { content } = captureExport('test', ['H'], [['"valeur avec guillemets"']])

    expect(content).toContain('""valeur avec guillemets""')
  })

  it('entoure de guillemets une valeur contenant le séparateur', () => {
    const { content } = captureExport('test', ['H'], [['Éditions Famille; Compagnie']])

    expect(content).toContain('"Éditions Famille; Compagnie"')
  })

  it('entoure de guillemets une valeur contenant un retour à la ligne', () => {
    const { content } = captureExport('test', ['H'], [['ligne 1\nligne 2']])

    expect(content).toContain('"ligne 1\nligne 2"')
  })

  it('laisse une valeur ordinaire sans guillemets', () => {
    const { content } = captureExport('test', ['H'], [['Gallimard']])

    expect(content).toBe('﻿H\r\nGallimard')
  })

  it('écrit les nombres sans guillemets', () => {
    const { content } = captureExport('test', ['Prix'], [[12.5]])

    expect(content).toBe('﻿Prix\r\n12.5')
  })

  it('ajoute l\'extension .csv au nom de fichier quand elle manque', () => {
    const { downloadName } = captureExport('mon_fichier', ['H'], [['v']])

    expect(downloadName).toBe('mon_fichier.csv')
  })

  it('n\'ajoute pas une 2e extension si le nom se termine déjà par .csv', () => {
    const { downloadName } = captureExport('mon_fichier.csv', ['H'], [['v']])

    expect(downloadName).toBe('mon_fichier.csv')
  })

  it('exporte les en-têtes seuls quand il n\'y a aucune ligne', () => {
    const { content } = captureExport('test', ['A', 'B'], [])

    expect(content).toBe('﻿A;B')
  })
})
