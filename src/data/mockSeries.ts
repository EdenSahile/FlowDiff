import type { Universe } from '@/data/mockBooks'

export interface OffreCommerciale {
  titre: string               // Ex: "Pack Tintin Été 2026"
  description: string         // Ex: "2 livres achetés = 1 paire de chaussettes offerte !"
  ratioAchat: number          // Nb de livres achetés pour 1 cadeau offert (ex: 2)
  qtyParTitreParPLV: number   // Qté fixe de chaque titre dans 1 lot (= 1 PLV)
  cadeauLabel: string         // Ex: "paire de chaussettes Tintin"
  cadeauEmoji: string         // Ex: "🧦"
  prixPLV: number             // Prix de la PLV en € (payante)
  descPLV: string             // Description de la PLV physique
  validUntil?: string         // Ex: "30 juin 2026"
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
  coverUrl: string           // Open Library ou autre source directe
  coverBookId: string        // ISBN de référence (fallback BookCover)
  bookIds: string[]
}

/* ── Helpers couvertures ── */
/* ?default=false → retourne 404 si pas de couverture (au lieu d'une image placeholder) */
const ol = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`

/* Priorité : Open Library (?default=false → 404 si absent), fallback Google Books dans SerieCover */
export const MOCK_SERIES: Serie[] = [

  /* ════════════════════════
     BD/Mangas — BD-Héros
  ════════════════════════ */
  {
    id: 'tintin',
    nom: 'Tintin',
    auteur: 'Hergé',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Le reporter belge et son chien Milou parcourent le monde dans 24 albums indémodables.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Tintin Été 2026',
      description: '2 livres achetés = 1 paire de chaussettes offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 4,
      cadeauLabel: 'paire de chaussettes Tintin collector',
      cadeauEmoji: '🧦',
      prixPLV: 4.90,
      descPLV: 'Présentoir carton + affiche A3 Tintin',
      validUntil: '30 juin 2026',
    },
    coverUrl: ol('9782203001046'),
    coverBookId: 'f-bd-01',
    bookIds: ['s-ttn-01', 's-ttn-02', 's-ttn-03', 'f-bd-01'],
  },
  {
    id: 'asterix',
    nom: 'Astérix',
    auteur: 'Goscinny & Uderzo',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Le village gaulois qui résiste à l\'envahisseur romain grâce à la potion magique du druide Panoramix.',
    coverUrl: ol('9782012101517'),
    coverBookId: 'f-bd-02',
    bookIds: ['f-bd-02', 's-ast-01', 's-ast-02'],
  },
  {
    id: 'largo-winch',
    nom: 'Largo Winch',
    auteur: 'Van Hamme & Francq',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Milliardaire malgré lui, Largo Winch hérite d\'un empire financier et doit en défendre le contrôle.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Largo Winch Printemps 2026',
      description: '2 livres achetés = 1 marque-page métallique offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'marque-page métallique gravé',
      cadeauEmoji: '🔖',
      prixPLV: 2.50,
      descPLV: 'Affichette A4 + set de marque-pages',
      validUntil: '31 mai 2026',
    },
    coverUrl: ol('9782800125558'),
    coverBookId: 's-lw-01',
    bookIds: ['s-lw-01', 's-lw-02', 's-lw-03', 's-lw-04'],
  },
  {
    id: 'xiii',
    nom: 'XIII',
    auteur: 'Van Hamme & Vance',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Un homme sans mémoire tatoué du chiffre XIII plonge dans un complot au sommet des États-Unis.',
    coverUrl: ol('9782800101897'),
    coverBookId: 'f-bd-xiii',
    bookIds: ['f-bd-xiii'],
  },
  {
    id: 'spirou',
    nom: 'Spirou et Fantasio',
    auteur: 'André Franquin',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Le groom au costume rouge et son complice Fantasio vivent des aventures rocambolesques à travers le monde.',
    coverUrl: ol('9782800100951'),
    coverBookId: 'f-bd-spirou',
    bookIds: ['f-bd-spirou'],
  },


  /* ════════════════════════
     BD/Mangas — Mangas
  ════════════════════════ */
  {
    id: 'my-hero-academia',
    nom: 'My Hero Academia',
    auteur: 'Kōhei Horikoshi',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Dans un monde où les super-pouvoirs sont la norme, Izuku Midoriya est né sans don — mais refuse de baisser les bras.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack My Hero Academia Été 2026',
      description: '2 livres achetés = 1 sticker pack offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'sticker pack My Hero Academia',
      cadeauEmoji: '🎨',
      prixPLV: 3.50,
      descPLV: 'Stop-rayon manga + kakémono 60×160 cm',
      validUntil: '30 juin 2026',
    },
    coverUrl: ol('9782344000656'),
    coverBookId: 'n-bd-02',
    bookIds: ['n-bd-02', 's-mha-02', 's-mha-03', 's-mha-04'],
  },
  {
    id: 'kaguya',
    nom: 'Kaguya-sama',
    auteur: 'Aka Akasaka',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Une comédie romantique où deux lycéens d\'exception s\'affrontent psychologiquement pour forcer l\'autre à avouer ses sentiments.',
    coverUrl: ol('9782505079385'),
    coverBookId: 'n-bd-01',
    bookIds: ['n-bd-01'],
  },
  {
    id: 'naruto',
    nom: 'Naruto',
    auteur: 'Masashi Kishimoto',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Naruto Uzumaki, jeune ninja impétueux portant en lui le démon renard, rêve de devenir le plus grand des Hokage.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Naruto Saison 2026',
      description: '2 livres achetés = 1 paire de chaussettes offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 4,
      cadeauLabel: 'paire de chaussettes Naruto',
      cadeauEmoji: '🧦',
      prixPLV: 3.90,
      descPLV: 'Présentoir tête de gondole + affiche A2',
      validUntil: '31 juillet 2026',
    },
    coverUrl: ol('9782723469890'),
    coverBookId: 'f-bd-naruto',
    bookIds: ['f-bd-naruto'],
  },
  {
    id: 'one-piece',
    nom: 'One Piece',
    auteur: 'Eiichiro Oda',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Monkey D. Luffy et son équipage de pirates partent à la conquête du légendaire trésor One Piece. Record mondial de ventes.',
    coverUrl: ol('9782723471015'),
    coverBookId: 'f-bd-onepiece',
    bookIds: ['f-bd-onepiece'],
  },
  {
    id: 'dragon-ball',
    nom: 'Dragon Ball',
    auteur: 'Akira Toriyama',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Son Goku recherche les Dragon Balls, sept sphères magiques permettant d\'exaucer tous les vœux. Le manga fondateur du shōnen.',
    coverUrl: ol('9782723428521'),
    coverBookId: 'f-bd-dragonball',
    bookIds: ['f-bd-dragonball'],
  },

  /* ════════════════════════
     Jeunesse — Nos héros
  ════════════════════════ */
  {
    id: 'harry-potter',
    nom: 'Harry Potter',
    auteur: 'J.K. Rowling',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Orphelin élevé par des muggles, Harry Potter découvre à 11 ans qu\'il est un sorcier et entre à l\'école Poudlard.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Harry Potter Rentrée 2026',
      description: '2 livres achetés = 1 lumière de lecture offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'lumière de lecture Poudlard',
      cadeauEmoji: '🔦',
      prixPLV: 5.90,
      descPLV: 'Présentoir Poudlard + bannière tissu 80×120 cm',
      validUntil: '31 août 2026',
    },
    coverUrl: ol('9782070584628'),
    coverBookId: 'f-jes-01',
    bookIds: ['f-jes-01', 's-hp-02', 's-hp-03', 's-hp-04'],
  },
  {
    id: 'petit-nicolas',
    nom: 'Le Petit Nicolas',
    auteur: 'Goscinny & Sempé',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Les aventures cocasses de Nicolas et de sa bande de copains : Alceste, Clotaire, Eudes, Geoffroy et les autres.',
    coverUrl: ol('9782070619061'),
    coverBookId: 'n-jes-01',
    bookIds: ['n-jes-01', 's-nic-02', 's-nic-03'],
  },
  {
    id: 'narnia',
    nom: 'Le Monde de Narnia',
    auteur: 'C.S. Lewis',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Quatre enfants pénètrent dans une armoire magique et se retrouvent dans le monde fantastique de Narnia, gouverné par la Sorcière Blanche.',
    coverUrl: ol('9782070625734'),
    coverBookId: 'f-jes-02',
    bookIds: ['f-jes-02'],
  },
  {
    id: 'roald-dahl',
    nom: 'Roald Dahl',
    auteur: 'Roald Dahl',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Les œuvres intemporelles de Roald Dahl mêlant humour noir, fantaisie et tendresse pour faire rêver petits et grands.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Roald Dahl Automne 2026',
      description: '2 livres achetés = 1 carnet illustré offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 4,
      cadeauLabel: 'carnet illustré Roald Dahl',
      cadeauEmoji: '📓',
      prixPLV: 3.50,
      descPLV: 'Affiche A3 illustrée + stop-rayon Dahl',
      validUntil: '30 septembre 2026',
    },
    coverUrl: ol('9782070514830'),
    coverBookId: 'n-jes-02',
    bookIds: ['n-jes-02', 'f-jes-charlie'],
  },
  {
    id: 'jules-verne',
    nom: 'Jules Verne',
    auteur: 'Jules Verne',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Les Voyages extraordinaires de Jules Verne emportent le lecteur sous les mers, au centre de la Terre et sur la Lune.',
    coverUrl: ol('9782070415403'),
    coverBookId: 'f-jes-jules-verne',
    bookIds: ['f-jes-jules-verne'],
  },

  /* ════════════════════════
     Littérature — Prix littéraires
  ════════════════════════ */
  {
    id: 'prix-goncourt',
    nom: 'Prix Goncourt',
    auteur: 'Académie Goncourt',
    univers: 'Littérature',
    categorie: 'Prix littéraires',
    description: 'Les lauréats du Prix Goncourt, la plus haute distinction littéraire française remise chaque automne depuis 1903.',
    isOffreSpeciale: true,
    isPrixLitteraire: true,
    offreCommerciale: {
      titre: 'Pack Goncourt Hiver 2026',
      description: '2 livres achetés = 1 bougie Soirée Lecture offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 5,
      cadeauLabel: 'bougie "Soirée Lecture"',
      cadeauEmoji: '🕯️',
      prixPLV: 4.90,
      descPLV: 'Présentoir bois + affiche 50×70 cm prix littéraires',
      validUntil: '31 décembre 2026',
    },
    coverUrl: ol('9782072886447'),
    coverBookId: 'n-lit-01',
    bookIds: ['n-lit-01', 'n-lit-02'],
  },
  {
    id: 'prix-renaudot',
    nom: 'Prix Renaudot',
    auteur: 'Jury Renaudot',
    univers: 'Littérature',
    categorie: 'Prix littéraires',
    description: 'Le Prix Renaudot, décerné le même jour que le Goncourt, récompense depuis 1926 un roman ou recueil de nouvelles.',
    isPrixLitteraire: true,
    coverUrl: ol('9782283030066'),
    coverBookId: 'n-lit-03',
    bookIds: ['n-lit-03'],
  },
  {
    id: 'prix-medicis',
    nom: 'Prix Médicis',
    auteur: 'Jury Médicis',
    univers: 'Littérature',
    categorie: 'Prix littéraires',
    description: 'Créé en 1958 pour couronner des auteurs dont le talent s\'impose face à la notoriété, le Prix Médicis défend la prise de risque littéraire.',
    isPrixLitteraire: true,
    coverUrl: ol('9782818056868'),
    coverBookId: 'ap-lit-01',
    bookIds: ['ap-lit-01'],
  },

  /* ════════════════════════
     Littérature — Classiques
  ════════════════════════ */
  {
    id: 'classiques-poche',
    nom: 'Classiques intemporels',
    auteur: 'Folio / Poche',
    univers: 'Littérature',
    categorie: 'Classiques',
    description: 'Les piliers de la littérature française et mondiale à avoir absolument en rayon : Camus, Saint-Exupéry, Hugo.',
    coverUrl: ol('9782070360024'),
    coverBookId: 'f-lit-01',
    bookIds: ['f-lit-01', 'f-lit-02', 'f-lit-03'],
  },
  {
    id: 'victor-hugo',
    nom: 'Victor Hugo',
    auteur: 'Victor Hugo',
    univers: 'Littérature',
    categorie: 'Classiques',
    description: 'L\'œuvre titanesque de Victor Hugo : poésie, théâtre, romans — Notre-Dame de Paris, Les Misérables et bien d\'autres.',
    coverUrl: ol('9782253004318'),
    coverBookId: 'f-lit-miserable',
    bookIds: ['f-lit-03', 'f-lit-miserable'],
  },
  {
    id: 'flaubert',
    nom: 'Gustave Flaubert',
    auteur: 'Gustave Flaubert',
    univers: 'Littérature',
    categorie: 'Classiques',
    description: 'L\'auteur du réalisme français par excellence, dont Madame Bovary reste l\'un des romans les plus lus au monde.',
    coverUrl: ol('9782070413119'),
    coverBookId: 'f-lit-bovary',
    bookIds: ['f-lit-bovary'],
  },

  /* ════════════════════════
     Adulte-pratique — Gastronomie
  ════════════════════════ */
  {
    id: 'cuisine',
    nom: 'Cuisine & gastronomie',
    auteur: 'Larousse / La Martinière',
    univers: 'Adulte-pratique',
    categorie: 'Gastronomie',
    description: 'Les grandes références de la cuisine française : du Larousse au chef Christophe Felder, tout pour maîtriser l\'art culinaire.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Gastronomie Été 2026',
      description: '2 livres achetés = 1 tablier de cuisine offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'tablier de cuisine',
      cadeauEmoji: '👨‍🍳',
      prixPLV: 8.90,
      descPLV: 'Présentoir bois cuisine + kakémono 60×160 cm',
      validUntil: '30 juin 2026',
    },
    coverUrl: ol('9782812303067'),
    coverBookId: 'f-pra-01',
    bookIds: ['f-pra-01', 'n-pra-01'],
  },
  {
    id: 'jardinage',
    nom: 'Jardinage & nature',
    auteur: 'Larousse',
    univers: 'Adulte-pratique',
    categorie: 'Gastronomie',
    description: 'Guides pratiques pour créer et entretenir son jardin, cultiver son potager et vivre en harmonie avec la nature.',
    coverUrl: ol('9782035876614'),
    coverBookId: 'n-pra-02',
    bookIds: ['n-pra-02'],
  },

  /* ════════════════════════
     Adulte-pratique — Bien-être
  ════════════════════════ */
  {
    id: 'bien-etre',
    nom: 'Bien-être & corps',
    auteur: 'Hachette Pratique',
    univers: 'Adulte-pratique',
    categorie: 'Bien-être',
    description: 'Méthodes et programmes pour prendre soin de son corps et de son esprit au quotidien : Pilates, méditation, yoga.',
    coverUrl: ol('9782019468422'),
    coverBookId: 'f-pra-02',
    bookIds: ['f-pra-02', 'n-pra-02', 'ap-pra-01'],
  },
  {
    id: 'meditation',
    nom: 'Méditation & pleine conscience',
    auteur: 'Christophe André',
    univers: 'Adulte-pratique',
    categorie: 'Bien-être',
    description: 'Les guides essentiels pour débuter et approfondir la pratique de la méditation de pleine conscience, par le psychiatre Christophe André.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Bien-être Automne 2026',
      description: '2 livres achetés = 1 bougie de méditation offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'bougie de méditation',
      cadeauEmoji: '🕯️',
      prixPLV: 4.90,
      descPLV: 'Présentoir bien-être + affiche format raisin',
      validUntil: '30 septembre 2026',
    },
    coverUrl: ol('9782913366657'),
    coverBookId: 'ap-pra-01',
    bookIds: ['ap-pra-01', 'f-pra-02'],
  },
]

/* ── Helpers ── */
export const CATEGORIES_BY_UNIVERSE: Record<string, string[]> = {
  'BD/Mangas':       ['BD-Héros', 'Mangas'],
  'Jeunesse':        ['Nos héros'],
  'Littérature':     ['Prix littéraires', 'Classiques'],
  'Adulte-pratique': ['Gastronomie', 'Bien-être'],
}
