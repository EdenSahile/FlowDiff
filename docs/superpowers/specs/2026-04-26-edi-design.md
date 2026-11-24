# Spec — Page EDI (Centre de suivi des flux EDI)

Date : 2026-04-26  
Statut : approuvé

---

## Contexte

FlowDiff permet déjà de passer des commandes en mode `transmissionMode: 'EDI'` (champ existant dans `OrdersContext`). Cette page centralise la visualisation et le suivi de tous les messages EDI échangés avec les diffuseurs (Dilicom). Elle est entièrement autonome pour cette version — aucun lien vers d'autres pages (sauf navigation standard).

---

## Architecture — Approche hybride (3)

- **`EDIContext`** — context global minimal, données + actions, persistance localStorage
- **`EDIPage.tsx`** — page principale, composants inline sauf la modale
- **`EDIMessageModal.tsx`** — composant isolé, extrait car auto-suffisant

---

## Types

```ts
type EDIStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'ERROR'
type EDIMessageType = 'ORDERS' | 'ORDRSP' | 'DESADV' | 'INVOIC' | 'STOCK'

interface EDIMessage {
  id: string
  type: EDIMessageType
  status: EDIStatus
  documentRef: string     // ex. "CMD-2026-0426-001"
  diffuseur: string       // ex. "Interforum (Editis)"
  detail: string          // ex. "12 lignes / 24 ex." ou "1 234,50 € TTC"
  createdAt: string       // ISO datetime
  orderId?: string        // lien optionnel vers une Order
  payload: object         // contenu JSON affiché dans la modale
}

interface EDIParams {
  preferEdiByDefault: boolean
  emailNotifications: boolean
  relanceDelay: '12h' | '24h' | '48h'
}
```

---

## EDIContext

**Clés localStorage :**
- Messages : `flowdiff_edi_${codeClient}` (tableau `EDIMessage[]`)
- Paramètres : `flowdiff_edi_params_${codeClient}` (objet `EDIParams`)

**État exposé :**
```ts
interface EDIContextValue {
  messages: EDIMessage[]
  connectionStatus: 'connected' | 'incident' | 'disconnected'
  lastSync: string                          // ISO datetime, généré à l'init
  params: EDIParams
  updateParams: (p: Partial<EDIParams>) => void
}
```

**Intégration OrdersContext (option A) :**  
`EDIContext` consomme `useClientOrders()` et surveille les nouvelles commandes via `useEffect`. Quand une commande avec `transmissionMode: 'EDI'` apparaît sans message ORDERS associé (`orderId` absent des messages existants), il crée automatiquement la séquence :
- t+0 → ORDERS / SENT
- t+3s → ORDRSP / RECEIVED
- t+8s → DESADV / RECEIVED

Pas de modification de `OrdersContext`.

**Données mock :** 10 messages pré-remplis. Les 5 plus récents correspondent exactement aux lignes visibles dans l'image. Les 5 autres (plus anciens) alimentent les counts du tableau "Flux en cours" (3 ORDERS PENDING, 2 DESADV, 1 INVOIC PENDING, 0 ERROR) sans apparaître dans l'affichage tronqué du tableau.

**`connectionStatus`** : statique `'connected'` pour cette version.

---

## Structure de la page `/edi`

### Header
- Titre : `EDI — Échanges de données informatisés`
- Sous-titre : `Suivez vos flux EDI avec Dilicom et consultez l'historique des échanges avec vos diffuseurs.`
- Bouton droit : `Documentation Dilicom ↗` (`target="_blank"`, `rel="noopener noreferrer"`, style outline)

### Trois statcards (ligne)

**1. Statut de connexion**
- Badge vert + "Connecté à Dilicom"
- Dernière synchronisation : heure locale (`lastSync`)
- Identifiant Dilicom : `3012345678901` (hardcodé)
- Code librairie (GLN) : `3012345678901`
- Statut : badge "Actif"
- Depuis le : `12/03/2024`

**2. Diffuseurs connectés (5)**
- Liste fixe : Interforum (Editis), Hachette Livre, Média-Participations, Autodiffusion, UD Union Distribution — tous "Actif"
- Bouton "Gérer mes partenaires" (désactivé visuellement, `cursor: default`, toast "Fonctionnalité disponible prochainement")

