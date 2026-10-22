export interface MockUser {
  id: string
  codeClient: string
  nomLibrairie: string
  email: string
  passwordHash: string
  adresseLivraison: string
  remise: number
  telephone: string
  remisesParUnivers: Record<string, number>
  reliquatAccepte: boolean
}

// Hash pré-calculé de "Libraire123!" avec bcrypt cost 4
const PRECOMPUTED_HASH = '$2b$04$CtY532MDb3FdpRUarambGuS9wd7qCY8fZVJ0hMYtti4nVrMdahII6'

export const MOCK_USERS: MockUser[] = [
  {
    id: 'mock-lib001',
    codeClient: 'LIB001',
    nomLibrairie: 'Librairie Lira ',
    email: 'marie.lecomte@librairie-lira.fr',
    passwordHash: PRECOMPUTED_HASH,
    adresseLivraison: '12 rue du Parc, 75001 Paris',
    remise: 15,
    telephone: '01 23 45 67 89',
    remisesParUnivers: { 'Littérature': 35, 'BD/Mangas': 30, 'Jeunesse': 30, 'Adulte-pratique': 35 },
    reliquatAccepte: true,
  },
  {
    id: 'mock-lib002',
    codeClient: 'LIB002',
    nomLibrairie: 'Les Mots Voyageurs',
    email: 'thomas.beaumont@motsvoyageurs.fr',
    passwordHash: PRECOMPUTED_HASH,
    adresseLivraison: '8 place Bellecour, 69002 Lyon',
    remise: 20,
    telephone: '04 56 78 90 12',
    remisesParUnivers: { 'Littérature': 35, 'BD/Mangas': 30, 'Jeunesse': 30, 'Adulte-pratique': 35 },
    reliquatAccepte: false,
  },
  {
    id: 'mock-lib003',
    codeClient: 'LIB003',
    nomLibrairie: 'La Page Tournée',
    email: 'sophie.girard@lapageturne.fr',
    passwordHash: PRECOMPUTED_HASH,
    adresseLivraison: '3 allée des Fleurs, 33000 Bordeaux',
    remise: 12,
    telephone: '05 56 12 34 56',
    remisesParUnivers: { 'Littérature': 35, 'BD/Mangas': 30, 'Jeunesse': 30, 'Adulte-pratique': 35 },
    reliquatAccepte: true,
  },
]

export const VALID_CLIENT_CODES = MOCK_USERS.map((u) => ({
  codeClient: u.codeClient,
  email: u.email,
}))
