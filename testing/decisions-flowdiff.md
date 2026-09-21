# Décisions fonctionnelles FlowDiff

Ambiguïtés identifiées lors de l'audit croisé code / documentation / tests, avant lancement de la phase de tests.

---

## DEC-001 — Titres à paraître / "notés"

**Lots concernés :** LOT-04

**Règles concernées :**

* FLOW-RM-021
* FLOW-RM-028
* FLOW-RM-029

**Décision retenue :** les titres à paraître peuvent être ajoutés au panier et suivent le parcours de commande normal. Une pop-in informe l'utilisateur que le titre sera enregistré comme "noté". L'information "noté" est conservée dans les données pour exploitation future par le back-office.

### 1) Comportement visible par l'utilisateur

- Un titre à paraître peut être ajouté au panier depuis n'importe quel composant d'affichage (BookCard, BookCardRow, fiche produit, wishlists).
- Au clic sur "Ajouter au panier", une pop-in s'affiche : le titre sera enregistré comme "noté".
- Après confirmation, le titre est ajouté au panier.
- Le parcours est ensuite identique à un titre classique : panier, récapitulatif, adresses, transmission, confirmation.
- Pas de parcours utilisateur différent pour les titres à paraître.

### 2) Information métier conservée dans les données

Le "noté" ne doit pas être uniquement informatif. L'information doit persister dans la commande créée pour être exploitable par un futur back-office.

**Analyse du modèle existant :**

`OrderItem` (`src/data/mockOrders.ts:42-56`) possède déjà un champ `typeCommande?: TypeCommande`, mais le type union actuel `TypeCommande = 'MONO' | 'AP' | 'SUITE'` ne correspond pas aux types métier. Ces valeurs doivent être remplacées par les types de livres : `'A paraître' | 'Nouveauté' | 'Fonds'`.

Le mapping `CartItem` → `OrderItem` (`OrdersContext.tsx:124-139`) ne set pas `typeCommande` actuellement.

**Où conserver l'info, et pourquoi :**

| Niveau | Adapté ? | Raison |
|---|---|---|
| `Book` | Non | Le catalogue décrit un titre, pas une transaction. Un même livre peut être commandé en "noté" puis en commande classique après parution. |
| `CartItem` | Non nécessaire | `CartItem` embarque l'objet `Book` complet. `book.type === 'a-paraitre'` est déjà accessible pendant tout le parcours panier/checkout. `CartItem` est éphémère (localStorage, vidé après commande), le back-office n'y accède pas. |
| **`OrderItem`** | **Oui** | Ligne de commande persistée. Seul objet que le futur back-office interroge. Le champ `typeCommande` existe déjà, il faut corriger le type union et le positionner. |

**Recommandation d'architecture :**

1. Remplacer `TypeCommande = 'MONO' | 'AP' | 'SUITE'` par `TypeCommande = 'A paraître' | 'Nouveauté' | 'Fonds'` dans `mockOrders.ts:40`.
2. Positionner `typeCommande` dans le mapping `CartItem` → `OrderItem` (`OrdersContext.tsx:124-139`) en dérivant de `book.type` :

| `book.type` (BookType) | `typeCommande` (TypeCommande) |
|---|---|
| `'a-paraitre'` | `'A paraître'` |
| `'nouveaute'` | `'Nouveauté'` |
| `'fonds'` | `'Fonds'` |

3. Mettre à jour les données mock (`mockOrders.ts`) et le composant `BookCardRow.tsx` qui utilise les anciennes valeurs pour l'affichage de badges.

**Fiabilité à travers le parcours :**

| Étape | Info disponible | Via |
|---|---|---|
| Ajout au panier | Oui | `CartItem.book.type === 'a-paraitre'` |
| Modification quantité | Oui | Le `Book` reste dans `CartItem`, le type ne change pas |
| Checkout (récap, adresses, transmission) | Oui | `CartItem.book.type` accessible dans tous les steps |
| Création commande | **Non (manque)** | `typeCommande` n'est pas set dans `OrdersContext.tsx:124-139` |
| Commande persistée | **Non (manque)** | `typeCommande` absent des `OrderItem` créés par l'utilisateur |

