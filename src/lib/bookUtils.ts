import type { BookType, StockStatut } from '@/data/mockBooks'
import type { TypeCommande } from '@/data/mockOrders'

const TYPE_COMMANDE_BY_BOOK_TYPE: Record<BookType, TypeCommande> = {
  'a-paraitre': 'A paraître',
  'nouveaute':  'Nouveauté',
  'fonds':      'Fonds',
}

export function getTypeCommande(type: BookType): TypeCommande {
  return TYPE_COMMANDE_BY_BOOK_TYPE[type]
}

export function getPurchaseAvailability(type: BookType, statut?: StockStatut) {
  const isAParaitre = type === 'a-paraitre'
  const isEpuise = statut === 'epuise' || statut === 'rupture'

  return {
    isAParaitre,
    isEpuise,
    needsConfirm: statut === 'sur_commande' || statut === 'en_reimp',
    canAddToCart: !isEpuise,
    showStandardOrder: !isAParaitre && !isEpuise,
  }
}
