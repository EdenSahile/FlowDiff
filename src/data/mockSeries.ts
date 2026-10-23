import type { Universe } from '@/data/mockBooks'

/* Une vente à prime n'est licite que si l'éditeur la propose simultanément et
   dans les mêmes conditions à tous les détaillants (art. 6, loi 81-766 du
   10 août 1981). Le libraire relaie l'offre, il ne la crée pas. */
export const MENTION_PRIME =
  "Offre proposée par l'éditeur, valable dans les mêmes conditions chez tous les détaillants."

export interface OffreCommerciale {
  titre: string
  description: string
  /* Nombre de livres de la sélection que le lecteur achète pour obtenir 1 prime.
     Les titres peuvent être différents : c'est le choix qui fait l'opération. */
  ratioAchat: number
  qtyParTitreParPLV: number
  cadeauLabel: string
  cadeauEmoji: string
  isbnCadeau: string
  prixPLV: number
  descPLV: string
  isbnPLV: string
  validUntil?: string
}

export interface Serie {
  id: string
  nom: string
  auteur: string
  univers: Universe
  categorie: string
  description: string
  isOffreSpeciale?: boolean
  isPrixLitteraire?: boolean
  offreCommerciale?: OffreCommerciale
  coverBookId: string        // identifiant du livre dont la couverture illustre la sélection
  bookIds: string[]
}

/* Les lots sont calibrés sur les PLV réelles du métier : 12 à 15 volumes par
   présentoir, répartis sur 3 à 6 titres pour que le lecteur ait un choix. */