L'information est disponible tout au long du parcours via `book.type`, mais se perd au moment de la création de commande.

### 3) Exploitation future par le back-office

Le futur back-office pourra filtrer `orderItem.typeCommande === 'A paraître'` pour identifier les titres provenant d'une demande de "noté". Cette information est un champ structuré sur chaque ligne de commande, pas une déduction du texte de la pop-in ni du type de livre au catalogue (un livre peut changer de type après parution).

### Trace du parcours actuel dans le code

**1) BookCard (`src/components/catalogue/BookCard.tsx`)**

Seul composant permettant aujourd'hui l'ajout des à paraître.

- Ligne 598 : `const isOrderable = !isEpuise` (n'exclut pas les à paraître).
- Ligne 622 : `if (isAParaitre) { setNotesPopinOpen(true); return }` ouvre la pop-in.
- Ligne 770 (mode coverFirst) / 944 (mode normal) : pop-in avec bouton OK qui appelle `confirmAdd(false)`.
- `confirmAdd(false)` appelle `addToCart(book, qty, { enReliquat: false })`.
- Message pop-in : "Le titre sera enregistré en noté et conservé indéfiniment" (coverFirst) / "Le titre sera enregistré en noté" (normal).
- Le toast affiche : `"${book.title}" ajouté au panier` (même message que pour un titre classique).

**2) BookCardRow (`src/components/catalogue/BookCardRow.tsx`)**

Bloque les à paraître.

- Ligne 803 : `const isOrderable = !isAParaitre && !isEpuise`.
- Ligne 1002 : `{isOrderable && (` masque la section d'ajout.

**3) FicheProduitPage (`src/pages/catalogue/FicheProduitPage.tsx`)**

Bloque les à paraître.

- Ligne 1388 : `const isOrderable = !isAParaitre && !isEpuise`.
- Lignes 1626, 1648 : `{isOrderable && (` masque les boutons d'ajout.
- `handleAdd` (ligne 1406) ne gère pas le cas `isAParaitre` (le bouton n'est pas affiché).

**4) Header / wishlists (`src/components/layout/Header.tsx`)**

Bloque les à paraître.

- Ligne 1413 : `{book.type !== 'a-paraitre' && (` masque le bouton d'ajout individuel.
- Ligne 1438 : `.filter(i => i.book.type !== 'a-paraitre')` exclut les à paraître de "Tout ajouter".

**5) addToCart (`src/contexts/CartContext.tsx:209`)**

Aucune vérification de `book.type`. Accepte tout objet `Book`. L'item est stocké comme un `CartItem` standard avec le `book` complet (qui contient `type: 'a-paraitre'`).

**6) `bookUtils.isOrderable()` (`src/lib/bookUtils.ts:3-5`)**

Code mort. Retourne `false` pour `a-paraitre`, mais n'est importé par aucun fichier du code source.

**7) CLAUDE.md**

Contient la règle : "les titres à paraître ne sont PAS commandables via l'app, consultation catalogue uniquement." Cette règle est en contradiction avec la décision retenue.

### Incohérences actuelles avec la décision retenue

