export type Universe = 'BD/Mangas' | 'Jeunesse' | 'Littérature' | 'Adulte-pratique'
export type BookType = 'nouveaute' | 'a-paraitre' | 'fonds'

export type StockStatut =
  | 'disponible'
  | 'stock_limite'
  | 'sur_commande'
  | 'en_reimp'
  | 'epuise'
  | 'rupture'

export interface Book {
  id: string
  isbn: string
  title: string
  authors: string[]
  publisher: string
  collection?: string
  universe: Universe
  type: BookType
  price: number        // prix HT libraire
  priceTTC: number     // prix public TTC
  format: string
  genre?: string
  language?: string    // langue de l'édition — défaut : 'Français'
  pages?: number
  publicationDate: string
  description: string
  programme?: string
  fictif?: boolean
  statut?: StockStatut  // défaut : 'disponible' ; absent pour les a-paraitre
  delaiReimp?: string  // ex: "2 semaines" | "15 mai 2026" — uniquement pour en_reimp
  topVente?: boolean
  selection?: boolean
}

/* ── Genres par univers ── */
export const GENRE_BY_UNIVERSE: Record<Universe, string[]> = {
  'Littérature':     [
    'Roman contemporain',
    'Roman historique',
    'Polar & Thriller',
    'Fantasy & SF',
    'Romance',
    'Essai & Philosophie',
    'Biographie & Mémoires',
    'Poésie',
  ],
  'BD/Mangas':       [
    'BD franco-belge',
    'Shōnen',
    'Shōjo',
    'Seinen',
    'Roman graphique',
    'Comics',
  ],
  'Jeunesse':        [
    'Album illustré',
    'Roman jeunesse (6–9 ans)',
    'Roman jeunesse (9–12 ans)',
    'Fantasy jeunesse',
    'Aventure',
    'Humour',
  ],
  'Adulte-pratique': [
    'Cuisine & Gastronomie',
    'Sport & Fitness',
    'Psychologie & Psychanalyse',
    'Médecines douces',
    'Santé mentale',
    'Jardinage & Nature',
    'Développement personnel',
    'Bricolage & Maison',
  ],
}

/* ── Tranches de prix ── */
export interface PriceRange { label: string; min: number; max: number }

export const PRICE_RANGES: PriceRange[] = [
  { label: "Jusqu'à 5 EUR", min: 0,  max: 5   },
  { label: '5 à 10 EUR',    min: 5,  max: 10  },
  { label: '10 à 20 EUR',   min: 10, max: 20  },
  { label: '20 à 50 EUR',   min: 20, max: 50  },
  { label: '50 EUR et plus',min: 50, max: Infinity },
]

export function filterBooksByPrice(books: Book[], ranges: PriceRange[]): Book[] {
  if (ranges.length === 0) return books
  return books.filter(b => ranges.some(r => b.priceTTC >= r.min && b.priceTTC < r.max))
}

/* ── Langues disponibles ── */
export const LANGUAGES = ['Français', 'Anglais', 'Espagnol', 'Italien', 'Japonais', 'Allemand']

