# Inventaire des tests : LOT-06 : Panier, ajout, modification et persistance

## Résumé

| État | Nb règles |
|------|-----------|
| 🟢 Testable en unitaire | 7 |
| 🟢 Déjà couvert | 4 |
| 🟠 Partiel (unitaire + smoke) | 1 |
| 🔴 Vérifiable à la main uniquement | 0 |
| **Total** | **12** |

---

## Règles déjà couvertes

### FLOW-RM-043 : Remise sur ouvrages (y compris OP) mais PAS sur PLV

- **État** : 🟢 Déjà couvert
- **Tests existants** : `src/contexts/__tests__/computeTotals.test.ts` (1 test dédié)

### FLOW-RM-044 : TVA fixe 5,5% extraite du net TTC

- **État** : 🟢 Déjà couvert
- **Tests existants** : `src/contexts/__tests__/computeTotals.test.ts` (tests 4 et 7)

### FLOW-RM-045 : Formule : netHT = (subtotalTTC - remiseTTC) / 1.055

- **État** : 🟢 Déjà couvert
- **Tests existants** : `src/contexts/__tests__/computeTotals.test.ts` (tests 7 et 8)

### FLOW-RM-046 : Panier vide : computeTotals retourne tout à 0

- **État** : 🟢 Déjà couvert
- **Tests existants** : `src/contexts/__tests__/computeTotals.test.ts` (test 1)

---

## Règles à tester en unitaire

### FLOW-RM-041 : Remises par défaut par univers

- **État** : 🟢 Testable en unitaire
- **Tests existants** : `computeTotals.test.ts` utilise des taux personnalisés (9%, 10%, 8%), pas les taux réels. Le test 7 utilise les vrais taux mais ne vérifie pas les valeurs de la constante.
- **Constante** : `REMISE_RATES` (`CartContext.tsx:10-16`)
- **Cas à couvrir** :
  - BD/Mangas = 0.30
  - Jeunesse = 0.30
  - Littérature = 0.35
  - Adulte-pratique = 0.35
  - Les 4 univers sont présents comme clés

### FLOW-RM-038 : Limite du panier à 30 articles

- **État** : 🟢 Testable en unitaire (via renderHook + CartProvider)
- **Tests existants** : `formSchemas.test.ts` teste `cartQtySchema` (quantité individuelle), pas le total panier
- **Fonction** : `addToCart` dans CartProvider (`CartContext.tsx:209-243`)
- **Pattern de test** : `renderHook(useCart, { wrapper: CartProvider })` + `act(() => result.current.addToCart(...))`
- **Bug connu (DEC-003)** : le check actuel est `currentTotal >= CART_LIMIT` au lieu de `currentTotal + qty > CART_LIMIT`. Les tests pour le comportement correct seront red (TDD).
- **Cas à couvrir** :
  - Panier 29, ajout qty=1 : accepté (total 30)
  - Panier 30, ajout qty=1 : refusé
  - Panier 29, ajout qty=3 : refusé (29 + 3 > 30) : **red** (bug DEC-003)
  - Panier 27, ajout qty=3 : accepté (27 + 3 = 30) : **red** (bug DEC-003)
  - Livre déjà dans le panier (qty=3), total=28, ajout qty=3 : refusé : **red** (bug DEC-003)

### FLOW-RM-039 : Ajout : même livre = incrémentation quantité

- **État** : 🟢 Testable en unitaire (via renderHook)
- **Tests existants** : aucun
- **Fonction** : `addToCart` merge par `book.id + ebookOption` (`CartContext.tsx:224-232`)
- **Cas à couvrir** :
  - Ajouter 2 fois le même livre : 1 item avec quantité cumulée
  - Ajouter le même livre avec ebookOption différent : 2 items distincts
  - Ajouter un livre différent : 2 items distincts

### FLOW-RM-040 : Limite atteinte : toast d'erreur, panier inchangé