| # | Fichier | Incohérence | Correction nécessaire |
|---|---|---|---|
| 1 | `BookCardRow.tsx:803` | `isOrderable = !isAParaitre && !isEpuise` bloque les à paraître | Aligner sur BookCard : `isOrderable = !isEpuise` + ajouter la pop-in "noté" |
| 2 | `FicheProduitPage.tsx:1388` | `isOrderable = !isAParaitre && !isEpuise` bloque les à paraître | Aligner sur BookCard : `isOrderable = !isEpuise` + ajouter la pop-in "noté" |
| 3 | `Header.tsx:1413,1438` | Filtre `book.type !== 'a-paraitre'` bloque les à paraître dans les wishlists | Supprimer le filtre + ajouter la pop-in "noté" |
| 4 | `bookUtils.ts` | `isOrderable()` retourne `false` pour à paraître. Code mort. | Supprimer le fichier ou aligner la fonction |
| 5 | `CLAUDE.md` (section "Règles métier importantes") | "les titres à paraître ne sont PAS commandables" | Mettre à jour pour refléter la décision "noté" |
| 6 | `OrdersContext.tsx:124-139` | Le mapping `CartItem` → `OrderItem` ne set pas `typeCommande` | Dériver `typeCommande` depuis `book.type` (`'a-paraitre'` → `'A paraître'`, `'nouveaute'` → `'Nouveauté'`, `'fonds'` → `'Fonds'`) |
| 7 | `mockOrders.ts:40` | `TypeCommande = 'MONO' \| 'AP' \| 'SUITE'` ne correspond pas aux types métier | Remplacer par `'A paraître' \| 'Nouveauté' \| 'Fonds'` |
| 8 | `mockOrders.ts` (données mock) | Les commandes mock utilisent `'MONO'`, `'SUITE'` | Mettre à jour avec les nouvelles valeurs |
| 9 | `BookCardRow.tsx:681-691,825,1087` | Badges et labels basés sur `'MONO'`, `'AP'`, `'SUITE'` | Adapter l'affichage aux nouvelles valeurs |

### Tests à prévoir

**Modèle de données :**
- Un `OrderItem` créé à partir d'un `CartItem` dont `book.type === 'a-paraitre'` a `typeCommande === 'A paraître'`.
- Un `OrderItem` créé à partir d'un `CartItem` dont `book.type === 'nouveaute'` a `typeCommande === 'Nouveauté'`.
- Un `OrderItem` créé à partir d'un `CartItem` dont `book.type === 'fonds'` a `typeCommande === 'Fonds'`.
- Le champ `typeCommande` est présent dans la commande persistée en localStorage.

**Parcours utilisateur :**
- La pop-in "noté" s'affiche pour les à paraître sur tous les composants (BookCard, BookCardRow, fiche produit, wishlists).
- Après confirmation, le titre est ajouté au panier normalement.
- Le titre à paraître passe dans le tunnel de commande (récap, adresses, transmission) sans blocage.

**Back-office (quand il sera créé) :**
- Un filtre `typeCommande === 'A paraître'` sur les `OrderItem` retourne exactement les titres ajoutés via le mécanisme "noté".

---

## DEC-002 — Divergence des modèles de statut de commande (admin, libraire, dashboard)

**Lots concernés :** LOT-09, LOT-12, LOT-15

**Règles concernées :**

* FLOW-RM-070
* FLOW-RM-098
* FLOW-RM-110

**Décision retenue :** garder la séparation des 3 modèles pour la phase de tests en cours. L'unification passera par la migration vers Supabase comme source unique, hors scope actuel.

### Origine de la divergence

Les 3 représentations ne correspondent pas à 3 domaines différents. C'est une incohérence historique : les 3 systèmes représentent la même chose (une commande libraire et son statut de traitement) mais ont été créés à des moments différents avec des conventions différentes.

La preuve directe : `orderToDashboardOrders` (`mockDashboard.ts:276`) convertit un `Order` libraire en `DashboardOrder[]`. Ce n'est pas 2 domaines séparés, c'est le même domaine affiché sur 2 écrans.

**1) Côté libraire** (`mockOrders.ts:30`, `storageSchemas.ts:21`) :
`OrderStatus = 'en préparation' | 'expédié' | 'livré'` (3 statuts, français avec accents). Le plus ancien, écrit pour l'affichage direct dans l'historique. Les valeurs servaient de labels. 3 statuts seulement car l'annulation n'existait pas dans le scope initial. Stocké en localStorage.

