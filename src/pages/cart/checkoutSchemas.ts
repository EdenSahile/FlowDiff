import { z } from 'zod'

export type TransmissionMode = 'FLOWDIFF' | 'EDI'

export const transmissionSchema = z.object({
  transmissionMode: z.enum(['FLOWDIFF', 'EDI']),
})

// trim avant les contrôles : Zod applique les étapes dans l'ordre d'écriture, et une
// adresse faite d'espaces passait `min(1)` avant de partir vide dans la commande
export const addressSchema = z.object({
  rue:        z.string().trim().min(1, 'L\'adresse est requise'),
  codePostal: z.string().trim().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  ville:      z.string().trim().min(1, 'La ville est requise'),
})

export type AddressData = z.infer<typeof addressSchema>

export function parseAddressString(flat: string): AddressData {
  if (!flat.trim()) return { rue: '', codePostal: '', ville: '' }
  // Expected format: "12 rue du Parc, 75001 Paris"
  const match = flat.match(/^(.+),\s*(\d{5})\s+(.+)$/)
  if (!match) return { rue: flat, codePostal: '', ville: '' }
  return { rue: match[1].trim(), codePostal: match[2], ville: match[3].trim() }
}
