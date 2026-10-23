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

  /* FLOW-RM-127 : un panier relu d'un ancien localStorage peut n'avoir aucune des 2 clés */
  it('défaut à [] si opGroups est absent', () => {
    const cartWithoutOpGroups = { items: [] }

    const parsedCart = storedCartSchema.safeParse(cartWithoutOpGroups)

    expect(parsedCart.success).toBe(true)
    if (parsedCart.success) expect(parsedCart.data.opGroups).toEqual([])
  })

  it('défaut à [] pour les 2 clés si le panier stocké est vide', () => {
    const emptyCart = {}

    const parsedCart = storedCartSchema.safeParse(emptyCart)

    expect(parsedCart.success).toBe(true)
    if (parsedCart.success) expect(parsedCart.data).toEqual({ items: [], opGroups: [] })
  })

  it('conserve les champs du livre autres que son id', () => {
    const cartWithFullBook = { items: [{ book: { id: 'b1', title: 'Dandadan', isbn: '9782380713384' }, quantity: 2 }], opGroups: [] }

    const parsedCart = storedCartSchema.safeParse(cartWithFullBook)

    expect(parsedCart.success).toBe(true)
    if (parsedCart.success) expect(parsedCart.data.items[0].book).toEqual({ id: 'b1', title: 'Dandadan', isbn: '9782380713384' })
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
    const { id: _id, ...rest } = validOrder // eslint-disable-line @typescript-eslint/no-unused-vars
    expect(storedOrdersSchema.safeParse([rest]).success).toBe(false)
  })

  it('accepte les statuts valides : expédié et livré', () => {
    expect(storedOrdersSchema.safeParse([{ ...validOrder, status: 'expédié' }]).success).toBe(true)
    expect(storedOrdersSchema.safeParse([{ ...validOrder, status: 'livré' }]).success).toBe(true)
  })

  /* FLOW-RM-128 : transmissionMode et ediStatus sont optionnels mais contraints quand ils sont là */
  it('accepte les 2 modes de transmission', () => {
    expect(storedOrdersSchema.safeParse([{ ...validOrder, transmissionMode: 'FLOWDIFF' }]).success).toBe(true)
    expect(storedOrdersSchema.safeParse([{ ...validOrder, transmissionMode: 'EDI' }]).success).toBe(true)
  })

  it('refuse un mode de transmission inconnu', () => {
    const orderWithUnknownTransmission = [{ ...validOrder, transmissionMode: 'FAX' }]

    expect(storedOrdersSchema.safeParse(orderWithUnknownTransmission).success).toBe(false)
  })

  it('accepte les 4 statuts EDI', () => {
    for (const ediStatus of ['PENDING', 'SENT', 'ACK', 'ERROR']) {
      expect(storedOrdersSchema.safeParse([{ ...validOrder, ediStatus }]).success).toBe(true)
    }
  })

  it('refuse un statut EDI inconnu', () => {
    const orderWithUnknownEdiStatus = [{ ...validOrder, ediStatus: 'RECU' }]

    expect(storedOrdersSchema.safeParse(orderWithUnknownEdiStatus).success).toBe(false)
  })

  it('refuse une commande seule, hors tableau', () => {
    expect(storedOrdersSchema.safeParse(validOrder).success).toBe(false)
  })

  it('refuse un montant passé en chaîne de caractères', () => {
    const orderWithStringTotal = [{ ...validOrder, totalTTC: '94.95' }]

    expect(storedOrdersSchema.safeParse(orderWithStringTotal).success).toBe(false)
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...rest } = validList
    expect(storedWishlistsSchema.safeParse([rest]).success).toBe(false)
  })

  it('refuse une liste sans name', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name: _name, ...rest } = validList
    expect(storedWishlistsSchema.safeParse([rest]).success).toBe(false)
  })

  it('refuse une liste sans createdAt', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt: _ca, ...rest } = validList
    expect(storedWishlistsSchema.safeParse([rest]).success).toBe(false)
  })

  it('accepte des items inconnus dans la liste (passthrough)', () => {
    const data = [{ ...validList, items: [{ book: { id: 'b1' }, addedAt: '2024-01-15T10:00:00.000Z' }] }]
    expect(storedWishlistsSchema.safeParse(data).success).toBe(true)
  })

  /* FLOW-RM-129 : les 4 champs du type Wishlist traversent la relecture sans perte */
  it('conserve les 4 champs d\'une liste et le détail de ses items', () => {
    const listWithOneItem = [{
      ...validList,
      items: [{ book: { id: 'b1', title: 'Dandadan' }, addedAt: '2024-01-15T10:00:00.000Z' }],
    }]

    const parsedLists = storedWishlistsSchema.safeParse(listWithOneItem)

    expect(parsedLists.success).toBe(true)
    if (parsedLists.success) expect(parsedLists.data[0]).toEqual(listWithOneItem[0])
  })

  it('refuse une liste sans items', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { items: _items, ...rest } = validList

    expect(storedWishlistsSchema.safeParse([rest]).success).toBe(false)
  })

  it('refuse une liste seule, hors tableau', () => {
    expect(storedWishlistsSchema.safeParse(validList).success).toBe(false)
  })

  it('refuse un nom de liste non textuel', () => {
    const listWithNumericName = [{ ...validList, name: 42 }]

    expect(storedWishlistsSchema.safeParse(listWithNumericName).success).toBe(false)
  })
})
