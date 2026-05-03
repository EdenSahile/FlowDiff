// DEV ONLY — remplacé par Supabase en Phase 12
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
  ppTTC:       number   // prix public TTC (prix affiché en librairie — source de vérité)
  remisePct:   number   // taux de remise accordé (ex : 9)
  puHT:        number   // (ppTTC / 1.055) × (1 − remisePct/100), arrondi à 2 décimales
  montantHT:   number   // puHT × quantite
  montantTTC:  number   // montantHT × 1.055
}

export interface Facture {
  id:               string   // = numero
  numero:           string   // FAC + YYYYMMDD + 4 chiffres
  date:             string   // ISO date — date d'émission
  dateEcheance:     string   // ISO date — date d'échéance règlement
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

  totalBrutHT:    number   // somme(ppHT × quantite) — avant remise
  remiseMontant:  number   // totalBrutHT − netHT
  netHT:          number   // somme(montantHT)
  tauxTVA:        number   // 5.5 pour les livres
  montantTVA:     number   // netHT × tauxTVA / 100
  totalTTC:       number   // netHT + montantTVA

  modePaiement:       'virement' | 'cheque' | 'prelevement'
  conditionsPaiement: string
}

/* ── Données fictives LIB001 — Librairie Lira ── */
const CLIENT_LIB001 = {
  nomLibrairie: 'Librairie Lira',
  codeClient:   'LIB001',
  adresse:      '12 rue du Parc',
  codePostal:   '75001',
  ville:        'Paris',
}

