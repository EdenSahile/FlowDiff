import type { BookType, StockStatut } from '@/data/mockBooks'

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
