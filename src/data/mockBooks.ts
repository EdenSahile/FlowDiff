export type Universe = 'BD/Mangas' | 'Jeunesse' | 'Littérature' | 'Adulte-pratique'
export type BookType = 'nouveaute' | 'a-paraitre' | 'fonds'

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
  pages?: number
  publicationDate: string   // YYYY-MM-DD
  description: string
  programme?: string        // uniquement pour "à paraître" : ex. "Avril–Juin 2026"
}

export const MOCK_BOOKS: Book[] = [
  /* ─────────────────────────────
     NOUVEAUTÉS DU MOIS — Littérature
  ───────────────────────────────── */
  {
    id: 'n-lit-01',
    isbn: '9782072886447',
    title: 'L\'Anomalie',
    authors: ['Hervé Le Tellier'],
    publisher: 'Gallimard',
    collection: 'Blanche',
    universe: 'Littérature',
    type: 'nouveaute',
    price: 14.10,
    priceTTC: 21.00,
    format: 'Grand format',
    pages: 336,
    publicationDate: '2020-08-19',
    description: 'Prix Goncourt 2020. Un Boeing Air France traverse une zone de turbulences extrêmes — puis atterrit une seconde fois trois mois plus tard, avec les mêmes passagers à bord.',
  },
  {
    id: 'n-lit-02',
    isbn: '9782072773396',
    title: 'Chanson douce',
    authors: ['Leïla Slimani'],
    publisher: 'Gallimard',
    collection: 'Blanche',
    universe: 'Littérature',
    type: 'nouveaute',
    price: 13.40,
    priceTTC: 19.90,
    format: 'Grand format',
    pages: 240,
    publicationDate: '2016-08-17',
    description: 'Prix Goncourt 2016. Myriam et Paul confient leurs enfants à Louise, une nounou douce et dévouée. Un roman haletant sur le désir de puissance, la lente invasion d\'un foyer.',
  },
  {
    id: 'n-lit-03',
    isbn: '9782283030066',
    title: 'Histoire du fils',
    authors: ['Marie-Hélène Lafon'],
    publisher: 'Buchet-Chastel',
    universe: 'Littérature',
    type: 'nouveaute',
    price: 11.70,
    priceTTC: 17.50,
    format: 'Grand format',
    pages: 192,
    publicationDate: '2020-08-19',
    description: 'Prix Renaudot 2020. Sur un siècle et quatre générations, Marie-Hélène Lafon retrace l\'histoire d\'un fils naturel dans la France profonde du Cantal.',
  },
  /* ─────────────────────────────
     NOUVEAUTÉS DU MOIS — BD/Mangas
  ───────────────────────────────── */
  {
    id: 'n-bd-01',
    isbn: '9782505079385',
    title: 'Kaguya-sama : Love is War T.1',
    authors: ['Aka Akasaka'],
    publisher: 'Pika Édition',
    collection: 'Shōnen',
    universe: 'BD/Mangas',
    type: 'nouveaute',
    price: 5.95,
    priceTTC: 7.99,
    format: 'Manga',
    pages: 192,
    publicationDate: '2020-01-15',
    description: 'Kaguya et Miyuki s\'aiment en secret mais aucun des deux ne veut avouer en premier. Une comédie romantique au jeu psychologique savoureux.',
  },
  {
    id: 'n-bd-02',
    isbn: '9782344000656',
    title: 'My Hero Academia T.1',
    authors: ['Kōhei Horikoshi'],
    publisher: 'Glénat',
    collection: 'Shōnen',
    universe: 'BD/Mangas',
    type: 'nouveaute',
    price: 5.95,
    priceTTC: 6.99,
    format: 'Manga',
    pages: 192,
    publicationDate: '2015-11-04',
    description: 'Dans un monde où 80% de la population possède un super-pouvoir, Izuku Midoriya est né sans pouvoir. Un shōnen épique sur le dépassement de soi.',
  },
  {
    id: 'n-bd-03',
    isbn: '9782370730220',
    title: 'L\'Arabe du futur T.1',
    authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas',
    type: 'nouveaute',
    price: 10.00,
    priceTTC: 14.99,
    format: 'Album',
    pages: 160,
    publicationDate: '2014-06-05',
    description: 'Une enfance au Moyen-Orient et en Afrique du Nord dans les années 1980. La BD autobiographique de Riad Sattouf, un million d\'exemplaires vendus.',
  },
  /* ─────────────────────────────
     NOUVEAUTÉS DU MOIS — Jeunesse
  ───────────────────────────────── */
  {
    id: 'n-jes-01',
    isbn: '9782070619061',
    title: 'Le Petit Nicolas',
    authors: ['René Goscinny', 'Jean-Jacques Sempé'],
    publisher: 'Gallimard Jeunesse',
    collection: 'Folio Junior',
    universe: 'Jeunesse',
    type: 'nouveaute',
    price: 5.10,
    priceTTC: 7.60,
    format: 'Poche illustré',
    pages: 160,
    publicationDate: '1960-01-01',
    description: 'Les aventures hilarantes du petit Nicolas, de ses copains et de ses parents. Un classique de la littérature jeunesse française indémodable.',
  },
  {
    id: 'n-jes-02',
    isbn: '9782070514830',
    title: 'Matilda',
    authors: ['Roald Dahl'],
    publisher: 'Gallimard Jeunesse',
    collection: 'Folio Junior',
    universe: 'Jeunesse',
    type: 'nouveaute',
    price: 5.90,
    priceTTC: 8.80,
    format: 'Poche illustré',
    pages: 256,
    publicationDate: '1995-01-01',
    description: 'Matilda est une petite fille extraordinaire dont les parents n\'ont rien remarqué. Un roman de Roald Dahl plein d\'humour et de magie.',
  },
  /* ─────────────────────────────
     NOUVEAUTÉS DU MOIS — Adulte-pratique
  ───────────────────────────────── */
  {
    id: 'n-pra-01',
    isbn: '9782812303067',
    title: 'Pâtisserie — L\'ultime référence',
    authors: ['Christophe Felder'],
    publisher: 'La Martinière',
    universe: 'Adulte-pratique',
    type: 'nouveaute',
    price: 39.90,
    priceTTC: 59.90,
    format: 'Grand format',
    pages: 896,
    publicationDate: '2011-10-01',
    description: 'La référence absolue de la pâtisserie française par le chef alsacien Christophe Felder. Plus de 200 recettes détaillées pas à pas.',
  },
  {
    id: 'n-pra-02',
    isbn: '9782035876614',
    title: 'Guide Larousse du jardinage et du potager',
    authors: ['Collectif Larousse'],
    publisher: 'Larousse',
    universe: 'Adulte-pratique',
    type: 'nouveaute',
    price: 19.90,
    priceTTC: 29.90,
    format: 'Grand format',
    pages: 400,
    publicationDate: '2012-02-01',
    description: 'Tout ce qu\'il faut savoir pour créer et entretenir un jardin d\'ornement et un potager. Des conseils pratiques mois par mois.',
  },
  /* ─────────────────────────────
     À PARAÎTRE — toutes catégories
  ───────────────────────────────── */
  {
    id: 'ap-lit-01',
    isbn: '9782818056868',
    title: 'Triste Tigre',
    authors: ['Neige Sinno'],
    publisher: 'P.O.L',
    universe: 'Littérature',
    type: 'a-paraitre',
    price: 14.60,
    priceTTC: 21.90,
    format: 'Grand format',
    pages: 272,
    publicationDate: '2023-08-24',
    description: 'Prix Renaudot 2023. Neige Sinno affronte avec une lucidité glaçante les années d\'inceste subies dans l\'enfance. Un livre hors normes salué par toute la critique.',
    programme: 'Avril–Juin 2026',
  },
  {
    id: 'ap-bd-01',
    isbn: '9782864972891',
    title: 'Astérix T.39 — Astérix et le Griffon',
    authors: ['Fabcaro', 'Didier Conrad'],
    publisher: 'Albert René',
    collection: 'Astérix',
    universe: 'BD/Mangas',
    type: 'a-paraitre',
    price: 7.30,
    priceTTC: 10.95,
    format: 'Album',
    pages: 48,
    publicationDate: '2021-10-21',
    description: 'Astérix et Obélix partent en expédition dans les steppes de Sarmatie à la recherche du mystérieux griffon.',
    programme: 'Avril–Juin 2026',
  },
  {
    id: 'ap-jes-01',
    isbn: '9782070615667',
    title: 'Tobie Lolness T.1 — La Vie suspendue',
    authors: ['Timothée de Fombelle'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse',
    type: 'a-paraitre',
    price: 10.60,
    priceTTC: 15.90,
    format: 'Roman jeunesse',
    pages: 288,
    publicationDate: '2006-10-05',
    description: 'Tobie Lolness mesure 1,5 millimètre. Il vit dans un arbre gigantesque, dans un monde miniature. Un roman d\'aventure et de poésie époustouflant.',
    programme: 'Juillet–Septembre 2026',
  },
  {
    id: 'ap-pra-01',
    isbn: '9782913366657',
    title: 'Méditer jour après jour',
    authors: ['Christophe André'],
    publisher: 'L\'Iconoclaste',
    universe: 'Adulte-pratique',
    type: 'a-paraitre',
    price: 17.90,
    priceTTC: 25.00,
    format: 'Grand format',
    pages: 288,
    publicationDate: '2011-10-06',
    description: 'Le best-seller de Christophe André sur la méditation de pleine conscience. Illustré par 25 œuvres d\'art, guidé par 10 méditations audio.',
    programme: 'Juillet–Septembre 2026',
  },
  /* ─────────────────────────────
     FONDS — Littérature
  ───────────────────────────────── */
  {
    id: 'f-lit-01',
    isbn: '9782070360024',
    title: 'L\'Étranger',
    authors: ['Albert Camus'],
    publisher: 'Gallimard',
    collection: 'Folio',
    universe: 'Littérature',
    type: 'fonds',
    price: 4.90,
    priceTTC: 7.30,
    format: 'Poche',
    pages: 192,
    publicationDate: '1942-01-01',
    description: 'Roman fondateur de l\'absurde, chef-d\'œuvre de la littérature française du XXe siècle.',
  },
  {
    id: 'f-lit-02',
    isbn: '9782070408504',
    title: 'Le Petit Prince',
    authors: ['Antoine de Saint-Exupéry'],
    publisher: 'Gallimard',
    collection: 'Folio Junior',
    universe: 'Littérature',
    type: 'fonds',
    price: 5.20,
    priceTTC: 7.80,
    format: 'Poche',
    pages: 128,
    publicationDate: '1943-01-01',
    description: 'Le livre le plus traduit au monde après la Bible. Un conte philosophique intemporel.',
  },
  {
    id: 'f-lit-03',
    isbn: '9782253004226',
    title: 'Notre-Dame de Paris',
    authors: ['Victor Hugo'],
    publisher: 'Livre de Poche',
    collection: 'Classiques',
    universe: 'Littérature',
    type: 'fonds',
    price: 5.90,
    priceTTC: 8.80,
    format: 'Poche',
    pages: 736,
    publicationDate: '1831-01-01',
    description: 'Le roman historique le plus célèbre de Victor Hugo, autour de la cathédrale de Paris.',
  },
  /* ─────────────────────────────
     FONDS — BD/Mangas
  ───────────────────────────────── */
  {
    id: 'f-bd-01',
    isbn: '9782203001046',
    title: 'Tintin au Tibet',
    authors: ['Hergé'],
    publisher: 'Casterman',
    collection: 'Les Aventures de Tintin',
    universe: 'BD/Mangas',
    type: 'fonds',
    price: 8.70,
    priceTTC: 12.99,
    format: 'Album',
    pages: 64,
    publicationDate: '1960-01-01',
    description: 'L\'album le plus personnel d\'Hergé, une ode à l\'amitié dans les sommets himalayens.',
  },
  {
    id: 'f-bd-02',
    isbn: '9782012101517',
    title: 'Astérix chez les Bretons',
    authors: ['René Goscinny', 'Albert Uderzo'],
    publisher: 'Albert René',
    collection: 'Astérix',
    universe: 'BD/Mangas',
    type: 'fonds',
    price: 7.30,
    priceTTC: 10.95,
    format: 'Album',
    pages: 48,
    publicationDate: '1966-01-01',
    description: 'Astérix traverse la Manche pour prêter main-forte à ses cousins les Bretons.',
  },
  /* ─────────────────────────────
     FONDS — Jeunesse
  ───────────────────────────────── */
  {
    id: 'f-jes-01',
    isbn: '9782070584628',
    title: 'Harry Potter à l\'école des sorciers',
    authors: ['J.K. Rowling'],
    publisher: 'Gallimard Jeunesse',
    collection: 'Folio Junior',
    universe: 'Jeunesse',
    type: 'fonds',
    price: 7.50,
    priceTTC: 11.20,
    format: 'Poche',
    pages: 320,
    publicationDate: '1998-10-01',
    description: 'Le début de l\'aventure magique de Harry Potter — un incontournable de la librairie.',
  },
  {
    id: 'f-jes-02',
    isbn: '9782070625734',
    title: 'Le Lion, la Sorcière Blanche et l\'Armoire Magique',
    authors: ['C.S. Lewis'],
    publisher: 'Gallimard Jeunesse',
    collection: 'Folio Junior',
    universe: 'Jeunesse',
    type: 'fonds',
    price: 5.90,
    priceTTC: 8.80,
    format: 'Poche',
    pages: 224,
    publicationDate: '1950-01-01',
    description: 'Le premier volume des Chroniques de Narnia, un classique de la fantasy jeunesse.',
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
    universe: 'Adulte-pratique',
    type: 'fonds',
    price: 26.60,
    priceTTC: 39.95,
    format: 'Grand format',
    pages: 896,
    publicationDate: '2020-09-01',
    description: 'La référence culinaire absolue avec plus de 1 200 recettes de la gastronomie française.',
  },
  {
    id: 'f-pra-02',
    isbn: '9782019468422',
    title: 'Méthode Pilates complète',
    authors: ['Alice Pariaud'],
    publisher: 'Hachette Pratique',
    universe: 'Adulte-pratique',
    type: 'fonds',
    price: 13.20,
    priceTTC: 19.90,
    format: 'Grand format',
    pages: 192,
    publicationDate: '2021-03-01',
    description: 'Programme complet pour pratiquer le Pilates chez soi, pour tous les niveaux.',
  },
]

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
    (b.collection?.toLowerCase().includes(q) ?? false)
  )
}