export const MOCK_SERIES: Serie[] = [

  /* ════════════════════════
     BD & Mangas
  ════════════════════════ */
  {
    id: 'shonen-action',
    nom: "Shōnen d'action",
    auteur: 'Akutami, Horikoshi, ONE',
    univers: 'BD/Mangas',
    categorie: 'BD & Mangas',
    description: 'Les grandes séries de combat du moment, des sorciers de Jujutsu Kaisen aux héros de UA, jusqu\'au poing imbattable de Saitama.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Shōnen Été 2026',
      description: '2 livres de la sélection achetés = 1 paire de chaussettes collector offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,     // 5 titres x 3 = 15 volumes
      cadeauLabel: 'paire de chaussettes collector',
      cadeauEmoji: '🧦',
      isbnCadeau: '9799000000001',
      prixPLV: 4.90,
      descPLV: 'Présentoir de comptoir 15 volumes + affiche A3',
      isbnPLV: '9799000000002',
      validUntil: '30 juin 2026',
    },
    coverBookId: 'f-bd-jjk-08',
    bookIds: ['f-bd-jjk-08', 'ap-bd-01', 'f-bd-mha-tu02', 'f-bd-mha-tu05', 'f-bd-opm'],
  },
  {
    id: 'comedie-tranches-de-vie',
    nom: 'Comédie et tranches de vie',
    auteur: 'Hokami, Endo, Miura',
    univers: 'BD/Mangas',
    categorie: 'BD & Mangas',
    description: 'Des familles d\'espions, des pourfendeurs de démons au lycée et un gymnase à l\'aube : le manga qui fait sourire autant qu\'il touche.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Comédie Printemps 2026',
      description: '2 livres de la sélection achetés = 1 marque-page métallique offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,     // 4 titres x 3 = 12 volumes
      cadeauLabel: 'marque-page métallique',
      cadeauEmoji: '🔖',
      isbnCadeau: '9799000000003',
      prixPLV: 2.50,
      descPLV: 'Présentoir de comptoir 12 volumes + set de marque-pages',
      isbnPLV: '9799000000004',
      validUntil: '31 mai 2026',
    },
    coverBookId: 'f-bd-spy',
    bookIds: ['f-bd-spy', 'f-bd-demon-sd01', 'f-bd-demon-sd02', 'n-bd-02'],
  },
  {
    id: 'decouvertes-manga',
    nom: 'Découvertes',
    auteur: 'Yukimura, Tatsu, Kuroda',
    univers: 'BD/Mangas',
    categorie: 'BD & Mangas',
    description: 'Quatre premiers tomes à faire découvrir, de l\'épopée viking au fantastique déjanté, pour ouvrir le rayon à autre chose que les séries installées.',
    coverBookId: 'f-bd-vinland',
    bookIds: ['f-bd-vinland', 'n-bd-01', 'ap-bd-02', 'ap-bd-03'],
  },

  /* ════════════════════════
     Jeunesse
  ════════════════════════ */
  {
    id: 'young-adult',
    nom: 'Young adult',
    auteur: 'Oseman, Bardugo',
    univers: 'Jeunesse',
    categorie: 'Jeunesse',
    description: 'La trilogie Heartstopper au complet et le casse impossible de Six of Crows : les titres qui font revenir les adolescents en librairie.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Young Adult Automne 2026',
      description: '2 livres de la sélection achetés = 1 carnet illustré offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,     // 4 titres x 3 = 12 volumes
      cadeauLabel: 'carnet illustré',
      cadeauEmoji: '📓',
      isbnCadeau: '9799000000011',
      prixPLV: 5.90,
      descPLV: 'Présentoir de sol 12 volumes + affiche A3',
      isbnPLV: '9799000000012',
      validUntil: '30 septembre 2026',
    },
    coverBookId: 'n-jes-01',
    bookIds: ['n-jes-01', 'f-jes-hearts-02', 'f-jes-hearts-03', 'f-jes-six-01'],
  },
  {
    id: 'fantasy-jeunesse',
    nom: 'Fantasy jeunesse',
    auteur: 'Dabos, Rowling, Bellamy',
    univers: 'Jeunesse',
    categorie: 'Jeunesse',
    description: 'Mondes à traverser, créatures à répertorier et forêts oubliées : la fantasy qui accompagne les lecteurs de 10 à 15 ans.',
    coverBookId: 'n-jes-02',
    bookIds: ['n-jes-02', 'ap-jes-01', 'ap-jes-02', 'f-jes-animaux'],
  },

  /* ════════════════════════
     Littérature
  ════════════════════════ */
  {
    id: 'prix-litteraires',
    nom: 'Prix littéraires',
    auteur: 'Daoud, Mathieu, Vuillard, Faye',
    univers: 'Littérature',
    categorie: 'Littérature',
    description: 'Goncourt et Renaudot réunis sur une même table, des Jours de verre de la rentrée aux valeurs sûres du fonds primé.',
    isPrixLitteraire: true,
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Prix littéraires Rentrée 2026',
      description: '2 livres de la sélection achetés = 1 bougie Soirée Lecture offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,     // 4 titres x 3 = 12 volumes
      cadeauLabel: 'bougie Soirée Lecture',
      cadeauEmoji: '🕯️',
      isbnCadeau: '9799000000009',
      prixPLV: 4.90,
      descPLV: 'Présentoir de sol 12 volumes + chevalet de table',
      isbnPLV: '9799000000010',
      validUntil: '31 octobre 2026',
    },
    coverBookId: 'n-lit-01',
    bookIds: ['n-lit-01', 'f-lit-mathieu', 'f-lit-vuillard', 'n-lit-02'],
  },
  {
    id: 'recits-temoignages',
    nom: 'Récits et témoignages',
    auteur: 'Berest, de Vigan, Colombani',
    univers: 'Littérature',
    categorie: 'Littérature',
    description: 'Enquêtes familiales et histoires vraies, de la carte postale anonyme aux tresses qui relient trois continents.',
    coverBookId: 'f-lit-berest',
    bookIds: ['f-lit-berest', 'f-lit-vigan', 'f-lit-colombani', 'f-lit-letellier'],
  },
  {
    id: 'grands-romans',
    nom: 'Grands romans contemporains',
    auteur: 'Houellebecq, Musso, Slimani',
    univers: 'Littérature',
    categorie: 'Littérature',
    description: 'Six romans qui tournent vite en rayon, du thriller à la fresque marocaine de Leïla Slimani.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Romans Hiver 2026',
      description: '2 livres de la sélection achetés = 1 tote bag offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 2,     // 6 titres x 2 = 12 volumes
      cadeauLabel: 'tote bag librairie',
      cadeauEmoji: '👜',
      isbnCadeau: '9799000000013',
      prixPLV: 6.90,
      descPLV: 'Présentoir de sol 12 volumes + vitrophanie',
      isbnPLV: '9799000000014',
      validUntil: '28 février 2026',
    },
    coverBookId: 'f-lit-houellebecq',
    bookIds: ['f-lit-houellebecq', 'f-lit-jeune', 'ap-lit-01', 'ap-lit-03', 'f-lit-slimani', 'ap-lit-02'],
  },

  /* ════════════════════════
     Vie pratique
  ════════════════════════ */
  {
    id: 'comprendre-le-monde',
    nom: 'Comprendre le monde',
    auteur: 'Harari, Rosling, Bryson',
    univers: 'Adulte-pratique',
    categorie: 'Vie pratique',
    description: 'Les essais qui se vendent toute l\'année, de l\'histoire du corps humain aux grandes synthèses de Yuval Noah Harari.',
    coverBookId: 'f-pra-homo',
    bookIds: ['f-pra-homo', 'f-pra-21', 'f-pra-factfulness', 'ap-pra-01'],
  },
  {
    id: 'bien-etre',
    nom: 'Bien-être',
    auteur: 'García, Clear, collectif',
    univers: 'Adulte-pratique',
    categorie: 'Vie pratique',
    description: 'Habitudes, respiration et mouvement : le rayon qui redémarre chaque janvier et tient jusqu\'au printemps.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Bien-être Janvier 2026',
      description: '2 livres de la sélection achetés = 1 bougie de méditation offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 4,     // 3 titres x 4 = 12 volumes
      cadeauLabel: 'bougie de méditation',
      cadeauEmoji: '🕯️',
      isbnCadeau: '9799000000015',
      prixPLV: 4.90,
      descPLV: 'Présentoir de comptoir 12 volumes + affichette A4',
      isbnPLV: '9799000000016',
      validUntil: '31 mars 2026',
    },
    coverBookId: 'n-pra-02',
    bookIds: ['n-pra-02', 'f-pra-james', 'f-pra-pilates'],
  },
  {
    id: 'nature-et-maison',
    nom: 'Nature et maison',
    auteur: 'Attenborough, Renard, Besson',
    univers: 'Adulte-pratique',
    categorie: 'Vie pratique',
    description: 'Du potager de balcon à la cuisine en famille, en passant par le constat de David Attenborough sur notre planète.',
    coverBookId: 'f-pra-attenborough',
    bookIds: ['f-pra-attenborough', 'ap-pra-02', 'f-pra-larousse'],
  },
]
