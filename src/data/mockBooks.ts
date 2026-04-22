export type Universe = 'BD/Mangas' | 'Jeunesse' | 'Littérature' | 'Adulte-pratique'
export type BookType = 'nouveaute' | 'a-paraitre' | 'fonds'

export type StockStatut =
  | 'disponible'
  | 'stock_limite'
  | 'sur_commande'
  | 'en_reimp'
  | 'epuise'

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
  /* ─────────────────────────────
     NOUVEAUTÉS DU MOIS — Littérature
  ───────────────────────────────── */
  {
    id: 'n-lit-01',
    isbn: '9782072886447',
    title: "L'Anomalie",
    authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'nouveaute',
    genre: 'Fantasy & SF', language: 'Français',
    price: 14.10, priceTTC: 21.00, format: 'Grand format', pages: 336,
    publicationDate: '2026-03-05',
    description: "Prix Goncourt 2020. Un Boeing Air France traverse une zone de turbulences — puis atterrit une seconde fois trois mois plus tard, avec les mêmes passagers à bord.",
  },
  {
    id: 'n-lit-02',
    isbn: '9782072773396',
    title: 'Chanson douce',
    authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'nouveaute',
    genre: 'Polar & Thriller', language: 'Français',
    price: 13.40, priceTTC: 19.90, format: 'Grand format', pages: 240,
    publicationDate: '2026-02-12',
    description: "Prix Goncourt 2016. Myriam et Paul confient leurs enfants à Louise, une nounou douce et dévouée. Un roman haletant sur le désir de puissance.",
  },
  {
    id: 'n-lit-03',
    isbn: '9782283030066',
    title: 'Histoire du fils',
    authors: ['Marie-Hélène Lafon'],
    publisher: 'Buchet-Chastel',
    universe: 'Littérature', type: 'nouveaute',
    genre: 'Roman contemporain', language: 'Français',
    price: 11.70, priceTTC: 17.50, format: 'Grand format', pages: 192,
    publicationDate: '2026-04-02',
    description: "Prix Renaudot 2020. Sur un siècle et quatre générations, Marie-Hélène Lafon retrace l'histoire d'un fils naturel dans la France profonde du Cantal.",
  },
  /* ── Nouveautés BD/Mangas ── */
  {
    id: 'n-bd-01',
    isbn: '9782505079385',
    title: 'Kaguya-sama : Love is War T.1',
    authors: ['Aka Akasaka'],
    publisher: 'Pika Édition', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 7.99, format: 'Manga', pages: 192,
    publicationDate: '2026-03-20',
    description: "Kaguya et Miyuki s'aiment en secret mais aucun ne veut avouer en premier. Une comédie romantique au jeu psychologique savoureux.",
  },
  {
    id: 'n-bd-02',
    isbn: '9782344000656',
    title: 'My Hero Academia T.1',
    authors: ['Kōhei Horikoshi'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: 'Manga', pages: 192,
    publicationDate: '2026-02-26',
    description: "Dans un monde où 80% de la population possède un super-pouvoir, Izuku Midoriya est né sans pouvoir. Un shōnen épique sur le dépassement de soi.",
  },
  {
    id: 'n-bd-03',
    isbn: '9782370730220',
    title: 'Le Voyageur des confins T.1',
    authors: ['Marc Delacroix'],
    publisher: 'Dargaud',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Roman graphique', language: 'Français',
    price: 10.00, priceTTC: 14.99, format: 'Album', pages: 160,
    publicationDate: '2026-04-09',
    description: "Un jeune dessinateur retrace son périple à travers les déserts du monde, entre récit initiatique et carnet de voyage. Une œuvre graphique saisissante.",
  },
  /* ── Nouveautés Jeunesse ── */
  {
    id: 'n-jes-01',
    isbn: '9782070619061',
    title: 'Le Petit Nicolas',
    authors: ['René Goscinny', 'Jean-Jacques Sempé'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'nouveaute',
    genre: 'Humour', language: 'Français',
    price: 5.10, priceTTC: 7.60, format: 'Poche illustré', pages: 160,
    publicationDate: '2026-03-15',
    description: "Les aventures hilarantes du petit Nicolas, de ses copains et de ses parents. Un classique de la littérature jeunesse française indémodable.",
  },
  {
    id: 'n-jes-02',
    isbn: '9782070514830',
    title: 'Matilda',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'nouveaute',
    genre: 'Humour', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 256,
    publicationDate: '2026-02-05',
    description: "Matilda est une petite fille extraordinaire dont les parents n'ont rien remarqué. Un roman de Roald Dahl plein d'humour et de magie.",
  },
  /* ── Nouveautés Adulte-pratique ── */
  {
    id: 'n-pra-01',
    isbn: '9782812303067',
    title: "Pâtisserie — L'ultime référence",
    authors: ['Christophe Felder'],
    publisher: 'La Martinière',
    universe: 'Adulte-pratique', type: 'nouveaute',
    genre: 'Cuisine & Gastronomie', language: 'Français',
    price: 39.90, priceTTC: 59.90, format: 'Grand format', pages: 896,
    publicationDate: '2026-03-26',
    description: "La référence absolue de la pâtisserie française par le chef alsacien Christophe Felder. Plus de 200 recettes détaillées pas à pas.",
  },
  {
    id: 'n-pra-02',
    isbn: '9782035876614',
    title: 'Guide Larousse du jardinage et du potager',
    authors: ['Collectif Larousse'],
    publisher: 'Larousse',
    universe: 'Adulte-pratique', type: 'nouveaute',
    genre: 'Jardinage & Nature', language: 'Français',
    price: 19.90, priceTTC: 29.90, format: 'Grand format', pages: 400,
    publicationDate: '2026-01-15',
    description: "Tout ce qu'il faut savoir pour créer et entretenir un jardin d'ornement et un potager. Des conseils pratiques mois par mois.",
  },

  /* ─────────────────────────────
     À PARAÎTRE
  ───────────────────────────────── */
  {
    id: 'ap-lit-01',
    isbn: '9782818056868',
    title: 'Triste Tigre',
    authors: ['Neige Sinno'],
    publisher: 'P.O.L',
    universe: 'Littérature', type: 'a-paraitre',
    genre: 'Biographie & Mémoires', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: 'Grand format', pages: 272,
    publicationDate: '2026-05-15',
    description: "Prix Renaudot 2023. Neige Sinno affronte avec une lucidité glaçante les années d'inceste subies dans l'enfance.",
    programme: 'Avril–Juin 2026',
  },
  {
    id: 'ap-bd-01',
    isbn: '9782864972891',
    title: 'Astérix T.39 — Astérix et le Griffon',
    authors: ['Fabcaro', 'Didier Conrad'],
    publisher: 'Albert René', collection: 'Astérix',
    universe: 'BD/Mangas', type: 'a-paraitre',
    genre: 'BD franco-belge', language: 'Français',
    price: 7.30, priceTTC: 10.95, format: 'Album', pages: 48,
    publicationDate: '2026-06-12',
    description: "Astérix et Obélix partent en expédition dans les steppes de Sarmatie à la recherche du mystérieux griffon.",
    programme: 'Avril–Juin 2026',
  },
  {
    id: 'ap-jes-01',
    isbn: '9782070615667',
    title: 'Tobie Lolness T.1 — La Vie suspendue',
    authors: ['Timothée de Fombelle'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse', type: 'a-paraitre',
    genre: 'Fantasy jeunesse', language: 'Français',
    price: 10.60, priceTTC: 15.90, format: 'Roman jeunesse', pages: 288,
    publicationDate: '2026-09-03',
    description: "Tobie Lolness mesure 1,5 millimètre. Il vit dans un arbre gigantesque, dans un monde miniature.",
    programme: 'Juillet–Septembre 2026',
  },
  {
    id: 'ap-pra-01',
    isbn: '9782913366657',
    title: 'Méditer jour après jour',
    authors: ['Christophe André'],
    publisher: "L'Iconoclaste",
    universe: 'Adulte-pratique', type: 'a-paraitre',
    genre: 'Médecines douces', language: 'Français',
    price: 17.90, priceTTC: 25.00, format: 'Grand format', pages: 288,
    publicationDate: '2026-08-27',
    description: "Le best-seller de Christophe André sur la méditation de pleine conscience. Illustré par 25 œuvres d'art.",
    programme: 'Juillet–Septembre 2026',
  },
  {
    id: 'ap-lit-02',
    isbn: '9782072999901',
    title: 'La Disparition de Josef Mengele',
    authors: ['Olivier Guez'],
    publisher: 'Grasset',
    universe: 'Littérature', type: 'a-paraitre',
    genre: 'Roman historique', language: 'Français',
    price: 14.00, priceTTC: 20.90, format: 'Grand format', pages: 240,
    publicationDate: '2026-07-08',
    description: "Comment le plus célèbre criminel nazi a réussi à vivre libre et impuni en Amérique du Sud pendant trente ans.",
    programme: 'Juillet–Septembre 2026',
    fictif: true,
  },

  /* ─────────────────────────────
     FONDS — Littérature
  ───────────────────────────────── */
  {
    id: 'f-lit-01',
    isbn: '9782070360024',
    title: "L'Étranger",
    authors: ['Albert Camus'],
    publisher: 'Gallimard', collection: 'Folio',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 4.90, priceTTC: 7.30, format: 'Poche', pages: 192,
    publicationDate: '1942-01-01',
    description: "Roman fondateur de l'absurde, chef-d'œuvre de la littérature française du XXe siècle.",
  },
  {
    id: 'f-lit-02',
    isbn: '9782070408504',
    title: 'Le Petit Prince',
    authors: ['Antoine de Saint-Exupéry'],
    publisher: 'Gallimard', collection: 'Folio Junior',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 5.20, priceTTC: 7.80, format: 'Poche', pages: 128,
    publicationDate: '1943-01-01',
    description: "Le livre le plus traduit au monde après la Bible. Un conte philosophique intemporel.",
  },
  {
    id: 'f-lit-03',
    isbn: '9782253004226',
    title: 'Notre-Dame de Paris',
    authors: ['Victor Hugo'],
    publisher: 'Livre de Poche', collection: 'Classiques',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman historique', language: 'Français',
    price: 5.90, priceTTC: 8.80, format: 'Poche', pages: 736,
    publicationDate: '1831-01-01',
    description: "Le roman historique le plus célèbre de Victor Hugo, autour de la cathédrale de Paris.",
  },
  {
    id: 'f-lit-miserable',
    isbn: '9782253004318',
    title: 'Les Misérables',
    authors: ['Victor Hugo'],
    publisher: 'Livre de Poche', collection: 'Classiques',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman historique', language: 'Français',
    price: 6.90, priceTTC: 10.30, format: 'Poche', pages: 1664,
    publicationDate: '1862-01-01',
    description: "Jean Valjean, le forçat, et l'inspecteur Javert dans la France du XIXe siècle. L'œuvre maîtresse de Victor Hugo.",
  },
  {
    id: 'f-lit-bovary',
    isbn: '9782070413119',
    title: 'Madame Bovary',
    authors: ['Gustave Flaubert'],
    publisher: 'Gallimard', collection: 'Folio',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 5.90, priceTTC: 8.80, format: 'Poche', pages: 464,
    publicationDate: '1857-01-01',
    description: "Emma Bovary rêve d'une vie meilleure et se perd dans ses illusions romantiques. Chef-d'œuvre du réalisme français.",
  },
  {
    id: 'f-lit-vargas',
    isbn: '9782290349878',
    title: 'Sous les vents de Neptune',
    authors: ['Fred Vargas'],
    publisher: "J'ai lu", collection: 'Policier',
    universe: 'Littérature', type: 'fonds',
    genre: 'Polar & Thriller', language: 'Français',
    price: 7.40, priceTTC: 8.90, format: 'Poche', pages: 448,
    publicationDate: '2005-01-01',
    description: "Le commissaire Adamsberg traque un tueur en série au Canada. Fred Vargas au sommet de son art — une intrigue policière haletante.",
  },
  {
    id: 'f-lit-millenium',
    isbn: '9782742760015',
    title: "Millénium T.1 — Les Hommes qui n'aimaient pas les femmes",
    authors: ['Stieg Larsson'],
    publisher: 'Actes Sud',
    universe: 'Littérature', type: 'fonds',
    genre: 'Polar & Thriller', language: 'Suédois',
    price: 10.50, priceTTC: 15.90, format: 'Poche', pages: 672,
    publicationDate: '2006-01-01',
    description: "Lisbeth Salander, hackeuse asociale, et le journaliste Mikael Blomkvist s'associent pour élucider une disparition vieille de 40 ans.",
  },
  {
    id: 'f-lit-sapiens',
    isbn: '9782226257017',
    title: "Sapiens — Une brève histoire de l'humanité",
    authors: ['Yuval Noah Harari'],
    publisher: 'Albin Michel',
    universe: 'Littérature', type: 'fonds',
    genre: 'Essai & Philosophie', language: 'Anglais',
    price: 14.20, priceTTC: 25.00, format: 'Grand format', pages: 512,
    publicationDate: '2015-01-01',
    description: "Comment Homo sapiens a conquis la planète en 70 000 ans ? Une fresque vertigineuse de l'histoire humaine.",
  },
  {
    id: 'f-lit-alchimiste',
    isbn: '9782290004050',
    title: "L'Alchimiste",
    authors: ['Paulo Coelho'],
    publisher: "J'ai lu",
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Portugais',
    price: 6.50, priceTTC: 7.90, format: 'Poche', pages: 192,
    publicationDate: '1996-01-01',
    description: "Santiago, un jeune berger andalou, part vers l'Égypte à la recherche d'un trésor. Un roman initiatique traduit en 80 langues.",
  },
  {
    id: 'f-lit-gatsby',
    isbn: '9782072893162',
    title: 'Gatsby le Magnifique',
    authors: ['F. Scott Fitzgerald'],
    publisher: 'Gallimard', collection: 'Folio',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman historique', language: 'Anglais',
    price: 6.90, priceTTC: 9.90, format: 'Poche', pages: 256,
    publicationDate: '1925-01-01',
    description: "Le mystérieux Jay Gatsby et son amour impossible pour Daisy, dans l'Amérique des années folles. Le roman américain par excellence.",
  },
  {
    id: 'f-lit-musso',
    isbn: '9782246819714',
    title: 'La Jeune Femme et la Nuit',
    authors: ['Guillaume Musso'],
    publisher: 'Calmann-Lévy',
    universe: 'Littérature', type: 'fonds',
    genre: 'Romance', language: 'Français',
    price: 13.40, priceTTC: 20.90, format: 'Grand format', pages: 384,
    publicationDate: '2018-01-01',
    description: "Vingt ans après leur jeunesse, trois anciens amis se retrouvent face à un mystère non résolu. Suspense, romance et secrets enfouis.",
  },

  /* ─────────────────────────────
     FONDS — BD/Mangas
  ───────────────────────────────── */
  {
    id: 'f-bd-01',
    isbn: '9782203001046',
    title: 'Tintin au Tibet',
    authors: ['Hergé'],
    publisher: 'Casterman', collection: 'Les Aventures de Tintin',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 8.70, priceTTC: 12.99, format: 'Album', pages: 64,
    publicationDate: '1960-01-01',
    description: "L'album le plus personnel d'Hergé, une ode à l'amitié dans les sommets himalayens.",
  },
  {
    id: 'f-bd-02',
    isbn: '9782012101517',
    title: 'Astérix chez les Bretons',
    authors: ['René Goscinny', 'Albert Uderzo'],
    publisher: 'Albert René', collection: 'Astérix',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 7.30, priceTTC: 10.95, format: 'Album', pages: 48,
    publicationDate: '1966-01-01',
    description: "Astérix traverse la Manche pour prêter main-forte à ses cousins les Bretons.",
  },
  {
    id: 'f-bd-xiii',
    isbn: '9782800101897',
    title: 'XIII T.1 — La Nuit du 3 août',
    authors: ['Jean Van Hamme', 'William Vance'],
    publisher: 'Dargaud', collection: 'XIII',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 10.50, priceTTC: 15.99, format: 'Album', pages: 48,
    publicationDate: '1984-01-01',
    description: "Un homme amnésique survit à une tentative de meurtre. Tatoué du chiffre XIII, il cherche à reconstituer son identité.",
  },
  {
    id: 'f-bd-spirou',
    isbn: '9782800100951',
    title: 'Spirou et Fantasio T.1',
    authors: ['André Franquin'],
    publisher: 'Dupuis', collection: 'Spirou et Fantasio',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 8.70, priceTTC: 13.00, format: 'Album', pages: 64,
    publicationDate: '1950-01-01',
    description: "Les premières aventures de Spirou et de son fidèle ami Fantasio, signées Franquin.",
  },
  {
    id: 'f-bd-naruto',
    isbn: '9782723469890',
    title: 'Naruto T.1',
    authors: ['Masashi Kishimoto'],
    publisher: 'Kana', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.95, format: 'Manga', pages: 186,
    publicationDate: '2002-09-01',
    description: "Naruto Uzumaki, jeune ninja rêvant de devenir Hokage, porte en lui le sceau d'un démon renard.",
  },
  {
    id: 'f-bd-onepiece',
    isbn: '9782723471015',
    title: "One Piece T.1 — À l'aube d'une grande aventure",
    authors: ['Eiichiro Oda'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: 'Manga', pages: 216,
    publicationDate: '2000-10-01',
    description: "Luffy mange le fruit du démon et devient un homme de caoutchouc. Il rêve de devenir le roi des pirates.",
  },
  {
    id: 'f-bd-dragonball',
    isbn: '9782723428521',
    title: 'Dragon Ball T.1',
    authors: ['Akira Toriyama'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: 'Manga', pages: 192,
    publicationDate: '1993-07-01',
    description: "Son Goku part à la recherche des Dragon Balls. Le manga fondateur du shōnen moderne.",
  },
  {
    id: 'f-bd-fruits-basket',
    isbn: '9782723459846',
    title: 'Fruits Basket T.1',
    authors: ['Natsuki Takaya'],
    publisher: 'Delcourt', collection: 'Sakura',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōjo', language: 'Japonais',
    price: 6.50, priceTTC: 7.99, format: 'Manga', pages: 192,
    publicationDate: '2003-01-01',
    description: "Tohru Honda découvre que la famille Sohma est maudite : chaque membre se transforme en animal du zodiaque chinois au contact d'une personne du sexe opposé.",
    fictif: true,
  },
  {
    id: 'f-bd-nana',
    isbn: '9782723459901',
    title: 'Nana T.1',
    authors: ['Ai Yazawa'],
    publisher: 'Delcourt', collection: 'Sakura',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōjo', language: 'Japonais',
    price: 6.50, priceTTC: 7.99, format: 'Manga', pages: 192,
    publicationDate: '2005-01-01',
    description: "Deux jeunes femmes prénommées Nana se rencontrent dans un train vers Tokyo. Leurs destins vont se croiser pour toujours. Shōjo culte.",
    fictif: true,
  },
  /* Tintin */
  {
    id: 's-ttn-01',
    isbn: '9782203001015',
    title: 'Tintin en Amérique',
    authors: ['Hergé'],
    publisher: 'Casterman', collection: 'Les Aventures de Tintin',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 8.70, priceTTC: 12.99, format: 'Album', pages: 64,
    publicationDate: '1932-01-01',
    description: "Tintin part enquêter aux États-Unis, au cœur de la mafia de Chicago.",
  },
  {
    id: 's-ttn-02',
    isbn: '9782203001084',
    title: 'Le Lotus Bleu',
    authors: ['Hergé'],
    publisher: 'Casterman', collection: 'Les Aventures de Tintin',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 8.70, priceTTC: 12.99, format: 'Album', pages: 64,
    publicationDate: '1936-01-01',
    description: "Tintin part en Chine sur les traces d'un mystérieux trafic d'opium. L'album du tournant dans l'œuvre d'Hergé.",
  },
  {
    id: 's-ttn-03',
    isbn: '9782203001206',
    title: 'Le Trésor de Rackham le Rouge',
    authors: ['Hergé'],
    publisher: 'Casterman', collection: 'Les Aventures de Tintin',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 8.70, priceTTC: 12.99, format: 'Album', pages: 64,
    publicationDate: '1945-01-01',
    description: "Tintin, Haddock et Tournesol partent à la recherche du trésor du pirate Rackham le Rouge.",
  },
  /* Astérix */
  {
    id: 's-ast-01',
    isbn: '9782012101449',
    title: 'La Zizanie',
    authors: ['René Goscinny', 'Albert Uderzo'],
    publisher: 'Albert René', collection: 'Astérix',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 7.30, priceTTC: 10.95, format: 'Album', pages: 48,
    publicationDate: '1970-01-01',
    description: "Un envoyé de César sème la discorde dans le village gaulois.",
  },
  {
    id: 's-ast-02',
    isbn: '9782012101951',
    title: 'Astérix chez les Belges',
    authors: ['René Goscinny', 'Albert Uderzo'],
    publisher: 'Albert René', collection: 'Astérix',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 7.30, priceTTC: 10.95, format: 'Album', pages: 48,
    publicationDate: '1979-01-01',
    description: "Le dernier album de Goscinny. César prétend que les Belges sont les plus courageux des peuples.",
  },
  /* Largo Winch */
  {
    id: 's-lw-01',
    isbn: '9782800125558',
    title: "L'Héritier",
    authors: ['Jean Van Hamme', 'Philippe Francq'],
    publisher: 'Dupuis', collection: 'Largo Winch',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 10.50, priceTTC: 15.99, format: 'Album', pages: 48,
    publicationDate: '1992-01-01',
    description: "Largo Winch hérite d'un empire financier colossal. Mais quelqu'un veut sa mort.",
  },
  {
    id: 's-lw-02',
    isbn: '9782800134017',
    title: 'Le Groupe W',
    authors: ['Jean Van Hamme', 'Philippe Francq'],
    publisher: 'Dupuis', collection: 'Largo Winch',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 10.50, priceTTC: 15.99, format: 'Album', pages: 48,
    publicationDate: '1993-01-01',
    description: "Largo prend le contrôle du Groupe W et doit affronter des ennemis de l'intérieur.",
  },
  {
    id: 's-lw-03',
    isbn: '9782800135601',
    title: 'O.P.A.',
    authors: ['Jean Van Hamme', 'Philippe Francq'],
    publisher: 'Dupuis', collection: 'Largo Winch',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'BD franco-belge', language: 'Français',
    price: 10.50, priceTTC: 15.99, format: 'Album', pages: 48,
    publicationDate: '1994-01-01',
    description: "Une OPA hostile menace le Groupe W. Largo doit manœuvrer dans les coulisses de la finance mondiale.",
  },
  /* My Hero Academia */
  {
    id: 's-mha-02',
    isbn: '9782344003459',
    title: 'My Hero Academia T.2',
    authors: ['Kōhei Horikoshi'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: 'Manga', pages: 192,
    publicationDate: '2016-01-27',
    description: "Izuku entre à U.A. High School et fait ses preuves lors des premières épreuves d'admission.",
  },
  {
    id: 's-mha-03',
    isbn: '9782344005002',
    title: 'My Hero Academia T.3',
    authors: ['Kōhei Horikoshi'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 5.95, priceTTC: 6.99, format: 'Manga', pages: 192,
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
    price: 5.95, priceTTC: 6.99, format: 'Manga', pages: 192,
    publicationDate: '2016-07-27',
    description: "Izuku obtient son premier stage en tant que héros professionnel auprès de Gran Torino.",
  },

  /* ─────────────────────────────
     FONDS — Jeunesse
  ───────────────────────────────── */
  {
    id: 'f-jes-01',
    isbn: '9782070584628',
    title: "Harry Potter à l'école des sorciers",
    authors: ['J.K. Rowling'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 7.50, priceTTC: 11.20, format: 'Poche', pages: 320,
    publicationDate: '1998-10-01',
    description: "Le début de l'aventure magique de Harry Potter — un incontournable de la librairie.",
  },
  {
    id: 'f-jes-02',
    isbn: '9782070625734',
    title: "Le Lion, la Sorcière Blanche et l'Armoire Magique",
    authors: ['C.S. Lewis'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche', pages: 224,
    publicationDate: '1950-01-01',
    description: "Le premier volume des Chroniques de Narnia, un classique de la fantasy jeunesse.",
  },
  {
    id: 'f-jes-charlie',
    isbn: '9782070584819',
    title: 'Charlie et la Chocolaterie',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Humour', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 192,
    publicationDate: '1988-01-01',
    description: "Charlie Bucket gagne un ticket d'or pour visiter l'usine du mystérieux chocolatier Willy Wonka.",
  },
  {
    id: 'f-jes-jules-verne',
    isbn: '9782070415403',
    title: 'Vingt Mille Lieues sous les mers',
    authors: ['Jules Verne'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Aventure', language: 'Français',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 416,
    publicationDate: '1989-01-01',
    description: "Le professeur Aronnax explore les océans à bord du Nautilus du mystérieux capitaine Nemo.",
  },
  /* Harry Potter */
  {
    id: 's-hp-02',
    isbn: '9782070584635',
    title: 'Harry Potter et la Chambre des Secrets',
    authors: ['J.K. Rowling'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 7.50, priceTTC: 11.20, format: 'Poche', pages: 352,
    publicationDate: '1999-03-03',
    description: "Harry retourne à Poudlard et découvre une chambre secrète dont les dangers menacent toute l'école.",
  },
  {
    id: 's-hp-03',
    isbn: '9782070584642',
    title: "Harry Potter et le Prisonnier d'Azkaban",
    authors: ['J.K. Rowling'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 7.50, priceTTC: 11.20, format: 'Poche', pages: 448,
    publicationDate: '1999-09-09',
    description: "Un dangereux criminel s'est échappé d'Azkaban. Harry découvre de nouveaux secrets sur son passé.",
  },
  {
    id: 's-hp-04',
    isbn: '9782070584659',
    title: 'Harry Potter et la Coupe de Feu',
    authors: ['J.K. Rowling'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 8.90, priceTTC: 13.30, format: 'Poche', pages: 768,
    publicationDate: '2000-07-08',
    description: "Harry est mystérieusement inscrit dans le Tournoi des Trois Sorciers. La menace de Voldemort se précise.",
  },
  /* Petit Nicolas */
  {
    id: 's-nic-02',
    isbn: '9782070619108',
    title: 'Les Vacances du Petit Nicolas',
    authors: ['René Goscinny', 'Jean-Jacques Sempé'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Humour', language: 'Français',
    price: 5.10, priceTTC: 7.60, format: 'Poche illustré', pages: 160,
    publicationDate: '1962-01-01',
    description: "Nicolas part en vacances à la mer avec sa famille. Les aventures estivales hilarantes du petit héros.",
  },
  {
    id: 's-nic-03',
    isbn: '9782070619115',
    title: 'Le Petit Nicolas et les copains',
    authors: ['René Goscinny', 'Jean-Jacques Sempé'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Humour', language: 'Français',
    price: 5.10, priceTTC: 7.60, format: 'Poche illustré', pages: 160,
    publicationDate: '1963-01-01',
    description: "Nicolas et sa bande de copains enchaînent les bêtises à l'école et dans le quartier.",
  },
  /* Roald Dahl */
  {
    id: 'fictif-rd-01',
    isbn: '9782070589001',
    title: 'James et la Grosse Pêche',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Humour', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 176,
    publicationDate: '2026-03-12',
    description: "James Henry Trotter s'échappe de sa vie misérable à bord d'une pêche géante peuplée d'insectes géants bienveillants.",
    fictif: true,
  },
  {
    id: 'fictif-rd-02',
    isbn: '9782070589002',
    title: 'Les Deux Gredins',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Humour', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 112,
    publicationDate: '2025-11-19',
    description: "Deux enfants terribles face à leurs affreux grands-parents. Un conte noir et hilarant signé Roald Dahl.",
    fictif: true,
  },
  {
    id: 'fictif-rd-03',
    isbn: '9782070589003',
    title: 'Le BGG — Le Bon Gros Géant',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 256,
    publicationDate: '2025-07-02',
    description: "Sophie est enlevée par un géant — mais celui-ci est gentil et ne mange pas les enfants.",
    fictif: true,
  },
  {
    id: 'fictif-rd-04',
    isbn: '9782070589004',
    title: 'La Potion magique de Georges Bouillon',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Humour', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 128,
    publicationDate: '2025-02-18',
    description: "Georges fabrique une potion révolutionnaire pour transformer sa grand-mère acariâtre.",
    fictif: true,
  },
  {
    id: 'fictif-rd-05',
    isbn: '9782070589005',
    title: 'Sacrées sorcières',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse', collection: 'Folio Junior',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 5.90, priceTTC: 8.80, format: 'Poche illustré', pages: 208,
    publicationDate: '2024-10-23',
    description: "Les vraies sorcières détestent les enfants et veulent les transformer en souris.",
    fictif: true,
  },

  /* ─────────────────────────────
     FONDS — Adulte-pratique
  ───────────────────────────────── */
  {
    id: 'f-pra-01',
    isbn: '9782011355737',
    title: 'Le Grand Larousse de la cuisine',
    authors: ['Collectif Larousse'],
    publisher: 'Larousse',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Cuisine & Gastronomie', language: 'Français',
    price: 26.60, priceTTC: 39.95, format: 'Grand format', pages: 896,
    publicationDate: '2020-09-01',
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
    price: 13.20, priceTTC: 19.90, format: 'Grand format', pages: 192,
    publicationDate: '2021-03-01',
    description: "Programme complet pour pratiquer le Pilates chez soi, pour tous les niveaux.",
  },
  {
    id: 'f-pra-cyrulnik',
    isbn: '9782738108685',
    title: 'Un merveilleux malheur',
    authors: ['Boris Cyrulnik'],
    publisher: 'Odile Jacob',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Psychologie & Psychanalyse', language: 'Français',
    price: 9.50, priceTTC: 11.00, format: 'Poche', pages: 240,
    publicationDate: '2002-01-01',
    description: "Comment certains êtres humains parviennent-ils à se reconstruire après un traumatisme ? Boris Cyrulnik explore le concept de résilience.",
  },
  {
    id: 'f-pra-andre-etats',
    isbn: '9782738117595',
    title: "Les États d'âme — Un apprentissage de la sérénité",
    authors: ['Christophe André'],
    publisher: 'Odile Jacob',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Psychologie & Psychanalyse', language: 'Français',
    price: 13.50, priceTTC: 19.00, format: 'Grand format', pages: 432,
    publicationDate: '2009-01-01',
    description: "Christophe André invite à comprendre et apprivoiser ses émotions pour gagner en équilibre intérieur et en sérénité.",
  },
  {
    id: 'f-pra-power-of-now',
    isbn: '9782290349625',
    title: "Le Pouvoir du moment présent",
    authors: ['Eckhart Tolle'],
    publisher: "J'ai lu",
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Développement personnel', language: 'Anglais',
    price: 7.40, priceTTC: 8.90, format: 'Poche', pages: 256,
    publicationDate: '2000-01-01',
    description: "Guide spirituel sur la pleine conscience et l'importance de vivre dans l'instant présent. Un best-seller mondial traduit en 33 langues.",
  },
  {
    id: 'f-pra-atomic-habits',
    isbn: '9782501156509',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Développement personnel', language: 'Anglais',
    price: 14.50, priceTTC: 21.90, format: 'Grand format', pages: 320,
    publicationDate: '2020-01-01',
    description: "Comment de minuscules changements de comportement produisent des résultats remarquables. La méthode pour construire de bonnes habitudes.",
  },
  {
    id: 'f-pra-gut',
    isbn: '9782501113762',
    title: "Le Charme discret de l'intestin",
    authors: ['Giulia Enders'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Santé mentale', language: 'Allemand',
    price: 9.50, priceTTC: 11.90, format: 'Poche', pages: 320,
    publicationDate: '2015-01-01',
    description: "Tout ce que votre intestin a toujours voulu vous dire — le lien entre microbiote, cerveau et bien-être émotionnel. Un best-seller mondial.",
  },
  {
    id: 'f-pra-yoga',
    isbn: '9782019469023',
    title: 'Yoga — La voie de la transformation',
    authors: ['Lucas Bertrand'],
    publisher: 'Hachette Pratique',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Médecines douces', language: 'Français',
    price: 14.00, priceTTC: 20.90, format: 'Grand format', pages: 224,
    publicationDate: '2022-03-01',
    description: "Un guide complet pour débuter et progresser en yoga : postures, respirations, méditation et philosophie.",
    fictif: true,
  },

  /* ═════════════════════════════════════════════════════
     TITRES FICTIFS — Hervé Le Tellier
  ═════════════════════════════════════════════════════ */
  {
    id: 'fictif-hlt-01', isbn: '9782072999001',
    title: 'Le Miroir des Infinies', authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Fantasy & SF', language: 'Français',
    price: 14.10, priceTTC: 21.00, format: 'Grand format', pages: 312,
    publicationDate: '2026-01-08',
    description: 'Un mathématicien découvre que chaque décision crée un univers parallèle. Plongée vertigineuse dans les bifurcations du réel.', fictif: true,
  },
  {
    id: 'fictif-hlt-02', isbn: '9782072999002',
    title: "Fragments d'un monde possible", authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.40, priceTTC: 19.90, format: 'Grand format', pages: 288,
    publicationDate: '2025-09-03',
    description: 'Quinze portraits de personnages qui ne se rencontreront jamais, tissés par une logique secrète et implacable.', fictif: true,
  },
  {
    id: 'fictif-hlt-03', isbn: '9782072999003',
    title: 'La Dernière Conjecture', authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Polar & Thriller', language: 'Français',
    price: 14.10, priceTTC: 21.00, format: 'Grand format', pages: 354,
    publicationDate: '2025-04-22',
    description: 'Un logicien reçoit une lettre prédisant sa mort. Roman policier et philosophique sur la vérité et le mensonge.', fictif: true,
  },
  {
    id: 'fictif-hlt-04', isbn: '9782072999004',
    title: "Portraits de l'absent", authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 12.80, priceTTC: 19.00, format: 'Grand format', pages: 224,
    publicationDate: '2025-01-15',
    description: "Après la disparition d'un homme ordinaire, ses proches reconstituent son portrait — et découvrent qu'ils ne le connaissaient pas.", fictif: true,
  },
  {
    id: 'fictif-hlt-05', isbn: '9782072999005',
    title: 'Théorème du vide', authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Fantasy & SF', language: 'Français',
    price: 14.10, priceTTC: 21.00, format: 'Grand format', pages: 298,
    publicationDate: '2024-11-06',
    description: 'Un roman où chaque chapitre efface le précédent. Exploration radicale des limites de la narration.', fictif: true,
  },

  /* ═════════════════════════════════════════════════════
     TITRES FICTIFS — Leïla Slimani
  ═════════════════════════════════════════════════════ */
  {
    id: 'fictif-ls-01', isbn: '9782072999010',
    title: 'La Maison des femmes', authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.40, priceTTC: 19.90, format: 'Grand format', pages: 256,
    publicationDate: '2026-02-19',
    description: 'Dans une villa marocaine, trois générations de femmes se retrouvent après un deuil. Un roman sur la transmission et la liberté.', fictif: true,
  },
  {
    id: 'fictif-ls-02', isbn: '9782072999011',
    title: 'Soleil de nuit', authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 14.10, priceTTC: 21.00, format: 'Grand format', pages: 288,
    publicationDate: '2025-10-08',
    description: "Une femme fuit son pays pour une ville européenne sans passé. Roman sur l'identité, l'exil et la réinvention de soi.", fictif: true,
  },
  {
    id: 'fictif-ls-03', isbn: '9782072999012',
    title: 'Le Territoire des autres', authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.40, priceTTC: 19.90, format: 'Grand format', pages: 240,
    publicationDate: '2025-05-21',
    description: "Portrait d'une communauté d'expatriés au Maroc — étrangers chez eux, étrangers partout.", fictif: true,
  },
  {
    id: 'fictif-ls-04', isbn: '9782072999013',
    title: 'Corps étrangers', authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Polar & Thriller', language: 'Français',
    price: 12.80, priceTTC: 19.00, format: 'Grand format', pages: 208,
    publicationDate: '2025-02-12',
    description: "Récit haletant sur une médecin confrontée à une épidémie silencieuse dans un quartier parisien.", fictif: true,
  },
  {
    id: 'fictif-ls-06', isbn: '9782072999015',
    title: 'Douce violence', authors: ['Leïla Slimani'],
    publisher: 'Gallimard', collection: 'Blanche',
    universe: 'Littérature', type: 'fonds',
    genre: 'Polar & Thriller', language: 'Français',
    price: 14.10, priceTTC: 21.00, format: 'Grand format', pages: 304,
    publicationDate: '2024-08-07',
    description: "Une enquêtrice sociale infiltre une famille bourgeoise pour élucider la mort d'une enfant. Thriller psychologique implacable.", fictif: true,
  },

  /* ═════════════════════════════════════════════════════
     TITRES FICTIFS — Riad Sattouf
  ═════════════════════════════════════════════════════ */
  {
    id: 'fictif-rs-01', isbn: '9782370739001',
    title: 'Le Voyageur des confins T.2', authors: ['Marc Delacroix'],
    publisher: 'Dargaud',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 10.00, priceTTC: 14.99, format: 'Album', pages: 168,
    publicationDate: '2026-01-22',
    description: "Le voyageur poursuit sa route vers les terres oubliées d'Asie centrale, entre rencontres improbables et paysages à couper le souffle.", fictif: true,
  },
  {
    id: 'fictif-rs-02', isbn: '9782370739002',
    title: 'Le Voyageur des confins T.3', authors: ['Marc Delacroix'],
    publisher: 'Dargaud',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 10.00, priceTTC: 14.99, format: 'Album', pages: 168,
    publicationDate: '2025-10-15',
    description: "Au terme de son odyssée, le voyageur revient en Europe transformé. Un final bouleversant sur l'identité et l'appartenance.", fictif: true,
  },
  {
    id: 'fictif-rs-06', isbn: '9782370739006',
    title: "Les Cahiers d'Esther T.1", authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 9.50, priceTTC: 14.00, format: 'Album', pages: 88,
    publicationDate: '2025-02-26',
    description: "Le journal illustré d'Esther, 10 ans. Humour, tendresse et regard sans filtre sur le monde des adultes.", fictif: true,
  },
  {
    id: 'fictif-rs-07', isbn: '9782370739007',
    title: "Les Cahiers d'Esther T.2", authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 9.50, priceTTC: 14.00, format: 'Album', pages: 88,
    publicationDate: '2025-08-20',
    description: "Esther a 11 ans et entre en 6e. L'école, les copines, les garçons — et une plume déjà acérée.", fictif: true,
  },
]

/* ─── Statuts de stock — démo ─── */
const STOCK_OVERRIDES: Record<string, StockStatut> = {
  /* Stock limité */
  'f-lit-01':          'stock_limite',    // L'Étranger
  'f-bd-01':           'stock_limite',    // Tintin au Tibet
  'f-bd-dragonball':   'stock_limite',    // Dragon Ball T.1
  'n-jes-01':          'stock_limite',    // Le Petit Nicolas
  'n-pra-01':          'stock_limite',    // Pâtisserie — Felder

  /* Sur commande */
  'f-lit-02':          'sur_commande',    // Le Petit Prince
  'f-lit-03':          'sur_commande',    // Notre-Dame de Paris
  'f-lit-miserable':   'sur_commande',    // Les Misérables
  'f-lit-sapiens':     'sur_commande',    // Sapiens
  'f-bd-naruto':       'sur_commande',    // Naruto T.1

  /* En réimpression — uniquement fonds (une nouveauté qui vient de paraître
     ne peut pas être déjà en réimpression) */
  'f-lit-bovary':      'en_reimp',        // Madame Bovary
  'f-lit-alchimiste':  'en_reimp',        // L'Alchimiste
  'f-lit-gatsby':      'en_reimp',        // Gatsby le Magnifique
  'f-lit-millenium':   'en_reimp',        // Millénium T.1
  'f-bd-onepiece':     'en_reimp',        // One Piece T.1

  /* Épuisé */
  'f-bd-02':           'epuise',          // Astérix chez les Bretons
  'f-bd-spirou':       'epuise',          // Spirou et Fantasio T.1
  'f-bd-xiii':         'epuise',          // XIII T.1
  'f-bd-fruits-basket':'epuise',          // Fruits Basket T.1
  'f-lit-musso':       'epuise',          // La Jeune Femme et la Nuit
}

/* Statuts interdits pour une nouveauté — un titre qui vient de paraître
   ne peut pas déjà être en réimpression ou sur commande spéciale.
   Ces statuts n'apparaissent que sur les titres de fonds. */
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