export const MOCK_FACTURES: Record<string, Facture[]> = {
  LIB001: [
    /* ════════════════════════════════════════════════════════
       1. FAC202602144739 — Remise 9 % — 4 ouvrages
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202602144739', numero: 'FAC202602144739',
      date: '2026-02-14', dateEcheance: '2026-03-16', dateLivraison: '2026-02-10',
      refCommande: 'CMD-2026-0187',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-lit-01', designation: "L'Étranger",                         isbn: '9782070360024', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 8,  ppTTC: 5.17, remisePct: 9, puHT: 4.46, montantHT: 35.68, montantTTC: 37.64 },
        { ref: 'f-lit-02', designation: 'Le Petit Prince',                     isbn: '9782070408504', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 6,  ppTTC: 5.49, remisePct: 9, puHT: 4.74, montantHT: 28.44, montantTTC: 29.90 },
        { ref: 'f-bd-01',  designation: 'Tintin au Tibet',                     isbn: '9782203001046', editeur: 'Éditeur 2', univers: 'BD/Mangas',   quantite: 4,  ppTTC: 9.18, remisePct: 9, puHT: 7.92, montantHT: 31.68, montantTTC: 33.42 },
        { ref: 'f-jes-01', designation: "Harry Potter à l'école des sorciers", isbn: '9782070584628', editeur: 'Éditeur 3', univers: 'Jeunesse',    quantite: 5,  ppTTC: 7.91, remisePct: 9, puHT: 6.82, montantHT: 34.10, montantTTC: 35.98 },
      ],
      totalBrutHT: 142.70, remiseMontant: 12.80, netHT: 129.90,
      tauxTVA: 5.5, montantTVA: 7.14, totalTTC: 137.04,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       2. FAC202601034821 — Sans remise — 3 ouvrages
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202601034821', numero: 'FAC202601034821',
      date: '2026-01-03', dateEcheance: '2026-02-02', dateLivraison: '2025-12-30',
      refCommande: 'CMD-2025-0894',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-lit-03',      designation: 'Notre-Dame de Paris',                          isbn: '9782253004226', editeur: 'Éditeur 4', univers: 'Littérature', quantite: 10, ppTTC: 6.22,  remisePct: 0, puHT: 5.90,  montantHT: 59.00, montantTTC: 62.25 },
        { ref: 'f-bd-02',       designation: 'Astérix chez les Bretons',                     isbn: '9782012101517', editeur: 'Éditeur 5', univers: 'BD/Mangas',   quantite: 6,  ppTTC: 7.70,  remisePct: 0, puHT: 7.30,  montantHT: 43.80, montantTTC: 46.21 },
        { ref: 'f-lit-sapiens', designation: "Sapiens — Une brève histoire de l'humanité",   isbn: '9782226257017', editeur: 'Éditeur 6', univers: 'Littérature', quantite: 3,  ppTTC: 14.98, remisePct: 0, puHT: 14.20, montantHT: 42.60, montantTTC: 44.94 },
      ],
      totalBrutHT: 145.40, remiseMontant: 0, netHT: 145.40,
      tauxTVA: 5.5, montantTVA: 8.00, totalTTC: 153.40,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       3. FAC202512185647 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202512185647', numero: 'FAC202512185647',
      date: '2025-12-18', dateEcheance: '2026-01-17', dateLivraison: '2025-12-15',
      refCommande: 'CMD-2025-0801',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'n-lit-02', designation: 'Chanson douce',        isbn: '9782072773396', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 5, ppTTC: 14.14, remisePct: 0, puHT: 13.40, montantHT: 67.00, montantTTC: 70.69 },
        { ref: 'n-bd-02',  designation: 'My Hero Academia T.1', isbn: '9782344000656', editeur: 'Éditeur 7', univers: 'BD/Mangas',   quantite: 8, ppTTC: 6.28,  remisePct: 0, puHT: 5.95,  montantHT: 47.60, montantTTC: 50.22 },
      ],
      totalBrutHT: 114.60, remiseMontant: 0, netHT: 114.60,
      tauxTVA: 5.5, montantTVA: 6.30, totalTTC: 120.90,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       4. FAC202512052934 — Remise 5 %
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202512052934', numero: 'FAC202512052934',
      date: '2025-12-05', dateEcheance: '2026-01-04', dateLivraison: '2025-12-02',
      refCommande: 'CMD-2025-0776',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'n-lit-01', designation: "L'Anomalie",                          isbn: '9782072886447', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 4, ppTTC: 14.88, remisePct: 5, puHT: 13.40, montantHT: 53.60, montantTTC: 56.55 },
        { ref: 'n-bd-03',  designation: 'Le Voyageur des confins T.1',         isbn: '9782370730220', editeur: 'Éditeur 9', univers: 'BD/Mangas',   quantite: 6, ppTTC: 10.55, remisePct: 5, puHT: 9.50,  montantHT: 57.00, montantTTC: 60.14 },
        { ref: 'f-jes-01', designation: "Harry Potter à l'école des sorciers", isbn: '9782070584628', editeur: 'Éditeur 3', univers: 'Jeunesse',    quantite: 3, ppTTC: 7.91,  remisePct: 5, puHT: 7.12,  montantHT: 21.36, montantTTC: 22.53 },
      ],
      totalBrutHT: 138.90, remiseMontant: 6.94, netHT: 131.96,
      tauxTVA: 5.5, montantTVA: 7.26, totalTTC: 139.22,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       5. FAC202511207813 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202511207813', numero: 'FAC202511207813',
      date: '2025-11-20', dateEcheance: '2025-12-20', dateLivraison: '2025-11-18',
      refCommande: 'CMD-2025-0692',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'n-jes-02', designation: 'Matilda',         isbn: '9782070514830', editeur: 'Éditeur 3', univers: 'Jeunesse',  quantite: 10, ppTTC: 6.22, remisePct: 0, puHT: 5.90, montantHT: 59.00, montantTTC: 62.25 },
        { ref: 'n-bd-01',  designation: 'Kaguya-sama T.1', isbn: '9782505079385', editeur: 'Éditeur 8', univers: 'BD/Mangas', quantite: 8,  ppTTC: 6.28, remisePct: 0, puHT: 5.95, montantHT: 47.60, montantTTC: 50.22 },
      ],
      totalBrutHT: 106.60, remiseMontant: 0, netHT: 106.60,
      tauxTVA: 5.5, montantTVA: 5.86, totalTTC: 112.46,
      modePaiement: 'cheque', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       6. FAC202511036291 — Remise 9 %
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202511036291', numero: 'FAC202511036291',
      date: '2025-11-03', dateEcheance: '2025-12-03', dateLivraison: '2025-10-30',
      refCommande: 'CMD-2025-0638',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-lit-sapiens', designation: "Sapiens — Une brève histoire de l'humanité", isbn: '9782226257017', editeur: 'Éditeur 6', univers: 'Littérature', quantite: 4,  ppTTC: 14.98, remisePct: 9, puHT: 12.92, montantHT: 51.68, montantTTC: 54.52 },
        { ref: 'f-bd-01',       designation: 'Tintin au Tibet',                            isbn: '9782203001046', editeur: 'Éditeur 2', univers: 'BD/Mangas',   quantite: 5,  ppTTC: 9.18,  remisePct: 9, puHT: 7.92,  montantHT: 39.60, montantTTC: 41.78 },
        { ref: 'f-lit-03',      designation: 'Notre-Dame de Paris',                        isbn: '9782253004226', editeur: 'Éditeur 4', univers: 'Littérature', quantite: 3,  ppTTC: 6.22,  remisePct: 9, puHT: 5.37,  montantHT: 16.11, montantTTC: 17.00 },
        { ref: 'f-lit-01',      designation: "L'Étranger",                                 isbn: '9782070360024', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 10, ppTTC: 5.17,  remisePct: 9, puHT: 4.46,  montantHT: 44.60, montantTTC: 47.05 },
      ],
      totalBrutHT: 167.00, remiseMontant: 15.01, netHT: 151.99,
      tauxTVA: 5.5, montantTVA: 8.36, totalTTC: 160.35,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       7. FAC202510154502 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202510154502', numero: 'FAC202510154502',
      date: '2025-10-15', dateEcheance: '2025-11-14', dateLivraison: '2025-10-12',
      refCommande: 'CMD-2025-0581',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-lit-02', designation: 'Le Petit Prince',                    isbn: '9782070408504', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 15, ppTTC: 5.49, remisePct: 0, puHT: 5.20, montantHT: 78.00, montantTTC: 82.29 },
        { ref: 'f-bd-02',  designation: 'Astérix chez les Bretons',          isbn: '9782012101517', editeur: 'Éditeur 5', univers: 'BD/Mangas',   quantite: 8,  ppTTC: 7.70, remisePct: 0, puHT: 7.30, montantHT: 58.40, montantTTC: 61.61 },
        { ref: 'f-jes-01', designation: "Harry Potter à l'école des sorciers", isbn: '9782070584628', editeur: 'Éditeur 3', univers: 'Jeunesse',    quantite: 6,  ppTTC: 7.91, remisePct: 0, puHT: 7.50, montantHT: 45.00, montantTTC: 47.48 },
      ],
      totalBrutHT: 181.40, remiseMontant: 0, netHT: 181.40,
      tauxTVA: 5.5, montantTVA: 9.98, totalTTC: 191.38,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       8. FAC202509301876 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202509301876', numero: 'FAC202509301876',
      date: '2025-09-30', dateEcheance: '2025-10-30', dateLivraison: '2025-09-27',
      refCommande: 'CMD-2025-0510',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-lit-02', designation: 'Le Petit Prince', isbn: '9782070408504', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 20, ppTTC: 5.49, remisePct: 0, puHT: 5.20, montantHT: 104.00, montantTTC: 109.72 },
        { ref: 'n-jes-02', designation: 'Matilda',         isbn: '9782070514830', editeur: 'Éditeur 3', univers: 'Jeunesse',    quantite: 8,  ppTTC: 6.22, remisePct: 0, puHT: 5.90, montantHT: 47.20,  montantTTC: 49.80  },
      ],
      totalBrutHT: 151.20, remiseMontant: 0, netHT: 151.20,
      tauxTVA: 5.5, montantTVA: 8.32, totalTTC: 159.52,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       9. FAC202509153749 — Remise 7 %
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202509153749', numero: 'FAC202509153749',
      date: '2025-09-15', dateEcheance: '2025-10-15', dateLivraison: '2025-09-12',
      refCommande: 'CMD-2025-0477',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'n-pra-02', designation: 'Guide Larousse du jardinage et du potager', isbn: '9782035876614', editeur: 'Éditeur 10', univers: 'Adulte-pratique', quantite: 4, ppTTC: 20.99, remisePct: 7, puHT: 18.50, montantHT: 74.00, montantTTC: 78.07 },
        { ref: 'n-pra-01', designation: "Pâtisserie — L'ultime référence",           isbn: '9782812303067', editeur: 'Éditeur 10', univers: 'Adulte-pratique', quantite: 2, ppTTC: 42.09, remisePct: 7, puHT: 37.10, montantHT: 74.20, montantTTC: 78.28 },
      ],
      totalBrutHT: 159.40, remiseMontant: 11.20, netHT: 148.20,
      tauxTVA: 5.5, montantTVA: 8.15, totalTTC: 156.35,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       10. FAC202508256382 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202508256382', numero: 'FAC202508256382',
      date: '2025-08-25', dateEcheance: '2025-09-24', dateLivraison: '2025-08-22',
      refCommande: 'CMD-2025-0401',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'n-lit-01', designation: "L'Anomalie",       isbn: '9782072886447', editeur: 'Éditeur 1',  univers: 'Littérature', quantite: 5, ppTTC: 14.88, remisePct: 0, puHT: 14.10, montantHT: 70.50, montantTTC: 74.38 },
        { ref: 'n-lit-03', designation: 'Histoire du fils', isbn: '9782283030066', editeur: 'Éditeur 11', univers: 'Littérature', quantite: 6, ppTTC: 12.34, remisePct: 0, puHT: 11.70, montantHT: 70.20, montantTTC: 74.06 },
      ],
      totalBrutHT: 140.70, remiseMontant: 0, netHT: 140.70,
      tauxTVA: 5.5, montantTVA: 7.74, totalTTC: 148.44,
      modePaiement: 'cheque', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       11. FAC202508102917 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202508102917', numero: 'FAC202508102917',
      date: '2025-08-10', dateEcheance: '2025-09-09', dateLivraison: '2025-08-07',
      refCommande: 'CMD-2025-0368',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-bd-01', designation: 'Tintin au Tibet',      isbn: '9782203001046', editeur: 'Éditeur 2', univers: 'BD/Mangas', quantite: 6,  ppTTC: 9.18, remisePct: 0, puHT: 8.70, montantHT: 52.20, montantTTC: 55.07 },
        { ref: 'n-bd-02', designation: 'My Hero Academia T.1', isbn: '9782344000656', editeur: 'Éditeur 7', univers: 'BD/Mangas', quantite: 10, ppTTC: 6.28, remisePct: 0, puHT: 5.95, montantHT: 59.50, montantTTC: 62.77 },
        { ref: 'n-bd-01', designation: 'Kaguya-sama T.1',      isbn: '9782505079385', editeur: 'Éditeur 8', univers: 'BD/Mangas', quantite: 6,  ppTTC: 6.28, remisePct: 0, puHT: 5.95, montantHT: 35.70, montantTTC: 37.66 },
      ],
      totalBrutHT: 147.40, remiseMontant: 0, netHT: 147.40,
      tauxTVA: 5.5, montantTVA: 8.11, totalTTC: 155.51,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       12. FAC202507221534 — Remise 9 %
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202507221534', numero: 'FAC202507221534',
      date: '2025-07-22', dateEcheance: '2025-08-21', dateLivraison: '2025-07-18',
      refCommande: 'CMD-2025-0311',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-jes-01',      designation: "Harry Potter à l'école des sorciers", isbn: '9782070584628', editeur: 'Éditeur 3', univers: 'Jeunesse', quantite: 12, ppTTC: 7.91, remisePct: 9, puHT: 6.82, montantHT: 81.84, montantTTC: 86.34 },
        { ref: 'f-jes-charlie', designation: 'Charlie et la Chocolaterie',          isbn: '9782070584819', editeur: 'Éditeur 3', univers: 'Jeunesse', quantite: 8,  ppTTC: 6.22, remisePct: 9, puHT: 5.37, montantHT: 42.96, montantTTC: 45.32 },
        { ref: 'n-jes-02',      designation: 'Matilda',                             isbn: '9782070514830', editeur: 'Éditeur 3', univers: 'Jeunesse', quantite: 10, ppTTC: 6.22, remisePct: 9, puHT: 5.37, montantHT: 53.70, montantTTC: 56.65 },
      ],
      totalBrutHT: 196.20, remiseMontant: 17.70, netHT: 178.50,
      tauxTVA: 5.5, montantTVA: 9.82, totalTTC: 188.32,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       13. FAC202507014873 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202507014873', numero: 'FAC202507014873',
      date: '2025-07-01', dateEcheance: '2025-07-31', dateLivraison: '2025-06-28',
      refCommande: 'CMD-2025-0274',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-lit-01', designation: "L'Étranger",         isbn: '9782070360024', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 15, ppTTC: 5.17, remisePct: 0, puHT: 4.90, montantHT: 73.50, montantTTC: 77.54 },
        { ref: 'f-lit-03', designation: 'Notre-Dame de Paris', isbn: '9782253004226', editeur: 'Éditeur 4', univers: 'Littérature', quantite: 8,  ppTTC: 6.22, remisePct: 0, puHT: 5.90, montantHT: 47.20, montantTTC: 49.80 },
      ],
      totalBrutHT: 120.70, remiseMontant: 0, netHT: 120.70,
      tauxTVA: 5.5, montantTVA: 6.64, totalTTC: 127.34,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       14. FAC202506152638 — Sans remise
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202506152638', numero: 'FAC202506152638',
      date: '2025-06-15', dateEcheance: '2025-07-15', dateLivraison: '2025-06-12',
      refCommande: 'CMD-2025-0218',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'n-bd-03',       designation: 'Le Voyageur des confins T.1',                  isbn: '9782370730220', editeur: 'Éditeur 9', univers: 'BD/Mangas',   quantite: 5, ppTTC: 10.55, remisePct: 0, puHT: 10.00, montantHT: 50.00, montantTTC: 52.75 },
        { ref: 'f-lit-sapiens', designation: "Sapiens — Une brève histoire de l'humanité",   isbn: '9782226257017', editeur: 'Éditeur 6', univers: 'Littérature', quantite: 4, ppTTC: 14.98, remisePct: 0, puHT: 14.20, montantHT: 56.80, montantTTC: 59.92 },
        { ref: 'n-lit-02',      designation: 'Chanson douce',                                isbn: '9782072773396', editeur: 'Éditeur 1', univers: 'Littérature', quantite: 3, ppTTC: 14.14, remisePct: 0, puHT: 13.40, montantHT: 40.20, montantTTC: 42.41 },
      ],
      totalBrutHT: 147.00, remiseMontant: 0, netHT: 147.00,
      tauxTVA: 5.5, montantTVA: 8.09, totalTTC: 155.09,
      modePaiement: 'virement', conditionsPaiement: '30 jours fin de mois',
    },

    /* ════════════════════════════════════════════════════════
       15. FAC202506019284 — Remise 5 %
    ════════════════════════════════════════════════════════ */
    {
      id: 'FAC202506019284', numero: 'FAC202506019284',
      date: '2025-06-01', dateEcheance: '2025-07-01', dateLivraison: '2025-05-28',
      refCommande: 'CMD-2025-0181',
      client: CLIENT_LIB001,
      lignes: [
        { ref: 'f-bd-02', designation: 'Astérix chez les Bretons', isbn: '9782012101517', editeur: 'Éditeur 5', univers: 'BD/Mangas', quantite: 10, ppTTC: 7.70, remisePct: 5, puHT: 6.93, montantHT: 69.30, montantTTC: 73.11 },
        { ref: 'f-bd-01', designation: 'Tintin au Tibet',          isbn: '9782203001046', editeur: 'Éditeur 2', univers: 'BD/Mangas', quantite: 8,  ppTTC: 9.18, remisePct: 5, puHT: 8.27, montantHT: 66.16, montantTTC: 69.80 },
      ],
      totalBrutHT: 142.60, remiseMontant: 7.14, netHT: 135.46,
      tauxTVA: 5.5, montantTVA: 7.45, totalTTC: 142.91,
      modePaiement: 'cheque', conditionsPaiement: '30 jours fin de mois',
    },
  ],
}