- **État** : 🟢 Testable en unitaire (via renderHook + mock showToast)
- **Tests existants** : aucun
- **Fonction** : `addToCart` (`CartContext.tsx:216-221`)
- **Cas à couvrir** :
  - Limite atteinte : `showToast` appelé avec type `'error'`
  - Limite atteinte : les items restent inchangés (pas d'ajout)

### FLOW-RM-047 : updateQty < 1 supprime l'article

- **État** : 🟢 Testable en unitaire (via renderHook)
- **Tests existants** : aucun
- **Fonction** : `updateQty` (`CartContext.tsx:204-206`)
- **Cas à couvrir** :
  - `updateQty(key, 0)` : l'item est supprimé
  - `updateQty(key, -1)` : l'item est supprimé
  - `updateQty(key, 3)` : la quantité passe à 3

### FLOW-RM-049 : Validation panier stocké via Zod : données invalides = panier vidé

- **État** : 🟢 Testable en unitaire (via renderHook + localStorage prérempli)
- **Tests existants** : `storageSchemas.test.ts` teste le schéma. La logique de purge dans `loadCart` (`CartContext.tsx:107-118`) n'est pas testée.
- **Cas à couvrir** :
  - localStorage contient un JSON invalide (pas un objet) : panier vide
  - localStorage contient un item avec quantity=0 : panier vidé (Zod rejette)
  - localStorage contient un item sans book.id : panier vidé
  - localStorage contient des données valides : panier chargé correctement
  - localStorage vide : panier vide

---

## Règle partielle

### FLOW-RM-042 : Taux effectifs libraire prioritaires sur REMISE_RATES

- **État** : 🟠 Unitaire + smoke
- **Tests existants** : aucun
- **Logique** : `effectiveRates` dans CartProvider (`CartContext.tsx:185-189`) : si `user.remisesParUnivers` est défini, divise par 100 ; sinon utilise `REMISE_RATES`
- **Part unitaire** :
  - Utilisateur sans `remisesParUnivers` : les totaux sont calculés avec les taux par défaut (30%/35%)
  - Utilisateur avec `remisesParUnivers: { 'BD/Mangas': 25 }` : les totaux utilisent 0.25 pour BD/Mangas
- **Part smoke** :
  - Vérifier visuellement que le prix net affiché dans BookCard et dans le récap panier correspond aux taux du libraire connecté

### FLOW-RM-048 : Panier persisté en localStorage par codeClient

- **État** : 🟢 Déjà couvert dans `storageKeyIsolation.test.tsx` (LOT-03)
- **Tests existants** : 3 tests (charge par codeClient, suffixe guest, isolation entre clients)
- Le chargement est couvert. L'écriture (persistance après ajout) pourrait être renforcée, mais le mécanisme useEffect + localStorage.setItem est standard React et le chargement prouve que l'écriture fonctionne.

---

## Récapitulatif pour unit-test-writer

| ID | Règle | Fichier test | À faire |
|----|-------|-------------|---------|
| FLOW-RM-038 | Limite 30 articles | `src/contexts/__tests__/cartOperations.test.tsx` | Nouveau : tests addToCart avec limite (certains red, bug DEC-003) |
| FLOW-RM-039 | Même livre = incrémentation | `src/contexts/__tests__/cartOperations.test.tsx` | Nouveau : merge par book.id, distinction ebook |
| FLOW-RM-040 | Toast erreur limite | `src/contexts/__tests__/cartOperations.test.tsx` | Nouveau : showToast appelé, panier inchangé |
| FLOW-RM-041 | Remises par défaut | `src/contexts/__tests__/computeTotals.test.ts` | Compléter : vérifier valeurs REMISE_RATES |
| FLOW-RM-042 | Taux effectifs prioritaires | `src/contexts/__tests__/cartOperations.test.tsx` | Nouveau : effectiveRates avec/sans remisesParUnivers |
| FLOW-RM-043 | Remise ouvrages pas PLV | — | Rien (déjà couvert) |
| FLOW-RM-044 | TVA 5,5% | — | Rien (déjà couvert) |
| FLOW-RM-045 | Formule netHT | — | Rien (déjà couvert) |
| FLOW-RM-046 | Panier vide = 0 | — | Rien (déjà couvert) |
| FLOW-RM-047 | updateQty < 1 supprime | `src/contexts/__tests__/cartOperations.test.tsx` | Nouveau : suppression, modification |
| FLOW-RM-048 | Persistance par codeClient | — | Déjà couvert (LOT-03, storageKeyIsolation) |
| FLOW-RM-049 | Validation Zod purge | `src/contexts/__tests__/cartOperations.test.tsx` | Nouveau : localStorage invalide = panier vide |

## Notes pour unit-test-writer

- **Pattern de test context** : voir `src/contexts/__tests__/storageKeyIsolation.test.tsx` pour le setup (mock AuthContext, mock ToastContext, renderHook avec Wrapper).
- **Tests red attendus** : FLOW-RM-038 cas multi-qty (DEC-003). Écrire les tests pour le comportement CORRECT (`currentTotal + qty > CART_LIMIT`). Ils échoueront sur le code actuel, c'est normal (TDD).
- **CART_LIMIT = 30** : constante exportée depuis `CartContext.tsx:8`.
- **REMISE_RATES** : constante exportée depuis `CartContext.tsx:10-16`.
