import type { Universe } from '@/data/mockBooks'

export interface Selection {
  id: string
  titre: string
  description?: string
  univers: Universe | 'Tous'
  isOffreSpeciale?: boolean
  bookIds: string[]
}

export const MOCK_SELECTIONS: Selection[] = [
  {
    id: 'sel-nos-heros',
    titre: 'Nos héros',
    description: 'Les séries cultes qui font la BD',
    univers: 'BD/Mangas',
    isOffreSpeciale: true,
    bookIds: ['f-bd-01', 'f-bd-02', 'n-bd-02', 'n-bd-03'],
  },
  {
    id: 'sel-manga',
    titre: 'Manga no Kuni',
    description: 'Le meilleur du manga en ce moment',
    univers: 'BD/Mangas',
    isOffreSpeciale: true,
    bookIds: ['n-bd-01', 'n-bd-02', 'n-bd-03'],
  },
  {
    id: 'sel-rentree',
    titre: 'Rentrée scolaire',
    description: 'Les incontournables pour les jeunes lecteurs',
    univers: 'Jeunesse',
    bookIds: ['f-jes-01', 'f-jes-02', 'n-jes-01', 'n-jes-02'],
  },
  {
    id: 'sel-saint-valentin',
    titre: 'Saint-Valentin',
    description: 'Offrir un livre, c\'est offrir un monde',
    univers: 'Littérature',
    isOffreSpeciale: true,
    bookIds: ['n-lit-02', 'n-lit-01', 'f-lit-02', 'n-lit-03'],
  },
  {
    id: 'sel-fetes-meres',
    titre: 'Fêtes des mères',
    description: 'Idées cadeaux pour toutes les mamans',
    univers: 'Adulte-pratique',
    isOffreSpeciale: true,
    bookIds: ['n-pra-01', 'f-pra-01', 'f-pra-02', 'n-pra-02'],
  },
  {
    id: 'sel-classiques',
    titre: 'Grands classiques',
    description: 'Les piliers de la littérature à avoir en rayon',
    univers: 'Littérature',
    bookIds: ['f-lit-01', 'f-lit-02', 'f-lit-03', 'n-lit-01', 'n-lit-03'],
  },
  {
    id: 'sel-bien-etre',
    titre: 'Bien-être & corps',
    description: 'Prendre soin de soi au quotidien',
    univers: 'Adulte-pratique',
    bookIds: ['f-pra-02', 'n-pra-01', 'n-pra-02'],
  },
]
