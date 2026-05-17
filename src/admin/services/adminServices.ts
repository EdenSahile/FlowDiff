import { supabase } from '@/lib/supabase'
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

/* ── Supabase queries ── */

export async function getAllCommandes(): Promise<Commande[]> {
  const { data, error } = await supabase
    .from('commandes')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Commande[]
}

export async function updateCommandeStatut(id: string, statut: StatutCommande): Promise<void> {
  const { error } = await supabase.from('commandes').update({ statut }).eq('id', id)
  if (error) throw error
}

export async function getAllLibraires(): Promise<Libraire[]> {
  const { data, error } = await supabase
    .from('libraires')
    .select('*')
    .order('code_client', { ascending: true })
  if (error) throw error
  return (data ?? []) as Libraire[]
}

export async function updateLibraire(id: string, data: Partial<Libraire>): Promise<void> {
  const { error } = await supabase.from('libraires').update(data).eq('id', id)
  if (error) throw error
}

export async function addLivre(data: LivreInsert): Promise<void> {
  const { error } = await supabase.from('livres').insert([data])
  if (error) throw error
}

export async function updateLivre(id: string, data: Partial<LivreInsert>): Promise<void> {
  const { error } = await supabase.from('livres').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteLivre(id: string): Promise<void> {
  const { error } = await supabase.from('livres').delete().eq('id', id)
  if (error) throw error
}

export async function countLivres(): Promise<number> {
  const { count, error } = await supabase.from('livres').select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}
