// Toutes les données sont fictives à des fins de démonstration.

/* ── Vendeur (mentions légales obligatoires art. L.441-9 C.com.) ── */
export const VENDEUR = {
  raisonSociale:  'FlowDiff PRO SAS',
  adresse:        '32 avenue du Test',
  codePostal:     '75015',
  ville:          'Paris',
  siret:          'XXXXXXXX',       // fictif
  numTVA:         'XXXXXXXX',       // fictif
  rcs:            'XXXXXXXX',
  capital:        '90 000 €',
  email:          'facturation@flowdiff.pro',
  telephone:      '+33 1 00 00 00 00',
  codeAPE:        'XXXXXXXX',
} as const

export interface LigneFacture {
  ref:        string
  designation: string
  isbn:        string
  editeur:     string
  univers:     string
  quantite:    number
  ppHT:        number   // prix public HT (tarif éditeur : source de vérité). PP TTC = ppHT × 1,055
  remisePct:   number   // taux de remise accordé (%), par univers sauf commande spéciale
  puHT:        number   // ppHT × (1 − remisePct/100), arrondi à 2 décimales
  montantHT:   number   // puHT × quantite
}

export interface Facture {
  id:               string   // = numero
  numero:           string   // FAC + YYYYMMDD + 4 chiffres
  date:             string   // ISO date : date d'émission
  dateEcheance:     string   // ISO date : date d'échéance règlement
  dateLivraison:    string   // ISO date
  refCommande:      string   // numéro de commande liée

  client: {
    nomLibrairie: string
    codeClient:   string
    adresse:      string
    codePostal:   string
    ville:        string
  }

  lignes:         LigneFacture[]

  totalBrutHT:    number   // somme(ppHT × quantite) : avant remise
  remiseMontant:  number   // totalBrutHT − netHT
  netHT:          number   // somme(montantHT)
  tauxTVA:        number   // 5.5 pour les livres
  montantTVA:     number   // netHT × tauxTVA / 100
  totalTTC:       number   // netHT + montantTVA

  modePaiement:       'virement' | 'cheque' | 'prelevement'
  conditionsPaiement: string
}

/* ── Données fictives LIB001 : Librairie Lira ── */
const CLIENT_LIB001 = {
  nomLibrairie: 'Librairie Lira',
  codeClient:   'LIB001',
  adresse:      '12 rue du Parc',
  codePostal:   '75001',
  ville:        'Paris',
}

/*
  Remises réelles du compte LIB001, par univers (source : remisesParUnivers
  dans src/lib/mockUsers.ts). Une ligne de facture prend le taux de son univers,
  sauf commande spéciale facturée sans remise (remisePct: 0 explicite).
*/
const REMISE_PAR_UNIVERS: Record<string, number> = {
  'Littérature':     35,
  'Adulte-pratique': 35,
  'BD/Mangas':       30,
  'Jeunesse':        30,
}

