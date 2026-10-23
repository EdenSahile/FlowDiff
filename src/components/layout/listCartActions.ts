import type { Book } from '@/data/mockBooks'
import type { CartItem } from '@/contexts/CartContext'

/*
  Règles d'ajout au panier depuis une liste de commande (DEC-001).

  Un titre à paraître est enregistré en « noté » : le libraire doit en être
  informé avant l'ajout. Un ajout groupé qui contient au moins un titre à
  paraître affiche donc la pop-in une fois, pas une par titre.
*/

export function needsNotedConfirmation(books: Book[]): boolean {
  return books.some(book => book.type === 'a-paraitre')
}

export function buildNotedMessage(books: Book[]): string {
  if (books.length === 1) {
    return 'Le titre sera enregistré en noté et conservé indéfiniment'
  }

  const nbNoted = books.filter(book => book.type === 'a-paraitre').length
  return nbNoted === 1
    ? '1 titre de cette liste sera enregistré en noté et conservé indéfiniment'
    : `${nbNoted} titres de cette liste seront enregistrés en noté et conservés indéfiniment`
}

/*
  Une liste de commande est permanente, le panier non : la mention « au panier »
  se lit sur le contenu réel du panier, pas sur un ajout passé. Retirer le titre
  du panier fait donc disparaître la mention.

  La comparaison porte sur book.id, pas sur la clé de panier : un même titre
  commandé en papier et en ebook occupe 2 lignes de panier, la liste n'en
  affiche qu'une.
*/
export function isInCart(items: CartItem[], bookId: string): boolean {
  return items.some(item => item.book.id === bookId)
}

export function buildAddedToCartMessage(books: Book[]): string {
  return books.length === 1
    ? `"${books[0].title}" ajouté au panier`
    : `${books.length} titres ajoutés au panier`
}