**2) Côté dashboard** (`mockDashboard.ts:16`) :
`DashboardOrder.cancelled: boolean`. Créé pour les KPI. Le dashboard n'a pas besoin du statut exact, juste de savoir si la commande compte dans le CA. Les `DashboardOrder` mock sont générés aléatoirement (~6% annulées). Quand une commande libraire est convertie en `DashboardOrder`, `cancelled` est toujours `false` (ligne 298) car aucune commande libraire ne peut être annulée.

**3) Côté admin** (`admin/types.ts:8`) :
`StatutCommande = 'en_preparation' | 'expedie' | 'livre' | 'annule'` (4 statuts, snake_case sans accents). Créé pour Supabase, convention SQL. Le 4e statut `annule` existe car l'admin peut changer le statut via `updateCommandeStatut`. Ce système ne communique jamais avec les 2 autres.

### Pourquoi ne pas unifier maintenant

- Le dashboard utilise un booléen `cancelled`, pas un statut string. Unifier touche toutes les fonctions de calcul (`computeKPIs`, `computeTopPublishers`, `computeDonutData`, le générateur aléatoire).
- L'admin est branché sur Supabase avec ses conventions SQL. Changer ses valeurs impacte la base.
- Les 3 systèmes ne communiquent pas. Rien dans le scope actuel ne les fait communiquer.
- Rapport effort/bénéfice faible pour la phase de tests.

### Cible future : Supabase source unique

Quand Supabase deviendra la source unique des commandes, les 3 systèmes liront les mêmes données avec les mêmes statuts. Les incohérences disparaîtront mécaniquement. Cette migration est hors scope de la phase de tests en cours.

### Impact sur les tests

Chaque lot teste son propre modèle indépendamment :
- LOT-09 : `storedOrdersSchema` rejette tout statut hors des 3 valeurs autorisées (y compris `annule` ou `annulé`).
- LOT-12 : `computeCAMois` exclut les `annule`.
- LOT-15 : `computeKPIs` exclut les `cancelled: true`. `orderToDashboardOrders` produit toujours `cancelled: false`.

---

## DEC-003 — Limite du panier partagé (mode démonstration)

**Lots concernés :** LOT-06, LOT-08

**Règles concernées :**

* FLOW-RM-038
* FLOW-RM-040

### 1) Règle du mode démonstration

**Décision retenue :** le panier de démonstration ne doit jamais dépasser 30 articles au total.

### 2) Raison de cette limite

FlowDiff est une démo destinée aux recruteurs avec un compte de démonstration partagé. La création d'un compte individuel n'est pas imposée aux recruteurs. La limite de 30 évite qu'un visiteur remplisse excessivement le panier et dégrade l'expérience des suivants.

Cette limite est une contrainte du mode démonstration, pas une limite métier de FlowDiff en version réelle.

### 3) Invariant technique à garantir

> **Aucun chemin de modification du panier ne doit permettre de dépasser 30 articles.**

La règle s'applique au total d'articles (somme des quantités de tous les items + articles OP). Le check est : `currentTotal + quantitéAjoutée > 30` → refus.

**Règle exacte :**
- 28 + 2 → autorisé (total 30)
- 29 + 1 → autorisé (total 30)
- 29 + 2 → refusé
- 29 + 3 → refusé
- 30 + 1 → refusé
- 30 + 5 → refusé

La modification de quantité sur un item existant suit la même règle : si le nouveau total dépasse 30, la modification est refusée.

### Audit des 3 fonctions qui modifient le nombre d'articles

#### 1) `addToCart` (`CartContext.tsx:209-243`)

Check actuel : `currentTotal >= CART_LIMIT` (ligne 216).

**Bug :** ne tient pas compte de `qty`. Si `currentTotal = 29` et `qty = 3`, le check `29 >= 30` passe, et le total monte à 32. Même problème quand le livre existe déjà dans le panier (`i.quantity + qty`, ligne 232).

Correction : `currentTotal + qty > CART_LIMIT` (aligné sur `addOPToCart`).

#### 2) `addOPToCart` (`CartContext.tsx:250-263`)

Check actuel : `currentTotal + opCount > CART_LIMIT` (ligne 257). **Correct.**

