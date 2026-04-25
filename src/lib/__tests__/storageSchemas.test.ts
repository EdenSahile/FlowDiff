import { describe, it, expect } from 'vitest'
import { storedCartSchema, storedOrdersSchema, storedWishlistsSchema } from '@/lib/storageSchemas'

/* ── storedCartSchema ── */
describe('storedCartSchema', () => {
  it('accepte un panier valide avec items et opGroups', () => {
    const data = {
      items: [{ book: { id: 'b1' }, quantity: 2 }],
      opGroups: [],
    }
    expect(storedCartSchema.safeParse(data).success).toBe(true)
  })

  it('défaut à [] si items est absent', () => {
    const result = storedCartSchema.safeParse({ opGroups: [] })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.items).toEqual([])
  })

  it('refuse un item sans book.id', () => {
    const data = { items: [{ book: {}, quantity: 1 }], opGroups: [] }
    expect(storedCartSchema.safeParse(data).success).toBe(false)
  })

  it('refuse une quantité à 0', () => {
    const data = { items: [{ book: { id: 'b1' }, quantity: 0 }], opGroups: [] }
    expect(storedCartSchema.safeParse(data).success).toBe(false)
  })

  it('refuse une quantité négative', () => {
    const data = { items: [{ book: { id: 'b1' }, quantity: -1 }], opGroups: [] }
    expect(storedCartSchema.safeParse(data).success).toBe(false)
  })

  it('refuse une quantité non entière', () => {
    const data = { items: [{ book: { id: 'b1' }, quantity: 1.5 }], opGroups: [] }
    expect(storedCartSchema.safeParse(data).success).toBe(false)
  })

  it('passe les propriétés supplémentaires (passthrough)', () => {
    const data = { items: [], opGroups: [], extra: 'ignored' }
    expect(storedCartSchema.safeParse(data).success).toBe(true)
  })
})

/* ── storedOrdersSchema ── */
describe('storedOrdersSchema', () => {
  const validOrder = {
    id: 'ord-1',
    numero: 'CMD-2024-1234',
    date: '2024-01-15',
    status: 'en préparation' as const,
    items: [],
    subtotalHT: 100,
    remiseAmount: 10,
    netHT: 90,
    tva: 4.95,
    totalTTC: 94.95,
    adresseLivraison: '1 rue de la Paix, Paris',
    codeClient: 'LIB001',
    deliveryMode: 'standard' as const,
  }

  it('accepte un tableau vide', () => {
    expect(storedOrdersSchema.safeParse([]).success).toBe(true)
  })

  it('accepte une commande valide', () => {
    expect(storedOrdersSchema.safeParse([validOrder]).success).toBe(true)
  })

  it('refuse un statut inconnu', () => {
    const data = [{ ...validOrder, status: 'annulé' }]
    expect(storedOrdersSchema.safeParse(data).success).toBe(false)
  })

  it('refuse un deliveryMode inconnu', () => {
    const data = [{ ...validOrder, deliveryMode: 'express' }]
    expect(storedOrdersSchema.safeParse(data).success).toBe(false)
  })

  it('refuse une commande sans id', () => {
    const { id: _id, ...rest } = validOrder
    expect(storedOrdersSchema.safeParse([rest]).success).toBe(false)
  })

  it('accepte les statuts valides : expédié et livré', () => {
    expect(storedOrdersSchema.safeParse([{ ...validOrder, status: 'expédié' }]).success).toBe(true)
    expect(storedOrdersSchema.safeParse([{ ...validOrder, status: 'livré' }]).success).toBe(true)
  })
})

/* ── storedWishlistsSchema ── */
describe('storedWishlistsSchema', () => {
  const validList = {
    id: 'wl-1',
    name: 'Ma liste',
    items: [],
    createdAt: '2024-01-15T10:00:00.000Z',
  }

  it('accepte un tableau vide', () => {
    expect(storedWishlistsSchema.safeParse([]).success).toBe(true)
  })

  it('accepte une liste valide', () => {
    expect(storedWishlistsSchema.safeParse([validList]).success).toBe(true)
  })

  it('refuse une liste sans id', () => {
    const { id: _id, ...rest } = validList
    expect(storedWishlistsSchema.safeParse([rest]).success).toBe(false)
  })

  it('refuse une liste sans name', () => {
    const { name: _name, ...rest } = validList
    expect(storedWishlistsSchema.safeParse([rest]).success).toBe(false)
  })

  it('refuse une liste sans createdAt', () => {
    const { createdAt: _ca, ...rest } = validList
    expect(storedWishlistsSchema.safeParse([rest]).success).toBe(false)
  })

  it('accepte des items inconnus dans la liste (passthrough)', () => {
    const data = [{ ...validList, items: [{ book: { id: 'b1' }, addedAt: '2024-01-15T10:00:00.000Z' }] }]
    expect(storedWishlistsSchema.safeParse(data).success).toBe(true)
  })
})
