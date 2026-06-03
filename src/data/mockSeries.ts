import type { Universe } from '@/data/mockBooks'

export interface OffreCommerciale {
  titre: string
  description: string
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
  coverUrl: string           // Open Library ou autre source directe
  coverBookId: string        // ISBN de référence (fallback BookCover)
  bookIds: string[]
}

/* Priorité : Open Library (?default=false → 404 si absent), fallback Google Books dans SerieCover */
const ol = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`

export const MOCK_SERIES: Serie[] = [

  /* ════════════════════════
     BD/Mangas — BD-Héros
  ════════════════════════ */
  {
    id: 'demon-slayer',
    nom: 'Demon Slayer',
    auteur: 'Koyoharu Gotouge',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Tanjiro Kamado part à la chasse aux démons pour sauver sa sœur transformée. Le shōnen phénomène qui a conquis le monde entier avec ses animations époustouflantes.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Demon Slayer Été 2026',
      description: '2 tomes achetés = 1 paire de chaussettes collector offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 4,
      cadeauLabel: 'paire de chaussettes Demon Slayer collector',
      cadeauEmoji: '🧦',
      isbnCadeau: '9799000000001',
      prixPLV: 4.90,
      descPLV: 'Présentoir carton + affiche A3 Demon Slayer',
      isbnPLV: '9799000000002',
      validUntil: '30 juin 2026',
    },
    coverUrl: ol('9782809491739'),
    coverBookId: 'f-bd-demon-01',
    bookIds: ['f-bd-demon-01', 'f-bd-demon-02', 'f-bd-demon-03'],
  },
  {
    id: 'jujutsu-kaisen',
    nom: 'Jujutsu Kaisen',
    auteur: 'Gege Akutami',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Yuji Itadori, hôte d\'un esprit maléfique, intègre l\'école de sorcellerie de Tokyo. Un shōnen explosif mêlant arts martiaux et exorcisme.',
    coverUrl: ol('9782355858437'),
    coverBookId: 'f-bd-jjk-01',
    bookIds: ['f-bd-jjk-01', 'f-bd-jjk-02'],
  },
  {
    id: 'spy-family',
    nom: 'Spy × Family',
    auteur: 'Tatsuya Endo',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Un espion doit fonder une fausse famille pour sa mission : sa fille adoptive est télépathe, sa femme est une tueuse. La comédie familiale la plus explosive du moment.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Spy × Family Printemps 2026',
      description: '2 tomes achetés = 1 marque-page métallique offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'marque-page métallique Spy × Family',
      cadeauEmoji: '🔖',
      isbnCadeau: '9799000000003',
      prixPLV: 2.50,
      descPLV: 'Affichette A4 + set de marque-pages gravés',
      isbnPLV: '9799000000004',
      validUntil: '31 mai 2026',
    },
    coverUrl: ol('9782380711448'),
    coverBookId: 'f-bd-spy-01',
    bookIds: ['f-bd-spy-01', 'f-bd-spy-02'],
  },
  {
    id: 'arabe-futur',
    nom: "L'Arabe du futur",
    auteur: 'Riad Sattouf',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'L\'autobiographie de Riad Sattouf, entre France et Syrie. Six tomes pour raconter une enfance partagée entre deux cultures, avec humour et émotion.',
    coverUrl: ol('9782370733498'),
    coverBookId: 'f-bd-arabe-04',
    bookIds: ['f-bd-arabe-04', 'f-bd-arabe-05', 'f-bd-arabe-06', 'f-bd-legerete'],
  },
  {
    id: 'cahiers-esther',
    nom: "Les Cahiers d'Esther",
    auteur: 'Riad Sattouf',
    univers: 'BD/Mangas',
    categorie: 'BD-Héros',
    description: 'Le journal illustré d\'Esther, vue par Riad Sattouf. Un regard sans filtre et terriblement drôle sur le monde des enfants d\'aujourd\'hui.',
    coverUrl: ol('9782370733047'),
    coverBookId: 'f-bd-esther-01',
    bookIds: ['f-bd-esther-01', 'f-bd-esther-02'],
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
      isbnCadeau: '9799000000005',
      prixPLV: 3.50,
      descPLV: 'Stop-rayon manga + kakémono 60×160 cm',
      isbnPLV: '9799000000006',
      validUntil: '30 juin 2026',
    },
    coverUrl: ol('9782344003459'),
    coverBookId: 's-mha-02',
    bookIds: ['s-mha-02', 's-mha-03', 's-mha-04'],
  },
  {
    id: 'frieren',
    nom: "Frieren : Requiem pour l'idole",
    auteur: 'Kanehito Yamada',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Après la victoire contre le roi démon, la mage elfe Frieren voyage seule. Un manga poétique et mélancolique sur le temps, la mémoire et les liens humains.',
    coverUrl: ol('9782820341181'),
    coverBookId: 'n-bd-01',
    bookIds: ['n-bd-01'],
  },
  {
    id: 'dandadan',
    nom: 'Dandadan',
    auteur: 'Yukinobu Tatsu',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Momo croit aux extraterrestres, Okarun aux fantômes. Ils font face aux deux. Action, humour et romance dans un shōnen complètement déjanté.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Dandadan Saison 2026',
      description: '2 livres achetés = 1 paire de chaussettes offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 4,
      cadeauLabel: 'paire de chaussettes Dandadan',
      cadeauEmoji: '🧦',
      isbnCadeau: '9799000000007',
      prixPLV: 3.90,
      descPLV: 'Présentoir tête de gondole + affiche A2',
      isbnPLV: '9799000000008',
      validUntil: '31 juillet 2026',
    },
    coverUrl: ol('9782344058640'),
    coverBookId: 'n-bd-02',
    bookIds: ['n-bd-02'],
  },
  {
    id: 'one-punch-man',
    nom: 'One-Punch Man',
    auteur: 'ONE & Yusuke Murata',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Saitama peut vaincre n\'importe quel ennemi d\'un seul coup de poing — et s\'ennuie profondément. Une parodie géniale du genre shōnen.',
    coverUrl: ol('9782331024474'),
    coverBookId: 'f-bd-opm-01',
    bookIds: ['f-bd-opm-01'],
  },
  {
    id: 'vinland-saga',
    nom: 'Vinland Saga',
    auteur: 'Makoto Yukimura',
    univers: 'BD/Mangas',
    categorie: 'Mangas',
    description: 'Angleterre, XIe siècle. Thorfinn, fils de viking, jure de venger son père et de trouver la terre promise de Vinland. Une épopée historique magistrale.',
    coverUrl: ol('9782756093802'),
    coverBookId: 'f-bd-vinland-01',
    bookIds: ['f-bd-vinland-01'],
  },

  /* ════════════════════════
     Jeunesse — Nos héros
  ════════════════════════ */
  {
    id: 'heartstopper',
    nom: 'Heartstopper',
    auteur: 'Alice Oseman',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Charlie et Nick. Une amitié qui devient amour. Une série graphique douce et sincère sur l\'identité, l\'acceptation de soi et les premiers émois.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Heartstopper Rentrée 2026',
      description: '2 tomes achetés = 1 carnet illustré offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'carnet illustré Heartstopper',
      cadeauEmoji: '📓',
      isbnCadeau: '9799000000009',
      prixPLV: 5.90,
      descPLV: 'Présentoir Heartstopper + affiche tissu 80×120 cm',
      isbnPLV: '9799000000010',
      validUntil: '31 août 2026',
    },
    coverUrl: ol('9782017136698'),
    coverBookId: 'f-jes-hearts-02',
    bookIds: ['f-jes-hearts-02', 'f-jes-hearts-03', 'n-jes-01'],
  },
  {
    id: 'la-passe-miroir',
    nom: 'La Passe-Miroir',
    auteur: 'Christelle Dabos',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Ophélie, fiancée de force à Thorn, est capable de lire les objets et de traverser les miroirs. La saga fantasy française incontournable de la dernière décennie.',
    coverUrl: ol('9782070665167'),
    coverBookId: 'f-jes-passe-03',
    bookIds: ['f-jes-passe-03', 'f-jes-passe-04'],
  },
  {
    id: 'six-of-crows',
    nom: 'Six of Crows',
    auteur: 'Leigh Bardugo',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Kaz Brekker, maître des bas-fonds, réunit une équipe pour l\'impossible casse de l\'Ice Court. Fantasy dark et haletante dans un univers richement construit.',
    coverUrl: ol('9782371023116'),
    coverBookId: 'f-jes-six-01',
    bookIds: ['f-jes-six-01', 'f-jes-six-02'],
  },
  {
    id: 'good-omens',
    nom: 'Good Omens',
    auteur: 'Terry Pratchett & Neil Gaiman',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Un ange et un démon s\'associent pour empêcher l\'Apocalypse. La comédie cosmique culte de Pratchett et Gaiman — drôle, irrévérencieuse et pleine de tendresse.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Fantasy Automne 2026',
      description: '2 livres achetés = 1 carnet illustré offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 4,
      cadeauLabel: 'carnet illustré fantasy',
      cadeauEmoji: '📓',
      isbnCadeau: '9799000000011',
      prixPLV: 3.50,
      descPLV: 'Affiche A3 illustrée + stop-rayon fantasy',
      isbnPLV: '9799000000012',
      validUntil: '30 septembre 2026',
    },
    coverUrl: ol('9782017212812'),
    coverBookId: 'n-jes-02',
    bookIds: ['n-jes-02', 'f-jes-six-01'],
  },
  {
    id: 'animaux-fantastiques',
    nom: 'Les Animaux fantastiques',
    auteur: 'J.K. Rowling',
    univers: 'Jeunesse',
    categorie: 'Nos héros',
    description: 'Le manuel illustré de magizoologie de Norbert Dragonneau, livre de cours à Poudlard. L\'univers de J.K. Rowling dans toute sa richesse.',
    coverUrl: ol('9782070585113'),
    coverBookId: 'f-jes-animaux',
    bookIds: ['f-jes-animaux'],
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
      isbnCadeau: '9799000000013',
      prixPLV: 4.90,
      descPLV: 'Présentoir bois + affiche 50×70 cm prix littéraires',
      isbnPLV: '9799000000014',
      validUntil: '31 décembre 2026',
    },
    coverUrl: ol('9782072994371'),
    coverBookId: 'n-lit-01',
    bookIds: ['n-lit-01', 'f-lit-mathieu', 'f-lit-vuillard'],
  },
  {
    id: 'prix-renaudot',
    nom: 'Prix Renaudot',
    auteur: 'Jury Renaudot',
    univers: 'Littérature',
    categorie: 'Prix littéraires',
    description: 'Le Prix Renaudot, décerné le même jour que le Goncourt, récompense depuis 1926 un roman ou recueil de nouvelles.',
    isPrixLitteraire: true,
    coverUrl: ol('9782221259146'),
    coverBookId: 'n-lit-02',
    bookIds: ['n-lit-02', 'n-lit-03'],
  },
  {
    id: 'prix-medicis',
    nom: 'Prix Médicis',
    auteur: 'Jury Médicis',
    univers: 'Littérature',
    categorie: 'Prix littéraires',
    description: 'Créé en 1958 pour couronner des auteurs dont le talent s\'impose face à la notoriété, le Prix Médicis défend la prise de risque littéraire.',
    isPrixLitteraire: true,
    coverUrl: ol('9782072886423'),
    coverBookId: 'ap-lit-01',
    bookIds: ['ap-lit-01', 'f-lit-berest'],
  },

  /* ════════════════════════
     Littérature — Classiques
  ════════════════════════ */
  {
    id: 'romanciers-populaires',
    nom: 'Romans populaires',
    auteur: 'Mathieu / Perrin / Musso',
    univers: 'Littérature',
    categorie: 'Classiques',
    description: 'Les romans français les plus lus de ces dix dernières années : Prix Goncourt 2018, phénomène Perrin, succès Musso. Les incontournables à avoir en rayon.',
    coverUrl: ol('9782330094058'),
    coverBookId: 'f-lit-mathieu',
    bookIds: ['f-lit-mathieu', 'f-lit-perrin', 'f-lit-musso', 'f-lit-colombani'],
  },
  {
    id: 'trilogie-slimani',
    nom: 'Trilogie marocaine',
    auteur: 'Leïla Slimani',
    univers: 'Littérature',
    categorie: 'Classiques',
    description: 'Trois générations de femmes entre Maroc et France. La saga romanesque de Leïla Slimani sur la liberté, l\'identité et l\'amour à travers le XXe siècle.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Trilogie Slimani Hiver 2026',
      description: '2 volumes achetés = 1 bougie "Soirée Lecture" offerte !',
      ratioAchat: 2,
      qtyParTitreParPLV: 5,
      cadeauLabel: 'bougie "Soirée Lecture"',
      cadeauEmoji: '🕯️',
      isbnCadeau: '9799000000015',
      prixPLV: 4.90,
      descPLV: 'Présentoir bois + affiche 50×70 cm Slimani',
      isbnPLV: '9799000000016',
      validUntil: '31 décembre 2026',
    },
    coverUrl: ol('9782072886423'),
    coverBookId: 'f-lit-slimani-pays',
    bookIds: ['f-lit-slimani-pays', 'f-lit-slimani-danse', 'ap-lit-01'],
  },
  {
    id: 'temoignages',
    nom: 'Récits & Témoignages',
    auteur: 'Berest / de Vigan / Rooney',
    univers: 'Littérature',
    categorie: 'Classiques',
    description: 'Des récits intimes et puissants : mémoire familiale, liens entre femmes, amour complexe. La littérature de l\'intime à son meilleur.',
    coverUrl: ol('9782246821427'),
    coverBookId: 'f-lit-berest',
    bookIds: ['f-lit-berest', 'f-lit-vigan', 'f-lit-rooney', 'f-lit-colombani'],
  },

  /* ════════════════════════
     Adulte-pratique — Gastronomie
  ════════════════════════ */
  {
    id: 'cuisine',
    nom: 'Cuisine & gastronomie',
    auteur: 'Larousse / First',
    univers: 'Adulte-pratique',
    categorie: 'Gastronomie',
    description: 'Les grandes références de la cuisine : du Larousse au guide anti-gaspi, tout pour maîtriser l\'art culinaire et cuisiner responsable.',
    isOffreSpeciale: true,
    offreCommerciale: {
      titre: 'Pack Gastronomie Été 2026',
      description: '2 livres achetés = 1 tablier de cuisine offert !',
      ratioAchat: 2,
      qtyParTitreParPLV: 3,
      cadeauLabel: 'tablier de cuisine',
      cadeauEmoji: '👨‍🍳',
      isbnCadeau: '9799000000017',
      prixPLV: 8.90,
      descPLV: 'Présentoir bois cuisine + kakémono 60×160 cm',
      isbnPLV: '9799000000018',
      validUntil: '30 juin 2026',
    },
    coverUrl: ol('9782011355737'),
    coverBookId: 'f-pra-01',
    bookIds: ['f-pra-01', 'n-pra-01'],
  },
  {
    id: 'nature-planete',
    nom: 'Nature & Planète',
    auteur: 'Attenborough / Bryson',
    univers: 'Adulte-pratique',
    categorie: 'Gastronomie',
    description: 'Comprendre et protéger la planète : David Attenborough témoigne de 90 ans d\'évolution, Bill Bryson explore les mystères du corps humain.',
    coverUrl: ol('9782501155229'),
    coverBookId: 'f-pra-attenborough',
    bookIds: ['f-pra-attenborough', 'f-pra-corps'],
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
      isbnCadeau: '9799000000019',
      prixPLV: 4.90,
      descPLV: 'Présentoir bien-être + affiche format raisin',
      isbnPLV: '9799000000020',
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
