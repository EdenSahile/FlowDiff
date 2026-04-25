import { describe, it, expect } from 'vitest'
import { getReturnsStats, getReturns, createReturn } from '@/services/returnsService'

describe('getReturnsStats', () => {
  it('retourne activeCount >= 1 pour LIB001 (au moins 1 retour in_transit)', async () => {
    const stats = await getReturnsStats('LIB001')
    expect(stats.activeCount).toBeGreaterThanOrEqual(1)
  })

  it('retourne avoirYTD = 0 pour une librairie sans retours', async () => {
    const stats = await getReturnsStats('LIB999')
    expect(stats.avoirYTD).toBe(0)
  })

  it('retourne sectorAverage = 0.22', async () => {
    const stats = await getReturnsStats('LIB001')
    expect(stats.sectorAverage).toBe(0.22)
  })

  it('returnRatio = 0 pour une librairie sans commandes ni retours', async () => {
    const stats = await getReturnsStats('LIB999')
    expect(stats.returnRatio).toBe(0)
  })
})

describe('createReturn', () => {
  it("crée un retour avec status pending et l'ajoute à la liste", async () => {
    const before = await getReturns('LIB002')
    await createReturn({
      codeClient: 'LIB002',
      orderId: 'ord-007',
      orderNumero: 'CMD-2024-0633',
      items: [{ orderItemIsbn: '9782070360024', title: "L'Étranger", qty: 1, unitPrice: 4.90, reason: 'invendu' }],
      notes: null,
    })
    const after = await getReturns('LIB002')
    expect(after.length).toBe(before.length + 1)
    expect(after[after.length - 1].status).toBe('pending')
  })
})