/*
  Éditeur réel par référence de titre. Les données brutes ne portent pas
  l'éditeur : il est résolu ici au moment de construire la ligne.
*/
const PUBLISHER_BY_REFERENCE: Record<string, string> = {
  'f-lit-01': 'Gallimard',
  'f-lit-02': 'Gallimard',
  'f-lit-03': 'Le Livre de Poche',
  'f-lit-sapiens': 'Albin Michel',
  'f-bd-01': 'Casterman',
  'f-bd-02': 'Hachette Livre',
  'f-jes-01': 'Gallimard Jeunesse',
  'f-jes-charlie': 'Gallimard Jeunesse',
  'n-lit-01': 'Gallimard',
  'n-lit-02': 'Flammarion',
  'n-lit-03': 'Buchet-Chastel',
  'n-bd-01': 'Pika Édition',
  'n-bd-02': 'Ki-oon',
  'n-bd-03': 'Éditions du Sillage',
  'n-pra-01': 'Larousse',
  'n-pra-02': 'Larousse',
  'n-jes-02': 'Gallimard Jeunesse',
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/*
  Données brutes d'une ligne : seules les valeurs indépendantes sont saisies.
  Le taux de remise est déduit de l'univers, sauf override (commande spéciale).
*/
interface LigneInput {
  ref:         string
  designation: string
  isbn:        string
  univers:     string
  quantite:    number
  ppHT:        number
  remisePct?:  number   // override : 0 pour une commande spéciale sans remise
}

interface FactureInput {
  numero:             string
  date:               string
  dateEcheance:       string
  dateLivraison:      string
  refCommande:        string
  modePaiement:       'virement' | 'cheque' | 'prelevement'
  conditionsPaiement: string
  lignes:             LigneInput[]
}

function buildLigne(raw: LigneInput): LigneFacture {
  const remisePct = raw.remisePct ?? REMISE_PAR_UNIVERS[raw.univers] ?? 0
  const puHT = round2(raw.ppHT * (1 - remisePct / 100))
  return {
    ref:        raw.ref,
    designation: raw.designation,
    isbn:       raw.isbn,
    editeur:    PUBLISHER_BY_REFERENCE[raw.ref] ?? raw.ref,
    univers:    raw.univers,
    quantite:   raw.quantite,
    ppHT:       raw.ppHT,
    remisePct,
    puHT,
    montantHT:  round2(puHT * raw.quantite),
  }
}

function buildFacture(raw: FactureInput): Facture {
  const lignes = raw.lignes.map(buildLigne)
  const totalBrutHT = round2(lignes.reduce((s, l) => s + l.ppHT * l.quantite, 0))
  const netHT = round2(lignes.reduce((s, l) => s + l.montantHT, 0))
  const tauxTVA = 5.5
  const montantTVA = round2(netHT * tauxTVA / 100)
  return {
    id: raw.numero,
    numero: raw.numero,
    date: raw.date,
    dateEcheance: raw.dateEcheance,
    dateLivraison: raw.dateLivraison,
    refCommande: raw.refCommande,
    client: CLIENT_LIB001,
    lignes,
    totalBrutHT,
    remiseMontant: round2(totalBrutHT - netHT),
    netHT,
    tauxTVA,
    montantTVA,
    totalTTC: round2(netHT + montantTVA),
    modePaiement: raw.modePaiement,
    conditionsPaiement: raw.conditionsPaiement,
  }
}

const FACTURES_INPUT_LIB001: FactureInput[] = [
  /* ── Factures récentes 2026 (remises par univers) ── */
  {
    numero: 'FAC202610086142',
    date: '2026-10-08', dateEcheance: '2026-11-07', dateLivraison: '2026-10-05',
    refCommande: 'CMD-2026-0642',
    modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    lignes: [
      { ref: 'f-lit-01', designation: "L'Étranger", isbn: '9782070360024', univers: 'Littérature', quantite: 6, ppHT: 4.90 },
      { ref: 'n-bd-02', designation: 'My Hero Academia T.1', isbn: '9782344000656', univers: 'BD/Mangas', quantite: 12, ppHT: 5.95 },
      { ref: 'n-pra-01', designation: "Pâtisserie : L'ultime référence", isbn: '9782812303067', univers: 'Adulte-pratique', quantite: 2, ppHT: 39.90 },
    ],
  },
  {
    numero: 'FAC202609224718',
    date: '2026-09-22', dateEcheance: '2026-10-22', dateLivraison: '2026-09-19',
    refCommande: 'CMD-2026-0588',
    modePaiement: 'cheque', conditionsPaiement: '30 jours fin de mois',
    lignes: [
      { ref: 'f-jes-01', designation: "Harry Potter à l'école des sorciers", isbn: '9782070584628', univers: 'Jeunesse', quantite: 10, ppHT: 7.50 },
      { ref: 'f-lit-02', designation: 'Le Petit Prince', isbn: '9782070408504', univers: 'Littérature', quantite: 8, ppHT: 5.20 },
      { ref: 'f-bd-01', designation: 'Tintin au Tibet', isbn: '9782203001046', univers: 'BD/Mangas', quantite: 6, ppHT: 8.70 },
    ],
  },
  {
    numero: 'FAC202608143905',
    date: '2026-08-14', dateEcheance: '2026-09-13', dateLivraison: '2026-08-11',
    refCommande: 'CMD-2026-0521',
    modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    lignes: [
      { ref: 'n-lit-01', designation: "L'Anomalie", isbn: '9782072886447', univers: 'Littérature', quantite: 5, ppHT: 14.10 },
      { ref: 'n-jes-02', designation: 'Matilda', isbn: '9782070514830', univers: 'Jeunesse', quantite: 8, ppHT: 5.90 },
    ],
  },

  {
    numero: "FAC202602144739",
    date: "2026-02-14", dateEcheance: "2026-03-16", dateLivraison: "2026-02-10",
    refCommande: "CMD-2026-0187",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-lit-01", designation: "L'Étranger", isbn: "9782070360024", univers: "Littérature", quantite: 8, ppHT: 4.90 },
      { ref: "f-lit-02", designation: "Le Petit Prince", isbn: "9782070408504", univers: "Littérature", quantite: 6, ppHT: 5.20 },
      { ref: "f-bd-01", designation: "Tintin au Tibet", isbn: "9782203001046", univers: "BD/Mangas", quantite: 4, ppHT: 8.70 },
      { ref: "f-jes-01", designation: "Harry Potter à l'école des sorciers", isbn: "9782070584628", univers: "Jeunesse", quantite: 5, ppHT: 7.50 },
    ],
  },
  {
    numero: "FAC202601034821",
    date: "2026-01-03", dateEcheance: "2026-02-02", dateLivraison: "2025-12-30",
    refCommande: "CMD-2025-0894",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-lit-03", designation: "Notre-Dame de Paris", isbn: "9782253004226", univers: "Littérature", quantite: 10, ppHT: 5.90 },
      { ref: "f-bd-02", designation: "Astérix chez les Bretons", isbn: "9782012101517", univers: "BD/Mangas", quantite: 6, ppHT: 7.30 },
      { ref: "f-lit-sapiens", designation: "Sapiens : Une brève histoire de l'humanité", isbn: "9782226257017", univers: "Littérature", quantite: 3, ppHT: 14.20 },
    ],
  },
  {
    numero: "FAC202512185647",
    date: "2025-12-18", dateEcheance: "2026-01-17", dateLivraison: "2025-12-15",
    refCommande: "CMD-2025-0801",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "n-lit-02", designation: "Chanson douce", isbn: "9782072773396", univers: "Littérature", quantite: 5, ppHT: 13.40 },
      { ref: "n-bd-02", designation: "My Hero Academia T.1", isbn: "9782344000656", univers: "BD/Mangas", quantite: 8, ppHT: 5.95 },
    ],
  },
  {
    numero: "FAC202512052934",
    date: "2025-12-05", dateEcheance: "2026-01-04", dateLivraison: "2025-12-02",
    refCommande: "CMD-2025-0776",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "n-lit-01", designation: "L'Anomalie", isbn: "9782072886447", univers: "Littérature", quantite: 4, ppHT: 14.10 },
      { ref: "n-bd-03", designation: "Le Voyageur des confins T.1", isbn: "9782370730220", univers: "BD/Mangas", quantite: 6, ppHT: 10.00 },
      { ref: "f-jes-01", designation: "Harry Potter à l'école des sorciers", isbn: "9782070584628", univers: "Jeunesse", quantite: 3, ppHT: 7.50 },
    ],
  },
  {
    numero: "FAC202511207813",
    date: "2025-11-20", dateEcheance: "2025-12-20", dateLivraison: "2025-11-18",
    refCommande: "CMD-2025-0692",
    modePaiement: "cheque", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "n-jes-02", designation: "Matilda", isbn: "9782070514830", univers: "Jeunesse", quantite: 10, ppHT: 5.90 },
      { ref: "n-bd-01", designation: "Kaguya-sama T.1", isbn: "9782505079385", univers: "BD/Mangas", quantite: 8, ppHT: 5.95 },
    ],
  },
  {
    numero: "FAC202511036291",
    date: "2025-11-03", dateEcheance: "2025-12-03", dateLivraison: "2025-10-30",
    refCommande: "CMD-2025-0638",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-lit-sapiens", designation: "Sapiens : Une brève histoire de l'humanité", isbn: "9782226257017", univers: "Littérature", quantite: 4, ppHT: 14.20 },
      { ref: "f-bd-01", designation: "Tintin au Tibet", isbn: "9782203001046", univers: "BD/Mangas", quantite: 5, ppHT: 8.70 },
      { ref: "f-lit-03", designation: "Notre-Dame de Paris", isbn: "9782253004226", univers: "Littérature", quantite: 3, ppHT: 5.90 },
      { ref: "f-lit-01", designation: "L'Étranger", isbn: "9782070360024", univers: "Littérature", quantite: 10, ppHT: 4.90 },
    ],
  },
  {
    numero: "FAC202510154502",
    date: "2025-10-15", dateEcheance: "2025-11-14", dateLivraison: "2025-10-12",
    refCommande: "CMD-2025-0581",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-lit-02", designation: "Le Petit Prince", isbn: "9782070408504", univers: "Littérature", quantite: 15, ppHT: 5.20 },
      { ref: "f-bd-02", designation: "Astérix chez les Bretons", isbn: "9782012101517", univers: "BD/Mangas", quantite: 8, ppHT: 7.30 },
      { ref: "f-jes-01", designation: "Harry Potter à l'école des sorciers", isbn: "9782070584628", univers: "Jeunesse", quantite: 6, ppHT: 7.50 },
    ],
  },
  {
    numero: "FAC202509301876",
    date: "2025-09-30", dateEcheance: "2025-10-30", dateLivraison: "2025-09-27",
    refCommande: "CMD-2025-0510",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-lit-02", designation: "Le Petit Prince", isbn: "9782070408504", univers: "Littérature", quantite: 20, ppHT: 5.20 },
      { ref: "n-jes-02", designation: "Matilda", isbn: "9782070514830", univers: "Jeunesse", quantite: 8, ppHT: 5.90 },
    ],
  },
  {
    numero: "FAC202509153749",
    date: "2025-09-15", dateEcheance: "2025-10-15", dateLivraison: "2025-09-12",
    refCommande: "CMD-2025-0477",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "n-pra-02", designation: "Guide Larousse du jardinage et du potager", isbn: "9782035876614", univers: "Adulte-pratique", quantite: 4, ppHT: 19.90 },
      { ref: "n-pra-01", designation: "Pâtisserie : L'ultime référence", isbn: "9782812303067", univers: "Adulte-pratique", quantite: 2, ppHT: 39.90 },
    ],
  },
  {
    // Commande speciale : sans remise (exception volontaire)
    numero: "FAC202508256382",
    date: "2025-08-25", dateEcheance: "2025-09-24", dateLivraison: "2025-08-22",
    refCommande: "CMD-2025-0401",
    modePaiement: "cheque", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "n-lit-01", designation: "L'Anomalie", isbn: "9782072886447", univers: "Littérature", quantite: 5, ppHT: 14.10, remisePct: 0 },
      { ref: "n-lit-03", designation: "Histoire du fils", isbn: "9782283030066", univers: "Littérature", quantite: 6, ppHT: 11.70, remisePct: 0 },
    ],
  },
  {
    numero: "FAC202508102917",
    date: "2025-08-10", dateEcheance: "2025-09-09", dateLivraison: "2025-08-07",
    refCommande: "CMD-2025-0368",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-bd-01", designation: "Tintin au Tibet", isbn: "9782203001046", univers: "BD/Mangas", quantite: 6, ppHT: 8.70 },
      { ref: "n-bd-02", designation: "My Hero Academia T.1", isbn: "9782344000656", univers: "BD/Mangas", quantite: 10, ppHT: 5.95 },
      { ref: "n-bd-01", designation: "Kaguya-sama T.1", isbn: "9782505079385", univers: "BD/Mangas", quantite: 6, ppHT: 5.95 },
    ],
  },
  {
    numero: "FAC202507221534",
    date: "2025-07-22", dateEcheance: "2025-08-21", dateLivraison: "2025-07-18",
    refCommande: "CMD-2025-0311",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-jes-01", designation: "Harry Potter à l'école des sorciers", isbn: "9782070584628", univers: "Jeunesse", quantite: 12, ppHT: 7.50 },
      { ref: "f-jes-charlie", designation: "Charlie et la Chocolaterie", isbn: "9782070584819", univers: "Jeunesse", quantite: 8, ppHT: 5.90 },
      { ref: "n-jes-02", designation: "Matilda", isbn: "9782070514830", univers: "Jeunesse", quantite: 10, ppHT: 5.90 },
    ],
  },
  {
    numero: "FAC202507014873",
    date: "2025-07-01", dateEcheance: "2025-07-31", dateLivraison: "2025-06-28",
    refCommande: "CMD-2025-0274",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-lit-01", designation: "L'Étranger", isbn: "9782070360024", univers: "Littérature", quantite: 15, ppHT: 4.90 },
      { ref: "f-lit-03", designation: "Notre-Dame de Paris", isbn: "9782253004226", univers: "Littérature", quantite: 8, ppHT: 5.90 },
    ],
  },
  {
    // Commande speciale : sans remise (exception volontaire)
    numero: "FAC202506152638",
    date: "2025-06-15", dateEcheance: "2025-07-15", dateLivraison: "2025-06-12",
    refCommande: "CMD-2025-0218",
    modePaiement: "virement", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "n-bd-03", designation: "Le Voyageur des confins T.1", isbn: "9782370730220", univers: "BD/Mangas", quantite: 5, ppHT: 10.00, remisePct: 0 },
      { ref: "f-lit-sapiens", designation: "Sapiens : Une brève histoire de l'humanité", isbn: "9782226257017", univers: "Littérature", quantite: 4, ppHT: 14.20, remisePct: 0 },
      { ref: "n-lit-02", designation: "Chanson douce", isbn: "9782072773396", univers: "Littérature", quantite: 3, ppHT: 13.40, remisePct: 0 },
    ],
  },
  {
    numero: "FAC202506019284",
    date: "2025-06-01", dateEcheance: "2025-07-01", dateLivraison: "2025-05-28",
    refCommande: "CMD-2025-0181",
    modePaiement: "cheque", conditionsPaiement: "30 jours fin de mois",
    lignes: [
      { ref: "f-bd-02", designation: "Astérix chez les Bretons", isbn: "9782012101517", univers: "BD/Mangas", quantite: 10, ppHT: 7.30 },
      { ref: "f-bd-01", designation: "Tintin au Tibet", isbn: "9782203001046", univers: "BD/Mangas", quantite: 8, ppHT: 8.70 },
    ],
  },
]

export const MOCK_FACTURES: Record<string, Facture[]> = {
  LIB001: FACTURES_INPUT_LIB001.map(buildFacture),
}