#### 3) `updateQty` (`CartContext.tsx:204-207`)

**Aucun check de limite.** Fixe directement la quantité d'un item existant. Le bouton + dans `CartPage.tsx:1577` appelle `updateQty(key, quantity + 1)` : les clics répétés dépassent 30 sans blocage.

Correction : calculer le nouveau total (total actuel - ancienne quantité de l'item + nouvelle quantité) et refuser si > 30.

### Inventaire complet de TOUS les chemins de modification du panier

#### Appels à `addToCart`

| Chemin | Fichier:ligne | Quantité passée | Boucle ? | Peut dépasser 30 ? | Pourquoi ? | Correction nécessaire ? |
|---|---|---|---|---|---|---|
| BookCard (ajout individuel) | `BookCard.tsx:612` | `qty` (state, min=1, pas de max, input numérique libre) | Non | Oui | L'utilisateur peut taper n'importe quel nombre dans l'input | Oui : corriger le check dans `addToCart` |
| FicheProduitPage (ajout) | `FicheProduitPage.tsx:1396` | `qty` (state, min=1, pas de max, input numérique libre) | Non | Oui | Même raison | Oui : même correction |
| Header (wishlist, individuel) | `Header.tsx:1415` | `1` | Non | Non | qty=1 fixe, mais le check `>=` au lieu de `+ qty >` peut poser problème au seuil exact de 30 | Oui : correction du check central suffit |
| Header (wishlist, tout ajouter) | `Header.tsx:1439` | `1` | Oui (forEach) | Non | qty=1 par appel ; `addToCart` utilise `setCart(prev => ...)` (functional updater), donc chaque appel dans la boucle voit le total mis à jour par le précédent ; s'arrête silencieusement quand le total atteint 30 | Non, mais les items au-delà de 30 sont ignorés sans feedback utilisateur |
| HistoriquePage (dupliquer commande) | `HistoriquePage.tsx:695` | `item.quantity` (quantité d'origine, peut être > 1) | Oui (for...of) | Oui | Si un item a qty=5 et currentTotal=27, le check `27 >= 30` passe et le total monte à 32 | Oui : correction du check central suffit |
| SelectionsPage (ajout individuel) | `SelectionsPage.tsx:1289` | `qty` (state, 1 par défaut) | Non | Oui | Si l'utilisateur augmente la quantité avant d'ajouter | Oui : correction du check central suffit |
| SelectionsPage (tout ajouter) | `SelectionsPage.tsx:1299` | `qtys[book.id] ?? 1` | Oui (forEach) | Oui | Si certains items ont qty > 1 | Oui : correction du check central suffit |
| FlashInfosPage (ajout) | `FlashInfosPage.tsx:494` | `getQty(fiId)` (state, 1 par défaut, +/- sans max) | Non | Oui | Si l'utilisateur augmente la quantité via les +/- avant d'ajouter | Oui : correction du check central suffit |
| TopVentesPage (ajout) | `TopVentesPage.tsx:618` | `1` | Non | Non | qty=1 fixe | Non |

#### Appels à `addOPToCart`

| Chemin | Fichier | Check correct ? | Peut dépasser 30 ? |
|---|---|---|---|
| SelectionsPage (OP) | `SelectionsPage.tsx:1260` | Oui : `currentTotal + opCount > CART_LIMIT` | Non |

#### Appels à `updateQty`

| Chemin | Fichier:ligne | Comportement | Check limite ? | Peut dépasser 30 ? | Correction nécessaire ? |
|---|---|---|---|---|---|
| CartPage (bouton +) | `CartPage.tsx:1577` | `updateQty(key, quantity + 1)` | Non | Oui : clics répétés dépassent 30 | Oui : ajouter le check dans `updateQty` |
| CartPage (bouton -) | `CartPage.tsx:1575` | `updateQty(key, quantity - 1)` | Non | Non : diminue la quantité | Non |

#### Autres chemins vérifiés (ne modifient pas le total à la hausse)

| Chemin | Fichier | Impact sur le total | Peut dépasser 30 ? |
|---|---|---|---|
| `removeFromCart` | `CartContext.tsx:200-202` | Diminue | Non |
| `removeOP` | `CartContext.tsx:246-248` | Diminue | Non |
| `clearCart` | `CartContext.tsx:269` | Remet à 0 | Non |
| `RdvContext.updateQty` | `RdvContext.tsx:76` | Système séparé (RDV, pas le panier) | Non applicable |

### Cas limites vérifiés

| Cas | Attendu | Comportement actuel |
|---|---|---|
| Panier à 29, ajout de qty=1 | Autorisé (total 30) | `29 >= 30` = false → autorisé. **OK** |
| Panier à 29, ajout de qty=2 | Refusé (total 31) | `29 >= 30` = false → autorisé. **BUG** |
| Panier à 30, ajout de qty=1 | Refusé | `30 >= 30` = true → refusé. **OK** |
| Livre déjà dans le panier (qty=3), panier total=28, ajout de qty=3 sur ce livre | Refusé (28+3=31) | `28 >= 30` = false → autorisé, merge qty=6. **BUG** |
| `updateQty` passe un item de qty=1 à qty=5, panier total=28 | Refusé (28-1+5=32) | Pas de check. **BUG** |
| Duplication d'une commande de 10 items (qty=1 chacun) avec panier à 25 | 5 ajoutés, 5 ignorés | Functional updater : chaque appel voit le total mis à jour. Les 5 premiers passent (`25>=30` à `29>=30` = false), le 6e est bloqué (`30>=30` = true). **OK pour qty=1, mais le message d'erreur s'affiche 5 fois** |
| Duplication d'une commande avec 1 item à qty=10, panier à 25 | Refusé (25+10=35) | `25 >= 30` = false → autorisé. **BUG** |

### Tests existants sur la limite

- `formSchemas.test.ts:101,109` : vérifie que `cartQtySchema` accepte 30 et refuse 31. C'est la validation de quantité **individuelle** par item, pas du total du panier.
- Aucun test ne couvre `addToCart` avec la limite de 30 articles au total.
- Aucun test ne couvre `updateQty` avec la limite.

### Incohérences actuelles avec la décision retenue

| # | Fichier:ligne | Incohérence | Correction nécessaire |
|---|---|---|---|
| 1 | `CartContext.tsx:216` | `addToCart` vérifie `currentTotal >= CART_LIMIT` au lieu de `currentTotal + qty > CART_LIMIT` | Aligner sur `addOPToCart` : `currentTotal + qty > CART_LIMIT` |
| 2 | `CartContext.tsx:204-207` | `updateQty` n'a aucun check de limite | Ajouter : calculer le nouveau total, refuser si > `CART_LIMIT` |
| 3 | `BookCard.tsx` (input qty) | Input numérique sans attribut `max` ni validation plafond | Défense en profondeur : limiter l'input (le vrai garde-fou est dans `addToCart`) |
| 4 | `FicheProduitPage.tsx` (input qty) | Input numérique sans attribut `max` ni validation plafond | Même correction |
| 5 | `FlashInfosPage.tsx` (qty +/-) | Pas de max sur les +/- | Même correction |
| 6 | `CartContext.tsx:217-219` | Message d'erreur suppose que le panier est déjà plein | Adapter le message au cas "l'ajout de X articles ferait dépasser la limite" |

### Tests à prévoir (LOT-06)

**`addToCart` :**
- Panier 29, ajout qty=1 : accepté (total 30).
- Panier 30, ajout qty=1 : refusé.
- Panier 29, ajout qty=3 : refusé (29 + 3 > 30).
- Panier 27, ajout qty=3 : accepté (27 + 3 = 30).
- Livre déjà dans le panier (qty=3), total=28, ajout qty=3 sur ce livre : refusé (28 + 3 > 30).
- Livre déjà dans le panier (qty=2), total=28, ajout qty=2 sur ce livre : accepté (28 + 2 = 30).

**`updateQty` :**
- Total=28, item qty=2, passer à qty=5 : refusé (28 - 2 + 5 = 31 > 30).
- Total=28, item qty=2, passer à qty=4 : accepté (28 - 2 + 4 = 30).
- Passer un item à qty=0 : suppression (comportement existant).

**`addOPToCart` :**
- `currentTotal + opCount > 30` : refusé (déjà correct dans le code).

---

## Constat factuel : taux de remise par défaut (LOT-06)

Ce point a été vérifié à la demande. Il ne nécessite pas de décision.

**Règle concernée :** FLOW-RM-041

**Constat :**

Les taux par défaut sont clairement définis dans `REMISE_RATES` (`CartContext.tsx:10-15`) : BD/Mangas 30%, Jeunesse 30%, Littérature 35%, Adulte-pratique 35%.

Les tests `computeTotals.test.ts` utilisent 2 jeux de taux :
- Tests 1 à 6 : taux personnalisés (Littérature 9%, BD/Mangas 10%, Jeunesse 8%, Adulte-pratique 9%)
- Test 7 (ligne 77, "récap 4 articles réels") : taux réels (BD/Mangas 30%, Littérature 35%, Jeunesse 30%, Adulte-pratique 35%)

`computeTotals` prend toujours les taux en paramètre. Le mécanisme de fallback vers les taux par défaut est dans `CartProvider.effectiveRates` (ligne 185-189) : si l'utilisateur n'a pas de `remisesParUnivers`, on utilise `REMISE_RATES`. Ce fallback n'est pas couvert par un test.

**Pas d'ambiguïté fonctionnelle :** le comportement est non ambigu à la lecture du code. Le dernier test utilise les taux réels, ce qui confirme que la formule fonctionne avec ces valeurs. Le seul manque est un test d'intégration vérifiant que `effectiveRates` retourne bien `REMISE_RATES` quand l'utilisateur n'a pas de taux personnalisés.

**Recommandation pour les tests :** ajouter dans LOT-06 un test qui vérifie les valeurs de `REMISE_RATES` et un test d'intégration de `effectiveRates` avec un utilisateur sans `remisesParUnivers`.

---

## Récapitulatif des décisions

| Décision | Règle retenue | Conséquence pour les tests |
|---|---|---|
| DEC-001 | Les titres à paraître suivent le parcours normal, sont enregistrés comme "notés" via `typeCommande: 'A paraître'` sur `OrderItem` | Tester le mapping `CartItem` → `OrderItem` (champ `typeCommande` pour les 3 types), la pop-in "noté" sur tous les composants, et le parcours complet sans blocage |
| DEC-002 | Garder la séparation des 3 modèles pour les tests. Unification via migration Supabase (hors scope) | Chaque lot teste son propre modèle indépendamment |
| DEC-003 | Le panier démo est limité à 30 articles au total (contrainte du mode démonstration, pas une limite métier) | Tester l'invariant sur les 3 fonctions (`addToCart`, `updateQty`, `addOPToCart`) avec les cas limites exacts (29+1, 29+2, merge qty, updateQty) |

### Incohérences restantes entre les décisions retenues et le code actuel

**DEC-001 :** 9 points à corriger. Le type `TypeCommande` doit passer de `'MONO' | 'AP' | 'SUITE'` à `'A paraître' | 'Nouveauté' | 'Fonds'`. Le mapping `CartItem` → `OrderItem` dans `OrdersContext.tsx:124-139` ne positionne pas `typeCommande`. Les composants BookCardRow, FicheProduitPage et Header bloquent encore les à paraître. Les données mock et les badges dans BookCardRow utilisent les anciennes valeurs.

**DEC-003 :** 6 points à corriger. Le principal : `addToCart` vérifie `currentTotal >= CART_LIMIT` au lieu de `currentTotal + qty > CART_LIMIT`, et `updateQty` n'a aucun check de limite.
