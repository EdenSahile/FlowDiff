import type { Universe } from './mockBooks'

export type FlashCategory = 'Auteurs' | 'Fonds' | 'Nouveautés' | 'FlowDiff'

export interface FlashInfo {
  id: string
  title: string
  universe: Universe
  category: FlashCategory
  /** URL d'image ou null */
  imageUrl: string | null
  /** URL vidéo YouTube embed ou null */
  videoUrl: string | null
  text: string
  link?: string
  linkLabel?: string
  /** ISBN du livre associé (pour "Ajouter au panier" direct) */
  bookIsbn?: string
  /** ID du livre associé */
  bookId?: string
  date: string  // YYYY-MM-DD
}

export const MOCK_FLASH_INFOS: FlashInfo[] = [
  /* ─── BD/Mangas ─── */
  {
    id: 'fi-bd-01',
    title: 'Rencontre avec Riad Sattouf à Paris',
    universe: 'BD/Mangas',
    category: 'Auteurs',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Riad_Sattouf_%28cropped%29.jpg/320px-Riad_Sattouf_%28cropped%29.jpg',
    videoUrl: null,
    text: 'Riad Sattouf sera en dédicace à la librairie Mollat de Bordeaux le 15 mai. L\'occasion de faire signer les tomes de L\'Arabe du futur à vos clients. Anticipez votre commande !',
    link: 'https://www.mollat.com',
    linkLabel: 'Voir les détails',
    bookId: 'n-bd-03',
    bookIsbn: '9782370730220',
    date: '2026-04-10',
  },
  {
    id: 'fi-bd-02',
    title: 'Réimpression express — My Hero Academia T.1',
    universe: 'BD/Mangas',
    category: 'Fonds',
    imageUrl: null,
    videoUrl: null,
    text: 'Suite au succès de l\'anime saison 7, Glénat lance une réimpression massive du tome 1. Stock disponible sous 48h. Profitez de la remise fonds habituelle.',
    bookId: 'n-bd-02',
    bookIsbn: '9782344000656',
    date: '2026-04-08',
  },
  {
    id: 'fi-bd-03',
    title: 'Bande-annonce — Astérix T.40',
    universe: 'BD/Mangas',
    category: 'Nouveautés',
    imageUrl: null,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    text: 'Découvrez la bande-annonce officielle du prochain album Astérix. Parution prévue en octobre 2026. Précommandes ouvertes via votre représentant.',
    date: '2026-04-05',
  },
  {
    id: 'fi-bd-04',
    title: 'FlowDiff — Nouveau filtre par collection',
    universe: 'BD/Mangas',
    category: 'FlowDiff',
    imageUrl: null,
    videoUrl: null,
    text: 'Vous pouvez désormais filtrer le catalogue BD/Mangas par collection (Shōnen, Seinen, Album…). Retrouvez plus facilement les titres de vos collections phares.',
    date: '2026-04-01',
  },

  /* ─── Jeunesse ─── */
  {
    id: 'fi-jes-01',
    title: 'J.K. Rowling — interview exclusive',
    universe: 'Jeunesse',
    category: 'Auteurs',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/J._K._Rowling_2010.jpg/320px-J._K._Rowling_2010.jpg',
    videoUrl: null,
    text: 'Gallimard Jeunesse publie une longue interview de J.K. Rowling à l\'occasion des 25 ans d\'Harry Potter en France. Un bel outil de communication en librairie.',
    bookId: 'f-jes-01',
    bookIsbn: '9782070584628',
    date: '2026-04-12',
  },
  {
    id: 'fi-jes-02',
    title: 'Opération Folio Junior — 3 pour 2',
    universe: 'Jeunesse',
    category: 'Fonds',
    imageUrl: null,
    videoUrl: null,
    text: 'Gallimard Jeunesse lance une opération promotionnelle "3 achetés = 1 offert" sur toute la collection Folio Junior en mai. Commandez dès maintenant pour être prêts.',
    bookId: 'f-jes-02',
    bookIsbn: '9782070625734',
    date: '2026-04-07',
  },
  {
    id: 'fi-jes-03',
    title: 'Sélection Printemps Jeunesse',
    universe: 'Jeunesse',
    category: 'Nouveautés',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    videoUrl: null,
    text: 'La sélection de printemps Jeunesse est arrivée : 12 nouveaux titres pour les 8-12 ans. Livrets de présentation disponibles sur demande auprès de votre représentant.',
    date: '2026-04-03',
  },

  /* ─── Littérature ─── */
  {
    id: 'fi-lit-01',
    title: 'Hervé Le Tellier en tournée de signatures',
    universe: 'Littérature',
    category: 'Auteurs',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Herv%C3%A9_Le_Tellier_%28cropped%29.jpg/320px-Herv%C3%A9_Le_Tellier_%28cropped%29.jpg',
    videoUrl: null,
    text: 'L\'auteur de L\'Anomalie (Prix Goncourt 2020) est en tournée dans les librairies indépendantes en mai et juin. Demandez à votre représentant si votre région est couverte.',
    bookId: 'n-lit-01',
    bookIsbn: '9782072886447',
    date: '2026-04-11',
  },
  {
    id: 'fi-lit-02',
    title: 'L\'Étranger — nouvelle édition collector',
    universe: 'Littérature',
    category: 'Fonds',
    imageUrl: null,
    videoUrl: null,
    text: 'À l\'occasion des 80 ans de sa parution, Gallimard sort une édition collector de L\'Étranger avec une préface inédite et des reproductions de manuscrits. Disponible dès le 20 mai.',
    bookId: 'f-lit-01',
    bookIsbn: '9782070360024',
    date: '2026-04-09',
  },
  {
    id: 'fi-lit-03',
    title: 'Vidéo — Présentation Rentrée Littéraire 2026',
    universe: 'Littérature',
    category: 'Nouveautés',
    imageUrl: null,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    text: 'Gallimard, Actes Sud et Albin Michel présentent leurs coups de cœur pour la rentrée littéraire 2026. Une vidéo de 12 minutes pour briefer votre équipe.',
    date: '2026-04-06',
  },
  {
    id: 'fi-lit-04',
    title: 'FlowDiff — Export panier en PDF',
    universe: 'Littérature',
    category: 'FlowDiff',
    imageUrl: null,
    videoUrl: null,
    text: 'Nouvelle fonctionnalité : exportez votre bon de commande en PDF directement depuis le panier. Idéal pour vos archives ou pour l\'envoyer par email à votre équipe.',
    date: '2026-04-02',
  },

  /* ─── Adulte-pratique ─── */
  {
    id: 'fi-pra-01',
    title: 'Christophe Felder — masterclass en vidéo',
    universe: 'Adulte-pratique',
    category: 'Auteurs',
    imageUrl: null,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    text: 'La Martinière met à disposition des libraires une vidéo exclusive de Christophe Felder présentant les recettes phares de son ouvrage. Parfait pour animer votre espace pratique.',
    bookId: 'n-pra-01',
    bookIsbn: '9782812303067',
    date: '2026-04-10',
  },
  {
    id: 'fi-pra-02',
    title: 'Larousse — remise exceptionnelle fonds',
    universe: 'Adulte-pratique',
    category: 'Fonds',
    imageUrl: 'https://images.unsplash.com/photo-1465433360938-e02f97448763?w=400&q=80',
    videoUrl: null,
    text: 'Larousse offre une remise supplémentaire de 5% sur tous les titres Cuisine et Jardinage en mai. Commandez avant le 30 avril pour en bénéficier.',
    bookId: 'f-pra-01',
    bookIsbn: '9782011355737',
    date: '2026-04-04',
  },
  {
    id: 'fi-pra-03',
    title: 'Nouveautés Bien-être — Programme printemps',
    universe: 'Adulte-pratique',
    category: 'Nouveautés',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    videoUrl: null,
    text: 'Le programme Bien-être du printemps 2026 arrive : yoga, méditation, nutrition. 8 nouveaux titres chez Hachette Pratique, Marabout et Larousse. Catalogues disponibles.',
    date: '2026-04-02',
  },
]

export const FLASH_CATEGORIES: FlashCategory[] = ['Auteurs', 'Fonds', 'Nouveautés', 'FlowDiff']
