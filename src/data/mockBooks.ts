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
  price: number
  priceTTC: number
  format: string
  genre?: string
  language?: string
  pages?: number
  publicationDate: string
  description: string
  programme?: string
  fictif?: boolean
  statut?: StockStatut
  delaiReimp?: string
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
     NOUVEAUTÉS DU MOIS
  ══════════════════════════════════════════════════════ */

  /* ── Littérature ── */
  {
    id: 'n-lit-01',
    isbn: '9782258210271',
    title: "Avant qu'il ne soit trop tard",
    authors: ['Kamel Daoud'],
    publisher: 'Calmann-Lévy',
    universe: 'Littérature', type: 'nouveaute',
    genre: 'Essai & Philosophie', language: 'Français',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 320,
    publicationDate: '2025-01-15',
    description: "Chroniques rassemblées de l'auteur du Prix Goncourt 2024. Kamel Daoud livre un regard lucide et acéré sur le monde contemporain, entre Orient et Occident, sur dix ans d'écriture.",
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
    publicationDate: '2024-08-21',
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
    publicationDate: '2024-08-21',
    description: "Amélie Nothomb explore l'identité et le corps à travers une femme effacée qui cherche à exister. Étrange et envoûtant comme toujours.",
  },

  /* ── BD/Mangas ── */
  {
    id: 'n-bd-01',
    isbn: '9781974734634',
    title: 'Dandadan T.1',
    authors: ['Yukinobu Tatsu'],
    publisher: 'Viz Media', collection: 'Shōnen Jump',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Shōnen', language: 'Japonais',
    price: 7.50, priceTTC: 8.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2022-02-01',
    description: "Une lycéenne qui croit aux ovnis et un garçon qui croit aux fantômes se retrouvent confrontés aux deux. Un shōnen déjanté qui mêle action, comédie et paranormal.",
    topVente: true,
  },
  {
    id: 'n-bd-02',
    isbn: '9782413054580',
    title: 'Blue Box T.1',
    authors: ['Kōji Miura'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'nouveaute',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 176,
    publicationDate: '2022-11-09',
    description: "Taiki, passionné de badminton, découvre que la fille dont il est amoureux pratique le basketball dans le même gymnase. Romance sportive pleine de fraîcheur.",
  },

  /* ── Jeunesse ── */
  {
    id: 'n-jes-01',
    isbn: '9782017079361',
    title: 'Heartstopper T.1',
    authors: ['Alice Oseman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'nouveaute',
    genre: 'Roman jeunesse (9–12 ans)', language: 'Anglais',
    price: 10.00, priceTTC: 14.99, format: '145 x 215 mm', pages: 288,
    publicationDate: '2019-10-02',
    description: "Charlie, 15 ans, tombe amoureux de Nick, le garçon le plus populaire du lycée. Un roman graphique tendre et inclusif sur le coming-out, l'amitié et l'amour.",
    topVente: true,
  },
  {
    id: 'n-jes-02',
    isbn: '9782075164252',
    title: "La Passe-Miroir T.1 — Les Fiancés de l'hiver",
    authors: ['Christelle Dabos'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse', type: 'nouveaute',
    genre: 'Fantasy jeunesse', language: 'Français',
    price: 9.50, priceTTC: 14.50, format: '145 x 215 mm', pages: 528,
    publicationDate: '2013-09-26',
    description: "Ophélie, jeune fille capable de lire le passé des objets, est fiancée de force à Thorn, un homme mystérieux d'une autre Arche. La saga fantasy française incontournable.",
    topVente: true,
  },

  /* ── Adulte-pratique ── */
  {
    id: 'n-pra-01',
    isbn: '9782501172097',
    title: 'Le Guide Marabout du bien-être mental',
    authors: ['Dr Sarah Rayner'],
    publisher: 'Marabout',
    universe: 'Adulte-pratique', type: 'nouveaute',
    genre: 'Santé mentale', language: 'Français',
    price: 10.00, priceTTC: 14.90, format: '155 x 235 mm', pages: 256,
    publicationDate: '2022-09-14',
    description: "Un guide pratique et bienveillant pour comprendre et améliorer sa santé mentale au quotidien. Exercices, conseils et outils pour retrouver l'équilibre.",
  },
  {
    id: 'n-pra-02',
    isbn: '9782823854169',
    title: 'Ikigaï — Les secrets des Japonais pour une longue vie heureuse',
    authors: ['Héctor García', 'Francesc Miralles'],
    publisher: 'Twiggy',
    universe: 'Adulte-pratique', type: 'nouveaute',
    genre: 'Développement personnel', language: 'Espagnol',
    price: 9.50, priceTTC: 14.50, format: '145 x 195 mm', pages: 192,
    publicationDate: '2017-01-04',
    description: "L'ikigaï est la raison de se lever le matin. Ce livre explore le secret de la longévité et du bonheur des habitants d'Okinawa.",
    topVente: true,
  },

  /* ══════════════════════════════════════════════════════
     À PARAÎTRE
  ══════════════════════════════════════════════════════ */

  {
    id: 'ap-lit-01',
    isbn: '9782072979958',
    title: 'Le Sillage de la baleine',
    authors: ['Francisco Coloane'],
    publisher: 'Gallimard',
    universe: 'Littérature', type: 'a-paraitre',
    genre: 'Roman contemporain', language: 'Espagnol',
    price: 14.60, priceTTC: 21.90, format: '155 x 235 mm', pages: 304,
    publicationDate: '2026-09-03',
    description: "Dans les eaux australes de Patagonie, un baleinier et sa trajectoire. Récit des confins du monde par le maître de la littérature chilienne.",
    programme: 'Rentrée littéraire 2026',
  },
  {
    id: 'ap-lit-02',
    isbn: '9782073003720',
    title: 'Regardez-nous danser',
    authors: ['Leïla Slimani'],
    publisher: 'Gallimard',
    universe: 'Littérature', type: 'a-paraitre',
    genre: 'Roman contemporain', language: 'Français',
    price: 15.00, priceTTC: 22.50, format: '155 x 235 mm', pages: 352,
    publicationDate: '2026-10-01',
    description: "Le deuxième volet de la trilogie Le Pays des autres. Le Maroc des années 60, entre modernité et tradition, vu par la famille Belhaj. Slimani au sommet de son art.",
    programme: 'Rentrée littéraire 2026',
    fictif: true,
  },
  {
    id: 'ap-bd-01',
    isbn: '9791032712375',
    title: 'Jujutsu Kaisen T.15',
    authors: ['Gege Akutami'],
    publisher: 'Ki-oon', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'a-paraitre',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2026-07-14',
    description: "L'arc de Shibuya se poursuit. Les exorcistes font face à une catastrophe sans précédent dans le chaos de la ville.",
    programme: 'Été 2026',
  },
  {
    id: 'ap-jes-01',
    isbn: '9782075081757',
    title: 'La Passe-Miroir T.2 — Les Disparus du Clairdelune',
    authors: ['Christelle Dabos'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse', type: 'a-paraitre',
    genre: 'Fantasy jeunesse', language: 'Français',
    price: 9.50, priceTTC: 14.50, format: '145 x 215 mm', pages: 560,
    publicationDate: '2026-09-20',
    description: "Ophélie se retrouve au cœur de Citacielle, la cité volante de Pôle. Les disparitions mystérieuses s'accumulent. La suite haletante des Fiancés de l'hiver.",
    programme: 'Rentrée 2026',
    fictif: true,
  },
  {
    id: 'ap-pra-01',
    isbn: '9782228926799',
    title: "Une histoire du corps humain à l'usage de ses occupants",
    authors: ['Bill Bryson'],
    publisher: 'Payot',
    universe: 'Adulte-pratique', type: 'a-paraitre',
    genre: 'Santé mentale', language: 'Anglais',
    price: 16.50, priceTTC: 24.90, format: '155 x 235 mm', pages: 480,
    publicationDate: '2026-10-14',
    description: "Un voyage fascinant à travers le corps humain : comment fonctionne-t-il, pourquoi tombe-t-il malade, et pourquoi est-il si extraordinaire ?",
    programme: 'Automne 2026',
  },

  /* ══════════════════════════════════════════════════════
     FONDS — Littérature
  ══════════════════════════════════════════════════════ */

  {
    id: 'f-lit-mathieu',
    isbn: '9782330108724',
    title: 'Leurs enfants après eux',
    authors: ['Nicolas Mathieu'],
    publisher: 'Actes Sud',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 12.00, priceTTC: 17.90, format: '155 x 235 mm', pages: 432,
    publicationDate: '2018-08-22',
    description: "Prix Goncourt 2018. L'été 1992 dans une vallée lorraine sinistrée. Quatre adolescents, leurs familles et une décennie de mutations sociales. Un roman générationnel puissant.",
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
    price: 10.00, priceTTC: 14.90, format: '145 x 215 mm', pages: 224,
    publicationDate: '2017-05-03',
    description: "Trois femmes, trois continents, trois destins qui s'entrelacent : une Indienne intouchable, une Sicilienne et une avocate canadienne. Un roman sur la force des femmes.",
    topVente: true, selection: true,
  },
  {
    id: 'f-lit-vuillard',
    isbn: '9782330081171',
    title: "L'Ordre du jour",
    authors: ['Eric Vuillard'],
    publisher: 'Actes Sud',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman historique', language: 'Français',
    price: 10.00, priceTTC: 14.90, format: '145 x 215 mm', pages: 160,
    publicationDate: '2017-08-23',
    description: "Prix Goncourt 2017. Le récit de la montée du nazisme à travers le prisme des industriels et des hommes politiques qui ont facilité l'accession de Hitler au pouvoir.",
  },
  {
    id: 'f-lit-houellebecq',
    isbn: '9782081471757',
    title: 'Sérotonine',
    authors: ['Michel Houellebecq'],
    publisher: 'Flammarion',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.00, priceTTC: 19.50, format: '155 x 235 mm', pages: 352,
    publicationDate: '2019-01-04',
    description: "Un ingénieur agricole fuit son existence et se réfugie dans un Paris mélancolique. Houellebecq dresse un portrait glaçant de la solitude et du déclin occidental.",
    delaiReimp: '3 semaines',
  },
  {
    id: 'f-lit-letellier',
    isbn: '9782709660358',
    title: 'Toutes les familles heureuses',
    authors: ['Hervé Le Tellier'],
    publisher: 'JC Lattès',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 12.50, priceTTC: 18.90, format: '145 x 215 mm', pages: 288,
    publicationDate: '2017-03-01',
    description: "Neuf enfants d'un même père recomposent le portrait d'un homme insaisissable. Le Tellier, entre ironie et tendresse, explore les labyrinthes de la famille moderne.",
  },
  {
    id: 'f-lit-berest',
    isbn: '9782246821427',
    title: 'La Carte postale',
    authors: ['Anne Berest'],
    publisher: 'Grasset',
    universe: 'Littérature', type: 'fonds',
    genre: 'Biographie & Mémoires', language: 'Français',
    price: 13.00, priceTTC: 19.50, format: '155 x 235 mm', pages: 528,
    publicationDate: '2021-08-18',
    description: "En 1951, une carte postale mystérieuse. Anne Berest remonte le fil de sa famille, de l'antisémitisme et de l'histoire. Puissant récit de mémoire et d'identité.",
    topVente: true,
  },
  {
    id: 'f-lit-vigan',
    isbn: '9782709663724',
    title: 'Les Gratitudes',
    authors: ['Delphine de Vigan'],
    publisher: 'JC Lattès',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 10.00, priceTTC: 14.90, format: '145 x 215 mm', pages: 208,
    publicationDate: '2019-01-17',
    description: "Michka, vieille femme en EHPAD, perd peu à peu les mots. Deux jeunes gens tentent de lui rendre ce qu'elle leur a donné. Un texte délicat sur la gratitude et la mémoire.",
  },
  {
    id: 'f-lit-jeune',
    isbn: '9782246819714',
    title: 'La Jeune Femme et la Nuit',
    authors: ['Guillaume Musso'],
    publisher: 'Calmann-Lévy',
    universe: 'Littérature', type: 'fonds',
    genre: 'Polar & Thriller', language: 'Français',
    price: 12.00, priceTTC: 17.90, format: '145 x 215 mm', pages: 384,
    publicationDate: '2018-01-25',
    description: "Lors d'une réunion d'anciens élèves, trois amis enquêtent sur la disparition d'une camarade. Musso au sommet : suspense, trahisons et révélations.",
  },
  {
    id: 'f-lit-slimani',
    isbn: '9782072888021',
    title: 'Le Pays des autres',
    authors: ['Leïla Slimani'],
    publisher: 'Gallimard',
    universe: 'Littérature', type: 'fonds',
    genre: 'Roman contemporain', language: 'Français',
    price: 13.00, priceTTC: 19.50, format: '155 x 235 mm', pages: 368,
    publicationDate: '2020-01-02',
    description: "Premier volet de la trilogie familiale. Le Maroc de l'après-guerre : Mathilde, alsacienne, et Amine, marocain, construisent une vie entre deux cultures. Slimani signe son roman le plus ambitieux.",
    topVente: true, selection: true,
  },

  /* ══════════════════════════════════════════════════════
     FONDS — BD/Mangas
  ══════════════════════════════════════════════════════ */

  /* ── My Hero Academia Team-up Mission ── */
  {
    id: 'f-bd-mha-tu05',
    isbn: '9791032716359',
    title: 'My Hero Academia Team-up Mission T.5',
    authors: ['Kōhei Horikoshi', 'Yōko Akiyama'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2024-04-10',
    description: "Izuku et ses camarades de U.A. collaborent avec des héros professionnels dans des missions inédites. Action et humour dans ce spin-off officiel.",
  },
  {
    id: 'f-bd-mha-tu02',
    isbn: '9791032708385',
    title: 'My Hero Academia Team-up Mission T.2',
    authors: ['Kōhei Horikoshi', 'Ryōko Akiyama'],
    publisher: 'Glénat', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2021-06-09',
    description: "L'équipe de U.A. s'embarque dans des missions inattendues avec des héros du monde entier. Un spin-off dynamique et coloré.",
  },

  /* ── Demon Slayer School Days ── */
  {
    id: 'f-bd-demon-sd01',
    isbn: '9791039120616',
    title: 'Demon Slayer School Days T.1',
    authors: ['Natsuki Hokami', 'Koyoharu Gotouge'],
    publisher: 'Panini Manga', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 160,
    publicationDate: '2023-09-06',
    description: "Et si Tanjiro et ses amis vivaient une vie lycéenne normale ? Un spin-off comique et touchant qui réimagine les personnages de Demon Slayer au quotidien.",
    selection: true,
  },
  {
    id: 'f-bd-demon-sd02',
    isbn: '9791039121569',
    title: 'Demon Slayer School Days T.2',
    authors: ['Natsuki Hokami', 'Koyoharu Gotouge'],
    publisher: 'Panini Manga', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 160,
    publicationDate: '2024-01-10',
    description: "Zenitsu et Inosuke à l'école : catastrophe assurée. La comédie se poursuit dans cet univers lycéen savoureux.",
  },

  /* ── Jujutsu Kaisen ── */
  {
    id: 'f-bd-jjk-08',
    isbn: '9791032708408',
    title: 'Jujutsu Kaisen T.8',
    authors: ['Gege Akutami'],
    publisher: 'Ki-oon', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2021-02-03',
    description: "Megumi affronte le clan Zenin. Les enjeux montent d'un cran dans ce tome riche en révélations sur les origines des personnages.",
    delaiReimp: '2 semaines',
  },

  /* ── One-Punch Man ── */
  {
    id: 'f-bd-opm',
    isbn: '9782331024474',
    title: 'One-Punch Man T.1',
    authors: ['ONE', 'Yusuke Murata'],
    publisher: 'Kurokawa', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2015-06-24',
    description: "Saitama, héros si puissant qu'il gagne tout combat en un seul coup, sombre dans l'ennui existentiel. Une parodie géniale du genre shōnen.",
    topVente: true,
  },

  /* ── Spy x Family ── */
  {
    id: 'f-bd-spy',
    isbn: '9782823878462',
    title: 'Spy x Family T.1',
    authors: ['Tatsuya Endo'],
    publisher: 'Kurokawa', collection: 'Shōnen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Shōnen', language: 'Japonais',
    price: 6.99, priceTTC: 7.99, format: '115 x 175 mm', pages: 192,
    publicationDate: '2020-06-10',
    description: "Un espion, une tueuse et une enfant télépathe forment la famille parfaite en apparence. Comédie d'action hilarante et attendrissante.",
    topVente: true, selection: true,
  },

  /* ── Vinland Saga ── */
  {
    id: 'f-bd-vinland',
    isbn: '9782756093802',
    title: 'Vinland Saga T.1',
    authors: ['Makoto Yukimura'],
    publisher: 'Kurokawa', collection: 'Seinen',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Seinen', language: 'Japonais',
    price: 10.50, priceTTC: 13.99, format: '115 x 175 mm', pages: 368,
    publicationDate: '2008-09-10',
    description: "Thorfinn, fils d'un guerrier légendaire, cherche à venger son père en servant son assassin. Épopée viking d'une profondeur rare.",
  },

  /* ── L'Arabe du futur ── */
  {
    id: 'f-bd-arabe-04',
    isbn: '9782370733498',
    title: "L'Arabe du futur T.4 — Une jeunesse au Moyen-Orient (1987-1992)",
    authors: ['Riad Sattouf'],
    publisher: 'Allary Éditions',
    universe: 'BD/Mangas', type: 'fonds',
    genre: 'Roman graphique', language: 'Français',
    price: 12.50, priceTTC: 19.00, format: '220 x 290 mm', pages: 184,
    publicationDate: '2018-10-11',
    description: "Riad a 10 ans. La Libye de Kadhafi, la Syrie d'Assad — la chronique autobiographique qui a conquis le monde entier.",
    topVente: true,
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
    description: "Esther a 10 ans et raconte sa vie avec un naturel désarmant. Riad Sattouf croque une enfance contemporaine avec tendresse et humour.",
    topVente: true,
  },

  /* ══════════════════════════════════════════════════════
     FONDS — Jeunesse
  ══════════════════════════════════════════════════════ */

  {
    id: 'f-jes-animaux',
    isbn: '9781781109137',
    title: 'Les Animaux fantastiques, vie et habitat',
    authors: ['J.K. Rowling'],
    publisher: 'Gallimard Jeunesse',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 7.50, priceTTC: 11.20, format: '145 x 195 mm', pages: 128,
    publicationDate: '2017-03-14',
    description: "Le manuel illustré de magizoologie de Norbert Dragonneau, livre de cours à Poudlard. L'univers de J.K. Rowling dans toute sa richesse.",
    topVente: true,
  },

  /* ── Heartstopper ── */
  {
    id: 'f-jes-hearts-02',
    isbn: '9782017079378',
    title: 'Heartstopper T.2',
    authors: ['Alice Oseman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Roman jeunesse (9–12 ans)', language: 'Anglais',
    price: 10.00, priceTTC: 14.99, format: '145 x 215 mm', pages: 304,
    publicationDate: '2020-07-02',
    description: "Charlie et Nick approfondissent leur relation naissante. Entre questions d'identité et amitié, un roman graphique lumineux sur le coming-out.",
  },
  {
    id: 'f-jes-hearts-03',
    isbn: '9782017110200',
    title: 'Heartstopper T.3',
    authors: ['Alice Oseman'],
    publisher: 'Hachette Romans',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Roman jeunesse (9–12 ans)', language: 'Anglais',
    price: 10.00, priceTTC: 14.99, format: '145 x 215 mm', pages: 320,
    publicationDate: '2021-06-02',
    description: "Charlie et Nick partent en voyage scolaire à Paris. Leur relation s'approfondit dans ce tome le plus romantique de la série.",
  },

  /* ── Six of Crows ── */
  {
    id: 'f-jes-six-01',
    isbn: '9782745984401',
    title: 'Six of Crows T.1',
    authors: ['Leigh Bardugo'],
    publisher: 'Milan',
    universe: 'Jeunesse', type: 'fonds',
    genre: 'Fantasy jeunesse', language: 'Anglais',
    price: 13.20, priceTTC: 19.90, format: '145 x 215 mm', pages: 528,
    publicationDate: '2016-09-07',
    description: "Kaz Brekker, maître des bas-fonds de Ketterdam, réunit une équipe pour l'impossible casse de l'Ice Court. Fantasy dark et haletante.",
  },

  /* ══════════════════════════════════════════════════════
     FONDS — Adulte-pratique
  ══════════════════════════════════════════════════════ */

  {
    id: 'f-pra-james',
    isbn: '9782036082793',
    title: 'Un rien peut tout changer — Le carnet officiel',
    authors: ['James Clear'],
    publisher: 'Ynnis Éditions',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Développement personnel', language: 'Anglais',
    price: 14.50, priceTTC: 21.90, format: '155 x 235 mm', pages: 128,
    publicationDate: '2023-01-04',
    description: "Le carnet d'exercices officiel d'Atomic Habits. Des prompts, réflexions et exercices pratiques pour ancrer les meilleures habitudes dans votre quotidien.",
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
    isbn: '9782226431431',
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
  {
    id: 'f-pra-pilates',
    isbn: '9782359321036',
    title: 'Pilates : le guide complet',
    authors: ['Collectif'],
    publisher: 'Vigot',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Sport & Fitness', language: 'Français',
    price: 13.20, priceTTC: 19.90, format: '155 x 235 mm', pages: 192,
    publicationDate: '2019-03-06',
    description: "Programme complet pour pratiquer le Pilates chez soi, pour tous les niveaux. Illustrations claires et exercices progressifs.",
  },
  {
    id: 'f-pra-larousse',
    isbn: '9782036072237',
    title: 'Mon premier Larousse de la cuisine autour du monde',
    authors: ['Agnès Besson', 'Clémentine Derodit'],
    publisher: 'Larousse',
    universe: 'Adulte-pratique', type: 'fonds',
    genre: 'Cuisine & Gastronomie', language: 'Français',
    price: 9.50, priceTTC: 14.90, format: '155 x 235 mm', pages: 144,
    publicationDate: '2023-09-06',
    description: "Un tour du monde gourmand avec des recettes simples des cinq continents, présentées avec des explications claires pour cuisiniers débutants.",
  },
]

/* ─── Statuts de stock — démo ─── */
const STOCK_OVERRIDES: Record<string, StockStatut> = {
  /* Stock limité */
  'f-lit-jeune':      'stock_limite',
  'f-bd-demon-sd01':  'stock_limite',
  'f-pra-larousse':   'stock_limite',
  'n-jes-01':         'stock_limite',
  'n-pra-01':         'stock_limite',

  /* Sur commande */
  'f-lit-colombani':  'sur_commande',
  'f-lit-letellier':  'sur_commande',
  'f-jes-animaux':    'sur_commande',
  'f-bd-vinland':     'sur_commande',

  /* En réimpression */
  'f-lit-houellebecq': 'en_reimp',
  'f-bd-jjk-08':       'en_reimp',
  'f-pra-homo':        'en_reimp',

  /* Rupture de stock */
  'f-lit-vigan':      'rupture',
  'f-bd-mha-tu05':    'rupture',
  'n-lit-02':         'rupture',
  'n-bd-02':          'rupture',

  /* Épuisé */
  'f-bd-esther-01':   'epuise',
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

export function getBookById(id: string): Book | undefined {
  return MOCK_BOOKS.find(b => b.id === id)
}

export const UNIVERSES: Universe[] = ['Littérature', 'BD/Mangas', 'Jeunesse', 'Adulte-pratique']

export function searchBooks(query: string): Book[] {
  const q = query.toLowerCase().trim()
  if (!q) return MOCK_BOOKS
  return MOCK_BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.toLowerCase().includes(q)) ||
    b.publisher.toLowerCase().includes(q) ||
    (b.collection?.toLowerCase().includes(q) ?? false) ||
    b.isbn.includes(q)
  )
}
