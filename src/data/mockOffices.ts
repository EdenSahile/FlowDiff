import type { Universe } from './mockBooks'

export interface OfficeBook {
  isbn: string
  title: string
  authors: string[]
  publisher: string
  universe: Universe
  priceTTC: number
  publicationDate: string
  proposedQty: number
  coverUrl?: string
}

export interface Office {
  id: string
  label: string
  year: number
  mois: string
  dateEnvoi: string
  dateLimiteMod: string
  daysLeft: number
  parutionDebut: string
  parutionFin: string
  books: OfficeBook[]
}

export const MOCK_OFFICES: Office[] = [
  {
    id: 'OFFICE-2026-06',
    label: 'Office de juin 2026',
    year: 2026,
    mois: 'juin',
    dateEnvoi: '22 avril 2026',
    dateLimiteMod: '13 mai 2026',
    daysLeft: 21,
    parutionDebut: '5 juin',
    parutionFin: '18 juin 2026',
    books: [
      // BD/Mangas
      { isbn: '9782864975069', title: 'Astérix T.39 – Astérix et le Griffon', authors: ['Fabcaro', 'Didier Conrad'], publisher: 'Les Éditions Albert René', universe: 'BD/Mangas', priceTTC: 9.99, publicationDate: '2026-06-12', proposedQty: 6 },
      { isbn: '9782368279816', title: 'Mortelle Adèle T.22 – Show bizarre !', authors: ['Mr. Tan', 'Diane Le Feyer'], publisher: 'Tourbillon', universe: 'BD/Mangas', priceTTC: 6.95, publicationDate: '2026-06-18', proposedQty: 3 },
      { isbn: '9782344057285', title: 'One Piece T.107', authors: ['Eiichiro Oda'], publisher: 'Glénat', universe: 'BD/Mangas', priceTTC: 7.45, publicationDate: '2026-06-05', proposedQty: 5 },
      // Littérature
      { isbn: '9782213725659', title: 'Triste Tigre', authors: ['Neige Sinno'], publisher: 'P.O.L.', universe: 'Littérature', priceTTC: 19.00, publicationDate: '2026-06-05', proposedQty: 4 },
      { isbn: '9782072839375', title: 'La porte du voyage sans retour', authors: ['David Diop'], publisher: 'Éditions du Seuil', universe: 'Littérature', priceTTC: 17.00, publicationDate: '2026-06-10', proposedQty: 2 },
      { isbn: '9782072914019', title: "L'Anomalie", authors: ['Hervé Le Tellier'], publisher: 'Gallimard', universe: 'Littérature', priceTTC: 20.50, publicationDate: '2026-06-15', proposedQty: 3 },
      // Jeunesse
      { isbn: '9782016281963', title: 'Percy Jackson T.7 – La malédiction du titan', authors: ['Rick Riordan'], publisher: 'Disney Hachette', universe: 'Jeunesse', priceTTC: 14.95, publicationDate: '2026-06-08', proposedQty: 5 },
      { isbn: '9782016290131', title: 'La Cabane Magique T.50 – Voyage dans la galaxie', authors: ['Mary Pope Osborne'], publisher: 'Bayard Jeunesse', universe: 'Jeunesse', priceTTC: 8.90, publicationDate: '2026-06-14', proposedQty: 4 },
      { isbn: '9782017076513', title: "Journal d'un Dégonflé T.20 – Double zéro", authors: ['Jeff Kinney'], publisher: 'Seuil Jeunesse', universe: 'Jeunesse', priceTTC: 12.90, publicationDate: '2026-06-18', proposedQty: 8 },
      // Adulte-pratique
      { isbn: '9782501168892', title: 'Le Yoga pour tous – Programme complet 12 semaines', authors: ['Christine Lefèvre'], publisher: 'Marabout', universe: 'Adulte-pratique', priceTTC: 22.90, publicationDate: '2026-06-12', proposedQty: 4 },
      { isbn: '9782501182041', title: 'Méditation en 30 jours – Méthode guidée', authors: ['Karine Doyon'], publisher: 'Marabout', universe: 'Adulte-pratique', priceTTC: 16.50, publicationDate: '2026-06-08', proposedQty: 3 },
    ],
  },
]

export const CURRENT_OFFICE = MOCK_OFFICES[0]
