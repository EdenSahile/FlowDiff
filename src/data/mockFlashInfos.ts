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
  /** Événement de démonstration, identifié comme tel dans l'interface */
  isFictionalEvent?: boolean
  /** ISBN du livre associé (pour "Ajouter au panier" direct) */
  bookIsbn?: string
  /** ID du livre associé */
  bookId?: string
  date: string  // YYYY-MM-DD
}

function getDecemberDate(day: number): string {
  return `2026-12-${String(day).padStart(2, '0')}`
}

export const MOCK_FLASH_INFOS: FlashInfo[] = [
  /* ─── BD/Mangas ─── */
  {
    id: 'fi-bd-01',
    title: 'Rencontre autour de L’Atelier des nuages',
    universe: 'BD/Mangas',
    category: 'Auteurs',
    imageUrl: '/covers/9789990001002.jpg',
    videoUrl: null,
    text: 'Événement fictif : découvrez l’univers graphique de L’Atelier des nuages et préparez une rencontre en librairie avec votre représentant.',
    bookId: 'ap-bd-02',
    bookIsbn: '9789990001002',
    isFictionalEvent: true,
    date: getDecemberDate(2),
  },
  {
    id: 'fi-bd-02',
    title: 'Blue Box T.1 — réimpression express',
    universe: 'BD/Mangas',
    category: 'Fonds',
    imageUrl: '/covers/9782413054580.jpg',
    videoUrl: null,
    text: 'Événement fictif : Blue Box T.1 est de nouveau disponible. Stock réapprovisionné et remise fonds habituelle appliquée.',
    bookId: 'n-bd-02',
    bookIsbn: '9782413054580',
    isFictionalEvent: true,
    date: getDecemberDate(4),
  },
  {
    id: 'fi-bd-03',
    title: 'Bande-annonce — Astérix T.40',
    universe: 'BD/Mangas',
    category: 'Nouveautés',
    imageUrl: null,
    videoUrl: 'https://www.youtube.com/embed/dk5G5eByLJo',
    text: 'Événement fictif : découvrez la bande-annonce d’Astérix T.40. Les précommandes sont ouvertes auprès de votre représentant.',
    link: 'https://www.youtube.com/watch?v=dk5G5eByLJo',
    linkLabel: 'Voir sur YouTube',
    isFictionalEvent: true,
    date: getDecemberDate(6),
  },
  {
    id: 'fi-bd-04',
    title: 'FlowDiff — Nouveau filtre par collection',
    universe: 'BD/Mangas',
    category: 'FlowDiff',
    imageUrl: null,
    videoUrl: null,
    text: 'Vous pouvez désormais filtrer le catalogue BD/Mangas par collection (Shōnen, Seinen, Album…). Retrouvez plus facilement les titres de vos collections phares.',
    date: getDecemberDate(8),
  },

  /* ─── Jeunesse ─── */
  {
    id: 'fi-jes-01',
    title: 'J.K. Rowling — dossier Les Animaux fantastiques',
    universe: 'Jeunesse',
    category: 'Auteurs',
    imageUrl: '/covers/9782075128582.jpg',
    videoUrl: null,
    text: 'Événement fictif : un dossier J.K. Rowling accompagne Les Animaux fantastiques pour vos mises en avant jeunesse.',
    bookId: 'f-jes-animaux',
    bookIsbn: '9782075128582',
    isFictionalEvent: true,
    date: getDecemberDate(3),
  },
  {
    id: 'fi-jes-02',
    title: 'La Carte des lucioles — précommandes',
    universe: 'Jeunesse',
    category: 'Nouveautés',
    imageUrl: '/covers/9789990001003.jpg',
    videoUrl: null,
    text: 'Événement fictif : préparez vos tables d’automne avec La Carte des lucioles, disponible à la précommande.',
    bookId: 'ap-jes-02',
    bookIsbn: '9789990001003',
    isFictionalEvent: true,
    date: getDecemberDate(5),
  },
  {
    id: 'fi-jes-03',
    title: 'La Passe-Miroir — sélection Jeunesse d’automne',
    universe: 'Jeunesse',
    category: 'Nouveautés',
    imageUrl: '/covers/9782075164252.jpg',
    videoUrl: null,
    text: 'Événement fictif : La Passe-Miroir rejoint la sélection Jeunesse d’automne, avec un livret de présentation sur demande.',
    bookId: 'n-jes-02',
    bookIsbn: '9782075164252',
    isFictionalEvent: true,
    date: getDecemberDate(7),
  },

  /* ─── Littérature ─── */
  {
    id: 'fi-lit-01',
    title: 'Kamel Daoud en tournée de signatures',
    universe: 'Littérature',
    category: 'Auteurs',
    imageUrl: '/covers/9782258210271.jpg',
    videoUrl: null,
    text: 'Événement fictif : Kamel Daoud est en tournée dans les librairies indépendantes. Demandez à votre représentant si votre région est couverte.',
    bookId: 'n-lit-01',
    bookIsbn: '9782258210271',
    isFictionalEvent: true,
    date: getDecemberDate(1),
  },
  {
    id: 'fi-lit-02',
    title: 'Leurs enfants après eux — édition collector',
    universe: 'Littérature',
    category: 'Fonds',
    imageUrl: '/covers/9782330108724.jpg',
    videoUrl: null,
    text: 'Événement fictif : une édition collector de Leurs enfants après eux rejoint la sélection de fonds pour vos tables et vitrines.',
    bookId: 'f-lit-mathieu',
    bookIsbn: '9782330108724',
    isFictionalEvent: true,
    date: getDecemberDate(3),
  },
  {
    id: 'fi-lit-03',
    title: 'Vidéo — Présentation Rentrée Littéraire 2026',
    universe: 'Littérature',
    category: 'Nouveautés',
    imageUrl: null,
    videoUrl: 'https://www.youtube.com/embed/dk5G5eByLJo',
    text: 'Événement fictif : cette vidéo présente une sélection de rentrée littéraire pour briefer votre équipe.',
    link: 'https://www.youtube.com/watch?v=dk5G5eByLJo',
    linkLabel: 'Voir sur YouTube',
    isFictionalEvent: true,
    date: getDecemberDate(6),
  },
  {
    id: 'fi-lit-04',
    title: 'FlowDiff — Export panier en PDF',
    universe: 'Littérature',
    category: 'FlowDiff',
    imageUrl: null,
    videoUrl: null,
    text: 'Nouvelle fonctionnalité : exportez votre bon de commande en PDF directement depuis le panier. Idéal pour vos archives ou pour l\'envoyer par email à votre équipe.',
    date: getDecemberDate(9),
  },

  /* ─── Adulte-pratique ─── */
  {
    id: 'fi-pra-01',
    title: 'Le Guide Marabout du bien-être mental — présentation vidéo',
    universe: 'Adulte-pratique',
    category: 'Auteurs',
    imageUrl: null,
    videoUrl: 'https://www.youtube.com/embed/dk5G5eByLJo',
    text: 'Événement fictif : une présentation vidéo du Guide Marabout du bien-être mental est disponible pour animer votre espace pratique.',
    link: 'https://www.youtube.com/watch?v=dk5G5eByLJo',
    linkLabel: 'Voir sur YouTube',
    bookId: 'n-pra-01',
    bookIsbn: '9782501172097',
    isFictionalEvent: true,
    date: getDecemberDate(2),
  },
  {
    id: 'fi-pra-02',
    title: 'Larousse — Cuisine autour du monde',
    universe: 'Adulte-pratique',
    category: 'Fonds',
    imageUrl: '/covers/9782036052307.jpg',
    videoUrl: null,
    text: 'Événement fictif : une mise en avant Cuisine autour du monde est proposée pour vos tables gourmandes.',
    bookId: 'f-pra-larousse',
    bookIsbn: '9782036052307',
    isFictionalEvent: true,
    date: getDecemberDate(6),
  },
  {
    id: 'fi-pra-03',
    title: 'Le Potager de balcon — programme automne',
    universe: 'Adulte-pratique',
    category: 'Nouveautés',
    imageUrl: '/covers/9789990001004.jpg',
    videoUrl: null,
    text: 'Événement fictif : le programme d’automne du Potager de balcon est disponible avec son catalogue de présentation.',
    bookId: 'ap-pra-02',
    bookIsbn: '9789990001004',
    isFictionalEvent: true,
    date: getDecemberDate(10),
  },
]

export const FLASH_CATEGORIES: FlashCategory[] = ['Auteurs', 'Fonds', 'Nouveautés', 'FlowDiff']
