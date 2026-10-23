import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  RETURN_REASON_LABELS,
  MOCK_RETURNS,
  type ReturnStatus,
  type CreateReturnPayload,
} from '@/data/mockReturns'
import { MOCK_ORDERS } from '@/data/mockOrders'

type ServiceModule = typeof import('@/services/returnsService')

function makePayload(codeClient: string): CreateReturnPayload {
  return {
    codeClient,
    orderId: 'ord-test',
    orderNumero: 'CMD-TEST-0001',
    items: [
      {
        orderItemIsbn: '9780000000000',
        title: 'Livre test',
        qty: 1,
        unitPrice: 10,
        reason: 'invendu',
      },
    ],
    notes: null,
  }
}

// --- Referentiels ---

describe('FLOW-RM-075 : motifs de retour', () => {
  it('contient exactement les 5 motifs attendus avec un libelle string non vide', () => {
    const expectedKeys = new Set([
      'invendu',
      'defaut_impression',
      'mauvaise_livraison',
      'doublon',
      'autre',
    ])

    const actualKeys = new Set(Object.keys(RETURN_REASON_LABELS))

    expect(actualKeys).toEqual(expectedKeys)
    for (const label of Object.values(RETURN_REASON_LABELS)) {
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    }
  })
})

describe('FLOW-RM-078 : statuts de retour', () => {
  const exhaustiveStatuses: Record<ReturnStatus, true> = {
    pending: true,
    in_transit: true,
    avoir_emis: true,
    refused: true,
  }
  const validStatusSet = new Set(Object.keys(exhaustiveStatuses))

  it('admet exactement 4 valeurs', () => {
    expect(validStatusSet.size).toBe(4)
  })

  it('tous les statuts de MOCK_RETURNS appartiennent a cet ensemble', () => {
    for (const ret of MOCK_RETURNS) {
      expect(validStatusSet.has(ret.status)).toBe(true)
    }
  })
})

// --- Creation ---

describe('FLOW-RM-077 : createReturn', () => {
  let service: ServiceModule

  beforeEach(async () => {
    vi.resetModules()
    service = await import('@/services/returnsService')
  })

  it('renvoie un retour pending avec les 5 champs de traitement a null', async () => {
    const payload = makePayload('TEST_077')

    const createdReturn = await service.createReturn(payload)

    expect(createdReturn.status).toBe('pending')
    expect(createdReturn.blNumber).toBeNull()
    expect(createdReturn.blGeneratedAt).toBeNull()
    expect(createdReturn.avoirAmount).toBeNull()
    expect(createdReturn.avoirGeneratedAt).toBeNull()
    expect(createdReturn.refusalReason).toBeNull()
  })

  it('le retour cree est visible via getReturns', async () => {
    const payload = makePayload('TEST_077_VIS')

    const createdReturn = await service.createReturn(payload)
    const returnsTEST077 = await service.getReturns('TEST_077_VIS')

    expect(returnsTEST077).toContainEqual(createdReturn)
  })
})

// --- Statistiques ---

describe('FLOW-RM-079 : returnRatio', () => {
  let service: ServiceModule

  beforeEach(async () => {
    vi.resetModules()
    service = await import('@/services/returnsService')
  })

  it('= nb retours / nb commandes pour un client avec des donnees', async () => {
    const nbRetoursLIB001 = MOCK_RETURNS.filter(r => r.codeClient === 'LIB001').length
    const nbCommandesLIB001 = MOCK_ORDERS.LIB001.length

    const statsLIB001 = await service.getReturnsStats('LIB001')

    expect(statsLIB001.returnRatio).toBe(nbRetoursLIB001 / nbCommandesLIB001)
  })

  it('vaut 0 quand le client a des retours mais aucune commande', async () => {
    await service.createReturn(makePayload('TEST_079_NO_CMD'))

    const statsSansCommande = await service.getReturnsStats('TEST_079_NO_CMD')

    expect(statsSansCommande.returnRatio).toBe(0)
  })
})

describe('FLOW-RM-080 : activeCount', () => {
  let service: ServiceModule

  beforeEach(async () => {
    vi.resetModules()
    service = await import('@/services/returnsService')
  })

  it('compte pending + in_transit, exclut avoir_emis et refused', async () => {
    // MOCK_RETURNS LIB001 : in_transit(1), avoir_emis(1), refused(1)
    // createReturn ajoute un pending pour exercer les 4 statuts
    await service.createReturn(makePayload('LIB001'))

    const statsLIB001 = await service.getReturnsStats('LIB001')

    expect(statsLIB001.activeCount).toBe(2)
  })
})

describe('FLOW-RM-081 : avoirYTD', () => {
  let service: ServiceModule

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15'))
    vi.resetModules()
    service = await import('@/services/returnsService')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('somme les avoirAmount dont avoirGeneratedAt tombe dans l\'annee courante', async () => {
    const statsLIB001 = await service.getReturnsStats('LIB001')

    expect(statsLIB001.avoirYTD).toBe(18.50)
  })

  it('exclut les avoirs d\'une autre annee', async () => {
    vi.setSystemTime(new Date('2026-06-15'))

    const statsLIB001en2026 = await service.getReturnsStats('LIB001')

    expect(statsLIB001en2026.avoirYTD).toBe(0)
  })
})

describe('FLOW-RM-082 : sectorAverage', () => {
  let service: ServiceModule

  beforeEach(async () => {
    vi.resetModules()
    service = await import('@/services/returnsService')
  })

  it('vaut 0.22 quel que soit le client', async () => {
    const statsLIB001 = await service.getReturnsStats('LIB001')
    const statsLIB002 = await service.getReturnsStats('LIB002')

    expect(statsLIB001.sectorAverage).toBe(0.22)
    expect(statsLIB002.sectorAverage).toBe(0.22)
  })
})

// --- Isolation ---

describe('FLOW-RM-083 : isolation par codeClient', () => {
  let service: ServiceModule

  beforeEach(async () => {
    vi.resetModules()
    service = await import('@/services/returnsService')
  })

  it('getReturns ne renvoie que les retours du client demande', async () => {
    await service.createReturn(makePayload('TEST_083_A'))

    const returnsLIB001 = await service.getReturns('LIB001')
    const returnsTEST083A = await service.getReturns('TEST_083_A')

    expect(returnsLIB001).toHaveLength(3)
    expect(returnsLIB001.every(r => r.codeClient === 'LIB001')).toBe(true)
    expect(returnsTEST083A).toHaveLength(1)
    expect(returnsTEST083A.every(r => r.codeClient === 'TEST_083_A')).toBe(true)
  })

  it('getReturnsStats isole les statistiques par client', async () => {
    await service.createReturn(makePayload('TEST_083_B'))
    await service.createReturn(makePayload('TEST_083_B'))

    const statsLIB001 = await service.getReturnsStats('LIB001')
    const statsTEST083B = await service.getReturnsStats('TEST_083_B')

    expect(statsLIB001.activeCount).toBe(1)
    expect(statsTEST083B.activeCount).toBe(2)
  })
})