const _RAW_MOCK_BOOKS: Book[] = [

  /* ══════════════════════════════════════════════════════
     NOUVEAUTÉS DU MOIS — tous parus depuis 2016
  ══════════════════════════════════════════════════════ */

  /* ── Littérature ── */
  {
    id: 'n-lit-01',
    isbn: '9782072994371',
    title: 'Houris',
    authors: ['Kamel Daoud'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'nouveaute',
    genre: 'Roman contemporain', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 368,
    publicationDate: '2026-02-05',
    description: "Prix Goncourt 2024. Une sage-femme algérienne, voix d'un peuple condamné au silence. Kamel Daoud signe un roman bouleversant sur la mémoire et l'indicible.",
  },
  {
    id: 'n-lit-02',
    isbn: '9782221259146',
    title: 'Jacaranda',
    authors: ['Gaël Faye'],
    publisher: 'Robert Laffont',
    universe: 'Littérature', type: 'nouveaute',
    genre: 'Roman contemporain', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 288,
    publicationDate: '2026-03-12',
    description: "Prix Renaudot 2024. Sur trois générations, de 1994 à 2020, le Jacaranda comme témoin silencieux du Rwanda entre génocide et renaissance. Un roman lumineux.",
  },
  {
    id: 'n-lit-03',
    isbn: '9782226476265',
    title: 'La Fille sans visage',
    authors: ['Amélie Nothomb'],
    publisher: 'Albin Michel',
    universe: 'Littérature', type: 'nouveaute',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 192,
    publicationDate: '2026-01-22',
    description: "2024. Amélie Nothomb explore l'identité et le corps à travers une femme effacée qui cherche à exister. Étrange et envoûtant comme toujours.",
  },

  /* ── BD/Mangas ── */
  {
    id: 'n-bd-01',
    isbn: '9782820341181',
    title: "Frieren : Requiem pour l'idole T.1",
    authors: ['Kanehito Yamada', 'Tsukasa Abe'],
    publisher: 'Kazé Manga', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2026-03-20',
    description: "Après la défaite du roi démon, la mage elfe Frieren part en voyage de deuil. Un manga poétique et mélancolique sur le temps qui passe et les liens humains.",
  },
  {
    id: 'n-bd-02',
    isbn: '9782344058640',
    title: 'Dandadan T.1',
    authors: ['Yukinobu Tatsu'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2026-02-26',
    description: "Momo croit aux extraterrestres, Okarun aux fantômes. Ils se retrouvent tous deux confrontés aux deux. Action, humour et romance dans un shōnen déjanté.",
  },
  {
    id: 'n-bd-03',
    isbn: '9782344066645',
    title: 'Blue Box T.1',
    authors: ['Kouji Miura'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2026-04-09',
    description: "Taiki, badminton, tombe amoureux de Chinatsu, basket. Ils finissent dans le même internat. Une romance sportive douce et sincère.",
  },

  /* ── Jeunesse ── */
  {
    id: 'n-jes-01',
    isbn: '9782017214922',
    title: 'Heartstopper T.5',
    authors: ['Alice Oseman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'nouveaute',
    genre: 'Roman jeunesse (9–12 ans)', language: 'Anglais',
    price: 10.00, priceTTC: 14.99, format: '145 x 215 mm', pages: 336,
    publicationDate: '2026-03-15',
    description: "Charlie et Nick font face à de nouveaux défis : distance, université, avenir. Le tome le plus mature de la série, tendre et sincère.",
  },
  {
    id: 'n-jes-02',
    isbn: '9782017212812',
    title: 'Good Omens — La Bonne Augure',
    authors: ['Terry Pratchett', 'Neil Gaiman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'nouveaute',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 13.20, priceTTC: 19.90, format: '145 x 215 mm', pages: 416,
    publicationDate: '2026-02-05',
    description: "Un ange et un démon s'associent pour empêcher l'Apocalypse. Une comédie cosmique culte, drôle et irrévérencieuse — enfin disponible en édition illustrée.",
  },

  /* ── Adulte-pratique ── */
  {
    id: 'n-pra-01',
    isbn: '9782412090282',
    title: 'Anti-Gaspi — La cuisine zéro déchet',
    authors: ['Clémence Catz'],
    publisher: 'First Éditions',
    universe: 'Adulte-pratique', type: 'nouveaute',
    genre: 'Cuisine & Gastronomie', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 224,
    publicationDate: '2026-03-26',
    description: "100 recettes ingénieuses pour cuisiner sans rien jeter : fanes, trognons, restes et fond de frigo. Un livre tendance, responsable et délicieux.",
  },
  {
    id: 'n-pra-02',
    isbn: '9782501172097',
    title: 'Le Guide Marabout du bien-être mental',
    authors: ['Dr Cécile Cazaux'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'nouveaute',
    genre: 'Santé mentale', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 256,
    publicationDate: '2026-01-15',
    description: "Anxiété, burn-out, déprime : comprendre, prévenir et agir. Un guide complet et accessible par une psychiatre, ancré dans les dernières recherches.",
  },

  /* ══════════════════════════════════════════════════════
     À PARAÎTRE — tous parus depuis 2016
  ══════════════════════════════════════════════════════ */

  {
    id: 'ap-lit-01',
    isbn: '9782072979958',
    title: 'Le Sillage de la baleine',
    authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'a-paraitre',
    genre: 'Roman historique', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 368,
    publicationDate: '2026-06-04',
    description: "T.3 et dernier tome de la Trilogie marocaine. Aïcha, petite-fille de Mathilde, cherche à se libérer des fantômes familiaux dans le Maroc contemporain.",
    programme: 'Avril–Juin 2026',
  },
  {
    id: 'ap-lit-02',
    isbn: '9782073087904',
    title: 'Un monde à part',
    authors: ['Nicolas Mathieu'],
    publisher: 'Actes Sud',
    universe: 'Littérature', type: 'a-paraitre',
    genre: 'Roman contemporain', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 320,
    publicationDate: '2026-08-20',
    description: "Nicolas Mathieu retrouve la France des marges et des invisibles. Un roman choral sur le travail, l'amour et les rêves contrariés dans la France contemporaine.",
    programme: 'Juillet–Septembre 2026',
  },
  {
    id: 'ap-bd-01',
    isbn: '9782344078914',
    title: 'Jujutsu Kaisen T.27',
    authors: ['Gege Akutami'],
    publisher: 'Ki-oon', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'a-paraitre',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2026-06-18',
    description: "L'arc final de Jujutsu Kaisen approche de son dénouement. Les confrontations ultimes entre sorciers et malédictions se succèdent à un rythme effréné.",
    programme: 'Avril–Juin 2026',
  },
  {
    id: 'ap-jes-01',
    isbn: '9782017249580',
    title: 'Heartstopper T.6',
    authors: ['Alice Oseman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'a-paraitre',
    genre: 'Roman jeunesse (9–12 ans)', language: 'Anglais',
    price: 10.00, priceTTC: 14.99, format: '145 x 215 mm', pages: 352,
    publicationDate: '2026-09-10',
    description: "Le tome conclusif de la série. Charlie et Nick à l'université, leurs chemins divergent et se retrouvent. Une fin douce et méritée pour cette saga attachante.",
    programme: 'Juillet–Septembre 2026',
  },
  {
    id: 'ap-pra-01',
    isbn: '9782501193382',
    title: 'Longévité — Le nouveau guide scientifique',
    authors: ['Dr David Sinclair'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'a-paraitre',
    genre: 'Santé mentale', language: 'Anglais',
    price: 16.50, priceTTC: 24.90, format: '155 x 235 mm', pages: 368,
    publicationDate: '2026-08-19',
    description: "Le chercheur de Harvard David Sinclair révèle les dernières découvertes sur le vieillissement cellulaire. Comment vivre plus longtemps et en meilleure santé.",
    programme: 'Juillet–Septembre 2026',
  },

  /* ══════════════════════════════════════════════════════
     FONDS — Littérature (2016–2026)
  ══════════════════════════════════════════════════════ */

  {
    id: 'f-lit-mathieu',
    isbn: '9782330094058',
    title: 'Leurs enfants après eux',
    authors: ['Nicolas Mathieu'],
    publisher: 'Actes Sud',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 432,
    publicationDate: '2018-08-22',
    description: "Prix Goncourt 2018. Été 1992, une vallée ouvrière en déclin. Quatre adolescents qui se cherchent, une région qui s'étiole. Le roman d'une génération.",
    topVente: true,
  },
  {
    id: 'f-lit-colombani',
    isbn: '9782246814436',
    title: 'La Tresse',
    authors: ['Laetitia Colombani'],
    publisher: 'Grasset',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 11.70, priceTTC: 17.50, format: '155 x 235 mm', pages: 224,
    publicationDate: '2017-04-05',
    description: "Trois femmes, trois pays, trois destinées entrelacées comme les fils d'une tresse. Inde, Sicile, Canada — un roman lumineux sur la sororité et la liberté.",
    selection: true,
  },
  {
    id: 'f-lit-bourdeaut',
    isbn: '9782366120547',
    title: 'En attendant Bojangles',
    authors: ['Olivier Bourdeaut'],
    publisher: 'Finitude',
    universe: 'Littérature', type: 'fonds',
    genre: 'Romance', language: 'Français',
    price: 11.70, priceTTC: 17.50, format: '155 x 235 mm', pages: 160,
    publicationDate: '2016-01-07',
    description: "Un couple extravagant, un fils qui les aime, et une chanson de Sinatra qui tourne en boucle. L'un des romans les plus enchanteurs de ces dernières années.",
    delaiReimp: '2 semaines',
  },
  {
    id: 'f-lit-vuillard',
    isbn: '9782330072131',
    title: "L'Ordre du jour",
    authors: ['Éric Vuillard'],
    publisher: 'Actes Sud',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman historique', language: 'Français',
    price: 10.50, priceTTC: 15.90, format: '155 x 235 mm', pages: 160,
    publicationDate: '2017-08-23',
    description: "Prix Goncourt 2017. Comment vingt-quatre industriels allemands ont financé l'avènement du nazisme en une réunion de février 1933. Un récit glaçant.",
  },
  {
    id: 'f-lit-houellebecq',
    isbn: '9782081491083',
    title: 'Sérotonine',
    authors: ['Michel Houellebecq'],
    publisher: 'Flammarion',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 352,
    publicationDate: '2019-01-04',
    description: "Florent-Claude Labrouste, ingénieur agronome quadragénaire, abandonne tout et prend la fuite. Un roman sur le déclin, la mélancolie et la France rurale.",
    delaiReimp: '3 semaines',
  },
  {
    id: 'f-lit-rooney',
    isbn: '9782234089472',
    title: 'Normal People',
    authors: ['Sally Rooney'],
    publisher: 'Stock',
    universe: 'Littérature', type: 'fonds',
    genre: 'Romance', language: 'Anglais',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 368,
    publicationDate: '2020-01-08',
    description: "Connell et Marianne grandissent dans la même ville irlandaise mais dans des mondes différents. Une histoire d'amour complexe et bouleversante.",
  },
  {
    id: 'f-lit-perrin',
    isbn: '9782226392336',
    title: "Changer l'eau des fleurs",
    authors: ['Valérie Perrin'],
    publisher: 'Albin Michel',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 480,
    publicationDate: '2018-08-29',
    description: "Violette est gardienne d'un cimetière en Bourgogne. Sa vie semble figée jusqu'au jour où le passé refait surface. Un roman bouleversant sur la résilience.",
    topVente: true,
  },
  {
    id: 'f-lit-berest',
    isbn: '9782246821427',
    title: 'La Carte postale',
    authors: ['Anne Berest'],
    publisher: 'Grasset',
    universe: 'Littérature', type: 'fonds',
    genre: 'Biographie & Mémoires', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 528,
    publicationDate: '2021-08-18',
    description: "Une carte postale anonyme signée des noms de quatre membres de la famille morts à Auschwitz. Anne Berest reconstitue leur histoire — et la sienne.",
    selection: true,
  },
  {
    id: 'f-lit-vigan',
    isbn: '9782709664493',
    title: 'Les Gratitudes',
    authors: ['Delphine de Vigan'],
    publisher: 'JC Lattès',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 224,
    publicationDate: '2019-01-16',
    description: "Michka vieillit et perd les mots un à un. Marie et Jérémie, son orthophoniste, cherchent ensemble à honorer une promesse ancienne. Un roman d'une infinie douceur.",
  },
  {
    id: 'f-lit-musso',
    isbn: '9782246819714',
    title: 'La Jeune Femme et la Nuit',
    authors: ['Guillaume Musso'],
    publisher: 'Calmann-Lévy',
    universe: 'Littérature', type: 'fonds',
    genre: 'Romance', language: 'Français',
    price: 13.40, priceTTC: 20.90, format: '155 x 235 mm', pages: 384,
    publicationDate: '2018-03-28',
    description: "Vingt ans après leur jeunesse, trois anciens amis se retrouvent face à un mystère non résolu. Suspense, romance et secrets enfouis.",
    topVente: true,
  },
  {
    id: 'f-lit-slimani-pays',
    isbn: '9782072886423',
    title: 'Le Pays des autres',
    authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman historique', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 384,
    publicationDate: '2020-03-04',
    description: "T.1 de la Trilogie marocaine. Mathilde, Alsacienne, épouse un Marocain après-guerre et s'installe au Maroc. Un roman magnifique sur l'entre-deux et la liberté.",
  },
  {
    id: 'f-lit-slimani-danse',
    isbn: '9782072972812',
    title: 'Regardez-nous danser',
    authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman historique', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 384,
    publicationDate: '2022-03-03',
    description: "T.2 de la Trilogie marocaine. Les années 1960-1970, le Maroc de l'indépendance. La fille de Mathilde grandit entre deux mondes, entre deux désirs.",
  },
  {
    id: 'f-lit-tellier',
    isbn: '9782072762512',
    title: 'Toutes les familles heureuses',
    authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 288,
    publicationDate: '2017-09-07',
    description: "Vingt-trois personnages. Vingt-trois portraits qui forment une fresque kaléidoscopique sur la famille, le deuil et les liens qui se défont et se retissent.",
  },

  /* ══════════════════════════════════════════════════════
     FONDS — BD/Mangas (2016–2026)
  ══════════════════════════════════════════════════════ */

  /* ── My Hero Academia ── */
  {
    id: 's-mha-02',
    isbn: '9782344003459',
    title: 'My Hero Academia T.2',
    authors: ['Kōhei Horikoshi'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2016-01-27',
    description: "Izuku entre à U.A. High School et fait ses preuves lors des premières épreuves d'admission.",
    topVente: true,
  },
  {
    id: 's-mha-03',
    isbn: '9782344005002',
    title: 'My Hero Academia T.3',
    authors: ['Kōhei Horikoshi'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2016-04-13',
    description: "Le tournoi sportif de U.A. révèle les vrais talents de chaque élève.",
  },
  {
    id: 's-mha-04',
    isbn: '9782344006467',
    title: 'My Hero Academia T.4',
    authors: ['Kōhei Horikoshi'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2016-07-27',
    description: "Izuku obtient son premier stage en tant que héros professionnel auprès de Gran Torino.",
  },

  /* ── Demon Slayer ── */
  {
    id: 'f-bd-demon-01',
    isbn: '9782809491739',
    title: 'Demon Slayer T.1',
    authors: ['Koyoharu Gotouge'],
    publisher: 'Panini Manga', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.90, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2020-05-06',
    description: "Tanjiro Kamado, chasseur de démons, cherche un remède pour sa sœur transformée en démon. Le shōnen phénomène qui a conquis le monde entier.",
    topVente: true,
    selection: true,
  },
  {
    id: 'f-bd-demon-02',
    isbn: '9782809494013',
    title: 'Demon Slayer T.2',
    authors: ['Koyoharu Gotouge'],
    publisher: 'Panini Manga', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.90, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2020-07-01',
    description: "Tanjiro intègre le Corps des Pourfendeurs de Démons et affronte ses premiers adversaires redoutables.",
  },
  {
    id: 'f-bd-demon-03',
    isbn: '9782809494020',
    title: 'Demon Slayer T.3',
    authors: ['Koyoharu Gotouge'],
    publisher: 'Panini Manga', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.90, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2020-09-02',
    description: "L'arc du Tambour. Tanjiro et ses nouveaux compagnons Zenitsu et Inosuke font équipe pour la première fois.",
  },

  /* ── Jujutsu Kaisen ── */
  {
    id: 'f-bd-jjk-01',
    isbn: '9782355858437',
    title: 'Jujutsu Kaisen T.1',
    authors: ['Gege Akutami'],
    publisher: 'Ki-oon', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2021-02-03',
    description: "Yuji Itadori avale un doigt maudit et devient l'hôte d'un esprit maléfique. Bienvenue dans le monde des sorciers du Jujutsu.",
    delaiReimp: '2 semaines',
  },
  {
    id: 'f-bd-jjk-02',
    isbn: '9782355858444',
    title: 'Jujutsu Kaisen T.2',
    authors: ['Gege Akutami'],
    publisher: 'Ki-oon', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2021-04-07',
    description: "Yuji intègre l'École Métropolitaine de Magie de Tokyo et rencontre ses coéquipiers Megumi et Nobara.",
  },

  /* ── One-Punch Man ── */
  {
    id: 'f-bd-opm-01',
    isbn: '9782331024474',
    title: 'One-Punch Man T.1',
    authors: ['ONE', 'Yusuke Murata'],
    publisher: 'Kurokawa', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.90, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2016-01-07',
    description: "Saitama peut vaincre n'importe quel ennemi d'un seul coup de poing. Mais cette toute-puissance le plonge dans un ennui abyssal. Une parodie géniale du genre.",
    topVente: true,
  },

  /* ── Spy × Family ── */
  {
    id: 'f-bd-spy-01',
    isbn: '9782380711448',
    title: 'Spy × Family T.1',
    authors: ['Tatsuya Endo'],
    publisher: 'Kurokawa', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.90, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2020-10-07',
    description: "Un espion doit fonder une famille fictive pour accomplir sa mission secrète. Sa fille adoptive est télépathe et sa femme est une tueuse. Une comédie familiale explosive.",
    topVente: true,
  },
  {
    id: 'f-bd-spy-02',
    isbn: '9782380711455',
    title: 'Spy × Family T.2',
    authors: ['Tatsuya Endo'],
    publisher: 'Kurokawa', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.90, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2020-12-09',
    description: "Anya prépare l'examen d'entrée à Eden Academy. Entre mensonges et tendresse, la famille Forger trouve son rythme.",
  },

  /* ── Vinland Saga ── */
  {
    id: 'f-bd-vinland-01',
    isbn: '9782756093802',
    title: 'Vinland Saga T.1',
    authors: ['Makoto Yukimura'],
    publisher: 'Kurokawa', collection: 'Seinen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Seinen', language: 'Japonais',
    price: 10.00, priceTTC: 12.00, format: '115 x 175 mm', pages: 464,
    publicationDate: '2020-06-10',
    description: "Angleterre, XIe siècle. Thorfinn, fils de viking, jure de venger son père et de trouver la terre promise de Vinland. Une épopée historique magistrale.",
    selection: true,
  },

  /* ── La Légèreté ── */
  {
    id: 'f-bd-legerete',
    isbn: '9782205074833',
    title: 'La Légèreté',
    authors: ['Catherine Meurisse'],
    publisher: 'Dargaud',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '220 x 290 mm', pages: 128,
    publicationDate: '2016-01-22',
    description: "Rescapée de l'attentat de Charlie Hebdo, Catherine Meurisse raconte sa reconstruction. Un album poignant sur le retour à la vie et à la beauté.",
    selection: true,
  },

  /* ── L'Arabe du futur ── */
  {
    id: 'f-bd-arabe-04',
    isbn: '9782370733498',
    title: "L'Arabe du futur T.4",
    authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '220 x 290 mm', pages: 176,
    publicationDate: '2018-10-04',
    description: "Riad a 12 ans. Retour en France avec sa mère, choc culturel à rebours. L'un des meilleurs albums de la série autobiographique.",
  },
  {
    id: 'f-bd-arabe-05',
    isbn: '9782370737700',
    title: "L'Arabe du futur T.5",
    authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '220 x 290 mm', pages: 176,
    publicationDate: '2020-10-01',
    description: "Riad a 14 ans. L'adolescence en banlieue parisienne, les premières amours, et toujours ce sentiment d'être entre deux mondes.",
  },
  {
    id: 'f-bd-arabe-06',
    isbn: '9782370739512',
    title: "L'Arabe du futur T.6",
    authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '220 x 290 mm', pages: 176,
    publicationDate: '2022-10-20',
    description: "Le tome final de l'autobiographie de Riad Sattouf. Un récit bouleversant sur la construction de soi entre deux cultures.",
  },

  /* ── Les Cahiers d'Esther ── */
  {
    id: 'f-bd-esther-01',
    isbn: '9782370733047',
    title: "Les Cahiers d'Esther T.1 — Histoires de mes 10 ans",
    authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 9.50, priceTTC: 14.00, format: '220 x 290 mm', pages: 88,
    publicationDate: '2017-06-01',
    description: "Le journal illustré d'Esther, 10 ans. Humour, tendresse et regard sans filtre sur le monde des adultes.",
    topVente: true,
  },
  {
    id: 'f-bd-esther-02',
    isbn: '9782370734785',
    title: "Les Cahiers d'Esther T.2 — Histoires de mes 11 ans",
    authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 9.50, priceTTC: 14.00, format: '220 x 290 mm', pages: 88,
    publicationDate: '2018-06-07',
    description: "Esther a 11 ans et entre en 6e. L'école, les copines, les garçons — et une plume déjà acérée.",
  },

  /* ══════════════════════════════════════════════════════
     FONDS — Jeunesse (2016–2026)
  ══════════════════════════════════════════════════════ */

  {
    id: 'f-jes-animaux',
    isbn: '9782070585113',
    title: 'Les Animaux fantastiques',
    authors: ['J.K. Rowling'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 7.50, priceTTC: 11.20, format: '145 x 195 mm', pages: 256,
    publicationDate: '2016-11-18',
    description: "Le manuel illustré de magizoologie de Norbert Dragonneau, livre de cours à Poudlard. L'univers de J.K. Rowling dans toute sa richesse.",
    topVente: true,
  },

  /* ── La Passe-Miroir ── */
  {
    id: 'f-jes-passe-03',
    isbn: '9782070665167',
    title: 'La Passe-Miroir T.3 — La Mémoire de Babel',
    authors: ['Christelle Dabos'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Français',
    price: 9.50, priceTTC: 14.50, format: '145 x 215 mm', pages: 608,
    publicationDate: '2017-11-08',
    description: "Ophélie pénètre dans les Archives de Babel pour percer les secrets de l'Arche. Le troisième volet haletant de la saga fantasy franco-française.",
    selection: true,
  },
  {
    id: 'f-jes-passe-04',
    isbn: '9782070665174',
    title: 'La Passe-Miroir T.4 — La Tempête des échos',
    authors: ['Christelle Dabos'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Français',
    price: 9.50, priceTTC: 14.50, format: '145 x 215 mm', pages: 672,
    publicationDate: '2019-10-09',
    description: "L'épilogue de la saga. Ophélie doit affronter les échos du passé pour sauver les Arches. Une conclusion magistrale.",
  },

  /* ── Heartstopper ── */
  {
    id: 'f-jes-hearts-02',
    isbn: '9782017136698',
    title: 'Heartstopper T.2',
    authors: ['Alice Oseman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Roman jeunesse (9–12 ans)', language: 'Anglais',
    price: 10.00, priceTTC: 14.99, format: '145 x 215 mm', pages: 304,
    publicationDate: '2021-10-06',
    description: "Charlie et Nick approfondissent leur relation. Les questions d'identité, de coming-out et d'amitié se mêlent dans un roman graphique lumineux.",
  },
  {
    id: 'f-jes-hearts-03',
    isbn: '9782017175902',
    title: 'Heartstopper T.3',
    authors: ['Alice Oseman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Roman jeunesse (9–12 ans)', language: 'Anglais',
    price: 10.00, priceTTC: 14.99, format: '145 x 215 mm', pages: 320,
    publicationDate: '2022-04-06',
    description: "Charlie et Nick partent en voyage scolaire à Paris. Leur relation s'approfondit, entre bonheur et doutes. Le tome le plus romantique de la série.",
  },

  /* ── Six of Crows ── */
  {
    id: 'f-jes-six-01',
    isbn: '9782371023116',
    title: 'Six of Crows T.1',
    authors: ['Leigh Bardugo'],
    publisher: 'Lumen',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 13.20, priceTTC: 19.90, format: '145 x 215 mm', pages: 528,
    publicationDate: '2016-09-07',
    description: "Kaz Brekker, maître des bas-fonds de Ketterdam, réunit une équipe pour l'impossible casse de l'Ice Court. Fantasy dark et haletante.",
  },
  {
    id: 'f-jes-six-02',
    isbn: '9782371023123',
    title: 'Six of Crows T.2 — Le Château de verre',
    authors: ['Leigh Bardugo'],
    publisher: 'Lumen',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 13.20, priceTTC: 19.90, format: '145 x 215 mm', pages: 512,
    publicationDate: '2017-04-05',
    description: "Après le casse, trahisons et nouvelles alliances. La bande de Kaz doit faire face à des ennemis encore plus redoutables.",
  },

  /* ══════════════════════════════════════════════════════
     FONDS — Adulte-pratique (2016–2026)
  ══════════════════════════════════════════════════════ */

  {
    id: 'f-pra-01',
    isbn: '9782011355737',
    title: 'Le Grand Larousse de la cuisine',
    authors: ['Collectif Larousse'],
    publisher: 'Larousse',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Cuisine & Gastronomie', language: 'Français',
    price: 26.60, priceTTC: 39.95, format: '155 x 235 mm', pages: 896,
    publicationDate: '2020-09-09',
    description: "La référence culinaire absolue avec plus de 1 200 recettes de la gastronomie française.",
  },
  {
    id: 'f-pra-02',
    isbn: '9782019468422',
    title: 'Méthode Pilates complète',
    authors: ['Alice Pariaud'],
    publisher: 'Hachette Pratique',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Sport & Fitness', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 192,
    publicationDate: '2021-03-03',
    description: "Programme complet pour pratiquer le Pilates chez soi, pour tous les niveaux.",
  },
  {
    id: 'f-pra-atomic',
    isbn: '9782501156509',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Développement personnel', language: 'Anglais',
    price: 14.50, priceTTC: 21.90, format: '155 x 235 mm', pages: 320,
    publicationDate: '2020-01-08',
    description: "Comment de minuscules changements de comportement produisent des résultats remarquables. La méthode pour construire de bonnes habitudes.",
    topVente: true,
  },
  {
    id: 'f-pra-homo',
    isbn: '9782226393876',
    title: "Homo Deus — Une brève histoire de l'avenir",
    authors: ['Yuval Noah Harari'],
    publisher: 'Albin Michel',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Essai & Philosophie', language: 'Anglais',
    price: 16.50, priceTTC: 24.90, format: '155 x 235 mm', pages: 480,
    publicationDate: '2017-03-01',
    description: "Après l'humanité d'hier, Harari interroge l'humanité de demain : l'immortalité, la félicité artificielle et la montée des algorithmes.",
    delaiReimp: '3 semaines',
  },
  {
    id: 'f-pra-21',
    isbn: '9782226439000',
    title: '21 leçons pour le XXIe siècle',
    authors: ['Yuval Noah Harari'],
    publisher: 'Albin Michel',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Essai & Philosophie', language: 'Anglais',
    price: 16.50, priceTTC: 24.90, format: '155 x 235 mm', pages: 464,
    publicationDate: '2018-09-05',
    description: "Comment appréhender notre époque incertaine ? Harari examine les grands défis du présent : le travail, la liberté, l'égalité, la politique.",
  },
  {
    id: 'f-pra-factfulness',
    isbn: '9782221218532',
    title: 'Factfulness',
    authors: ['Hans Rosling', 'Ola Rosling', 'Anna Rosling Rönnlund'],
    publisher: 'Robert Laffont',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Essai & Philosophie', language: 'Suédois',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 352,
    publicationDate: '2019-01-09',
    description: "Pourquoi notre vision du monde est systématiquement fausse — et comment la corriger avec des données réelles. Le manifeste de la pensée factuelle.",
  },
  {
    id: 'f-pra-corps',
    isbn: '9782072918513',
    title: 'Le Corps — Guide pour les occupants',
    authors: ['Bill Bryson'],
    publisher: 'Gallimard',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Santé mentale', language: 'Anglais',
    price: 16.50, priceTTC: 24.90, format: '155 x 235 mm', pages: 480,
    publicationDate: '2020-09-03',
    description: "Un voyage fascinant à travers le corps humain : comment fonctionne-t-il, pourquoi tombe-t-il malade, et pourquoi est-il si extraordinaire ?",
  },
  {
    id: 'f-pra-ikigai',
    isbn: '9782501123990',
    title: 'Ikigaï — Les secrets des Japonais pour une longue vie heureuse',
    authors: ['Héctor García', 'Francesc Miralles'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Développement personnel', language: 'Espagnol',
    price: 9.50, priceTTC: 14.50, format: '145 x 195 mm', pages: 192,
    publicationDate: '2017-01-04',
    description: "L'ikigaï est la raison de se lever le matin. Ce livre explore le secret de la longévité et du bonheur des habitants d'Okinawa.",
    topVente: true,
  },
  {
    id: 'f-pra-attenborough',
    isbn: '9782501155229',
    title: 'Une vie sur notre planète',
    authors: ['David Attenborough'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Jardinage & Nature', language: 'Anglais',
    price: 14.50, priceTTC: 21.90, format: '155 x 235 mm', pages: 272,
    publicationDate: '2021-04-07',
    description: "Le témoignage visionnaire de David Attenborough sur les bouleversements qu'il a vécus en 90 ans, et ses espoirs pour l'avenir de la planète.",
    selection: true,
  },
]

/* ─── Statuts de stock — démo ─── */
const STOCK_OVERRIDES: Record<string, StockStatut> = {
  /* Stock limité */
  'f-lit-musso':      'stock_limite',
  'f-bd-demon-01':    'stock_limite',
  'f-pra-01':         'stock_limite',
  'n-jes-01':         'stock_limite',
  'n-pra-01':         'stock_limite',

  /* Sur commande */
  'f-lit-colombani':  'sur_commande',
  'f-lit-rooney':     'sur_commande',
  'f-jes-animaux':    'sur_commande',
  'f-bd-vinland-01':  'sur_commande',

  /* En réimpression */
  'f-lit-bourdeaut':  'en_reimp',
  'f-lit-houellebecq': 'en_reimp',
  'f-bd-jjk-01':      'en_reimp',
  'f-pra-homo':       'en_reimp',

  /* Rupture de stock */
  'f-lit-vigan':      'rupture',
  'f-bd-legerete':    'rupture',
  'n-lit-02':         'rupture',
  'n-bd-02':          'rupture',

  /* Épuisé */
  'f-bd-arabe-06':    'epuise',
  'f-lit-berest':     'epuise',
}

/* Statuts interdits pour une nouveauté */
const NOUVEAUTE_FORBIDDEN: readonly StockStatut[] = ['sur_commande', 'en_reimp']

function resolveStatut(book: Book): StockStatut {
  const override = STOCK_OVERRIDES[book.id]
  if (!override) return 'disponible'
  if (book.type === 'nouveaute' && NOUVEAUTE_FORBIDDEN.includes(override)) {
    return 'disponible'
  }
  return override
}

export const MOCK_BOOKS: Book[] = _RAW_MOCK_BOOKS.map(b =>
  b.type === 'a-paraitre'
    ? b
    : { ...b, statut: resolveStatut(b) }
)

/* ─── Helpers ─── */
export const UNIVERSES: Universe[] = ['BD/Mangas', 'Jeunesse', 'Littérature', 'Adulte-pratique']

export function getBookById(id: string): Book | undefined {
  return MOCK_BOOKS.find(b => b.id === id)
}

export function getBooksByType(type: BookType, universe?: Universe): Book[] {
  return MOCK_BOOKS.filter(b =>
    b.type === type && (universe ? b.universe === universe : true)
  )
}

export function searchBooks(query: string): Book[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return MOCK_BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.toLowerCase().includes(q)) ||
    b.publisher.toLowerCase().includes(q) ||
    b.isbn.includes(q) ||
    (b.collection?.toLowerCase().includes(q) ?? false) ||
    (b.genre?.toLowerCase().includes(q) ?? false)
  )
}
