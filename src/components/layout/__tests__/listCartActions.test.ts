import { describe, it, expect } from 'vitest'
import type { Book } from '@/data/mockBooks'
import type { CartItem } from '@/contexts/CartContext'
import {
  needsNotedConfirmation,
  buildNotedMessage,
  buildAddedToCartMessage,
  isInCart,
} from '@/components/layout/listCartActions'

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-test-01',
    isbn: '9780000000001',
    title: 'Livre Test',
    authors: ['Auteur Test'],
    publisher: 'Editeur Test',
    universe: 'Littérature',
    type: 'fonds',
    price: 10,
    priceTTC: 10.55,
    format: 'Broché',
    publicationDate: '2024-01-01',
    description: 'Description test',
    ...overrides,
  }
}

const aParaitre = makeBook({ id: 'ap-01', title: 'Titre à paraître', type: 'a-paraitre' })
const nouveaute = makeBook({ id: 'n-01', title: 'Titre nouveauté', type: 'nouveaute' })
const fonds     = makeBook({ id: 'f-01', title: 'Titre de fonds', type: 'fonds' })

describe('needsNotedConfirmation', () => {
  it('demande une confirmation pour un titre à paraître seul', () => {
    expect(needsNotedConfirmation([aParaitre])).toBe(true)
  })

  it('n\'en demande pas pour une nouveauté ni pour un titre de fonds', () => {
    expect(needsNotedConfirmation([nouveaute])).toBe(false)
    expect(needsNotedConfirmation([fonds])).toBe(false)
  })

  it('en demande une dès qu\'un seul titre à paraître est dans le lot', () => {
    expect(needsNotedConfirmation([fonds, nouveaute, aParaitre])).toBe(true)
  })

  it('n\'en demande pas pour un lot sans titre à paraître', () => {
    expect(needsNotedConfirmation([fonds, nouveaute])).toBe(false)
  })

  it('n\'en demande pas pour une liste vide', () => {
    expect(needsNotedConfirmation([])).toBe(false)
  })
})

describe('buildNotedMessage', () => {
  it('parle du titre au singulier pour un ajout unitaire', () => {
    expect(buildNotedMessage([aParaitre])).toBe('Le titre sera enregistré en noté et conservé indéfiniment')
  })

  it('compte les titres notés, pas les titres du lot', () => {
    const lotAvecUnSeulNote = [fonds, nouveaute, aParaitre]

    expect(buildNotedMessage(lotAvecUnSeulNote))
      .toBe('1 titre de cette liste sera enregistré en noté et conservé indéfiniment')
  })

  it('accorde au pluriel à partir de 2 titres notés', () => {
    const lotAvecDeuxNotes = [fonds, aParaitre, makeBook({ id: 'ap-02', type: 'a-paraitre' })]

    expect(buildNotedMessage(lotAvecDeuxNotes))
      .toBe('2 titres de cette liste seront enregistrés en noté et conservés indéfiniment')
  })
})

describe('isInCart', () => {
  function makeCartItem(book: Book, overrides: Partial<CartItem> = {}): CartItem {
    return { book, quantity: 1, ...overrides }
  }

  it('reconnaît un titre présent au panier', () => {
    const cartWithFonds = [makeCartItem(fonds)]

    expect(isInCart(cartWithFonds, fonds.id)).toBe(true)
  })

  it('ne reconnaît pas un titre absent du panier', () => {
    const cartWithFonds = [makeCartItem(fonds)]

    expect(isInCart(cartWithFonds, nouveaute.id)).toBe(false)
  })

  it('renvoie faux pour un panier vide', () => {
    expect(isInCart([], fonds.id)).toBe(false)
  })

  it('reconnaît un titre à paraître comme n\'importe quel autre', () => {
    const cartWithAParaitre = [makeCartItem(aParaitre)]

    expect(isInCart(cartWithAParaitre, aParaitre.id)).toBe(true)
  })

  it('reconnaît le titre quelle que soit sa quantité au panier', () => {
    const cartWithThreeCopies = [makeCartItem(fonds, { quantity: 3 })]

    expect(isInCart(cartWithThreeCopies, fonds.id)).toBe(true)
  })

  it('reconnaît un titre commandé en ebook, dont la ligne de panier porte une clé distincte', () => {
    const cartWithEbookLine = [makeCartItem(fonds, {
      ebookOption: { hebergeur: 'Numilog', format: 'EPUB', price: 9.99, isbnEbook: '9780000000009' },
    })]

    expect(isInCart(cartWithEbookLine, fonds.id)).toBe(true)
  })
})

describe('buildAddedToCartMessage', () => {
  it('nomme le titre pour un ajout unitaire', () => {
    expect(buildAddedToCartMessage([fonds])).toBe('"Titre de fonds" ajouté au panier')
  })

  it('compte les titres pour un ajout groupé', () => {
    expect(buildAddedToCartMessage([fonds, nouveaute, aParaitre])).toBe('3 titres ajoutés au panier')
  })
})
