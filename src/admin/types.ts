export interface ArticleCommande {
  isbn: string
  titre: string
  quantite: number
  prix_ttc: number
}

export type StatutCommande = 'en_preparation' | 'expedie' | 'livre' | 'annule'
export type StatutLibraire = 'actif' | 'bloque'

export interface Commande {
  id: string
  code_client: string
  librairie: string
  date: string
  statut: StatutCommande
  montant_ht: number
  montant_ttc: number
  articles: ArticleCommande[]
}

export interface Libraire {
  id: string
  code_client: string
  nom: string
  email: string
  ville: string
  telephone: string | null
  remise: number
  statut: StatutLibraire
  reliquat: boolean
  created_at: string
}

export interface LivreInsert {
  title: string
  authors: string[]
  isbn: string
  publisher: string
  collection?: string
  universe: string
  type: string
  price: number
  priceTTC: number
  format: string
  genre?: string
  pages?: number
  publicationDate: string
  description: string
  statut?: string
}
