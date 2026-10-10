import type { Commande, Libraire, LivreInsert, StatutCommande } from '@/admin/types'

/* ── Pure helpers (exported for tests) ── */

export function computeCAMois(commandes: Commande[]): number {
  const now = new Date()
  return commandes
    .filter(c => {
      if (c.statut === 'annule') return false
      const d = new Date(c.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, c) => sum + c.montant_ttc, 0)
}

export function computeTop5(commandes: Commande[]): { isbn: string; titre: string; total: number }[] {
  const map: Record<string, { isbn: string; titre: string; total: number }> = {}
  for (const cmd of commandes) {
    for (const art of cmd.articles) {
      if (!map[art.isbn]) map[art.isbn] = { isbn: art.isbn, titre: art.titre, total: 0 }
      map[art.isbn].total += art.quantite
    }
  }
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5)
}

/* ── Accès aux données ──
   Le projet n'a plus de backend : le catalogue libraire lit MOCK_BOOKS.
   Ces fonctions conservent leur signature pour que les écrans admin
   compilent, mais elles échouent si on les appelle. Les écrans qui les
   utilisent ne sont plus routés, donc rien ne les atteint. */

function noBackend(operation: string): never {
  throw new Error(`[admin] ${operation} indisponible, le projet n'a pas de backend.`)
}

export async function getAllCommandes(): Promise<Commande[]> {
  noBackend('lecture des commandes')
}

export async function updateCommandeStatut(_id: string, _statut: StatutCommande): Promise<void> {
  noBackend('mise à jour du statut de commande')
}

export async function getAllLibraires(): Promise<Libraire[]> {
  noBackend('lecture des libraires')
}

export async function updateLibraire(_id: string, _data: Partial<Libraire>): Promise<void> {
  noBackend('mise à jour d\'un libraire')
}

export async function addLivre(_data: LivreInsert): Promise<void> {
  noBackend('création d\'un livre')
}

export async function updateLivre(_id: string, _data: Partial<LivreInsert>): Promise<void> {
  noBackend('mise à jour d\'un livre')
}

export async function deleteLivre(_id: string): Promise<void> {
  noBackend('suppression d\'un livre')
}

export async function countLivres(): Promise<number> {
  noBackend('comptage des livres')
}