**3. Flux en cours**
- 4 mini-blocs calculés dynamiquement depuis `messages` :
  - Commandes (ORDERS PENDING) → 3
  - Expéditions (DESADV) → 2
  - Factures (INVOIC PENDING) → 1
  - Erreurs (status ERROR) → 0

### Historique des échanges (section principale)

- Date range affichée (non interactive) : J-7 → aujourd'hui
- Bouton **Exporter** → export CSV (nom colonnes : Date, Type, Diffuseur, Référence, Statut, Détail)
- Onglets filtres : Tous | Commandes | Accusés (ORDRSP) | Expéditions (DESADV) | Factures (INVOIC) | Stocks (STOCK)
- Tableau 6 colonnes : Date/Heure | Type de message | Diffuseur | N° document | Statut | Détail + icône œil
- Labels d'affichage des types : `ORDERS` → "Commande (ORDERS)" | `ORDRSP` → "Accusé réception (ORDRSP)" | `DESADV` → "Expédition (DESADV)" | `INVOIC` → "Facture (INVOIC)" | `STOCK` → "Stock (STOCK)"
- Sous-titres des blocs "Flux en cours" : Commandes → "En attente d'accusé" | Expéditions → "En cours" | Facture → "En attente" | Erreur → "À traiter"
- Clic œil → ouvre `EDIMessageModal`
- Lien "Voir tout l'historique →" (affiche tous les messages sans filtre date, no-op pour l'instant)

**Badges statut :**
- SENT → vert (`success`) label "Envoyé"
- RECEIVED → vert label "Reçu"
- PENDING → orange (`accent`) label "En attente"
- ERROR → rouge (`error`) label "Erreur"

### Colonne droite (panneau fixe)

**Envoyer une commande via EDI**
- Texte explicatif
- Bouton `↑ Envoyer une commande` → navigue vers `/panier`
- Lien "Voir les commandes en attente (n) →" (count dynamique depuis messages ORDERS PENDING)

**Voir un message EDI**
- Input placeholder `Ex. CMD-2026-0426-001`
- Bouton "Afficher" → recherche dans `messages` par `documentRef`, ouvre modale si trouvé, toast "Référence introuvable" sinon

**Besoin d'aide ?**
- Téléphone : `01 40 20 40 20`
- Email : `edi@flowdiff.fr`
- Bouton "Nous contacter" → lien `/contact`

### Paramètres EDI (avant footer)

Card pleine largeur, deux colonnes :

**Colonne gauche — 2 toggles**
- "Préférer EDI par défaut" (sous-titre : "Toutes vos commandes seront envoyées via EDI.") — défaut ON
- "Notifications par email" (sous-titre : "Recevoir un email à chaque échange important.") — défaut ON
- Toggle actif : couleur `accent` (#C9A84C)

**Colonne droite**
- Select "Délai de relance" : options 12h / 24h / 48h (défaut : 24h)
- Bouton outline "Modifier les paramètres" → toast "Paramètres sauvegardés"

Persistance : `updateParams()` du context.

### Footer

Bandeau gris pleine largeur :  
`Les échanges EDI sont sécurisés et transitent via Dilicom. 🏢 DILICOM`

---

## EDIMessageModal.tsx

Props : `message: EDIMessage | null`, `onClose: () => void`

- Overlay sombre + fermeture au clic overlay
- En-tête : type message + `documentRef` + badge statut
- Corps : `<pre>` avec `JSON.stringify(message.payload, null, 2)`, police `DM Mono`, fond `gray.50`
- Bouton "Fermer"
- Design flat (pas d'ombre, `border-radius: 0`)

---

## Sidebar

Ajout dans `Sidebar.tsx`, section "OUTILS" (entre Panier existant et les autres) :

```ts
{ to: '/edi', label: 'EDI' }
```

Lien texte seul, cohérent avec les autres entrées de nav (pas d'icône — seul `IconLogout` utilise un SVG dans la sidebar).

---

## Routing

Dans `App.tsx` :
- Import lazy `EDIPage`
- Route `/edi` dans le groupe `ProtectedLayout`
- `EDIProvider` wrappé autour des routes protégées (après `OrdersProvider` car il le consomme)

---

## Non inclus dans cette version

- Vraie connexion Dilicom / appels API
- Filtres date interactifs
- Pagination du tableau
- Lien "Voir dans EDI" depuis HistoriquePage
- Stocks (STOCK) — onglet présent mais vide
