# Lots de travail de test FlowDiff

18 lots couvrant les 134 règles identifiées dans `testing/audit-flowdiff.md`.

---

## LOT-01 — Auth : login et gestion de session

### Objectif

Couvrir le cycle de login (identifiant code client ou email, validation Zod, bcrypt), la création de token JWT mock, et la gestion de session au montage (restauration, nettoyage de tokens invalides).

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-001 | Login accepte code client OU email (insensible à la casse) | `src/contexts/AuthContext.tsx:64-68` | `AuthContext.test.tsx` : 2 tests |
| FLOW-RM-002 | Login valide mot de passe via bcrypt.compare | `src/contexts/AuthContext.tsx:117-121` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-003 | Login échoue si identifiant introuvable | `src/contexts/AuthContext.tsx:112-114` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-004 | Login valide les entrées avec Zod (loginSchema) | `src/contexts/AuthContext.tsx:107-109` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-005 | Token JWT mock expire après 8h | `src/lib/authUtils.ts:73` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-006 | Restauration de session au montage si token valide | `src/contexts/AuthContext.tsx:89-103` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-007 | Token malformé nettoyé au montage | `src/contexts/AuthContext.tsx:99-101` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-008 | Token valide mais utilisateur introuvable : token nettoyé | `src/contexts/AuthContext.tsx:96-98` | Aucun |

### Hors périmètre

Inscription (LOT-02), logout et routes protégées (LOT-03), loginSchema unitaire (LOT-02).

### Points à clarifier

Aucun.

---

## LOT-02 — Auth : inscription et schémas de validation

### Objectif

Couvrir le flux d'inscription (validation code client, correspondance email, unicité par session, hash bcrypt, connexion auto) et les schémas Zod d'authentification testés unitairement (passwordSchema, registerSchema, loginSchema, forgotPasswordSchema).

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-009 | Inscription : code client doit exister dans VALID_CLIENT_CODES | `src/contexts/AuthContext.tsx:138-143` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-010 | Inscription : email doit correspondre au code client | `src/contexts/AuthContext.tsx:144-149` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-011 | Inscription : un seul compte par code client par session | `src/contexts/AuthContext.tsx:152-155` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-012 | Inscription : mot de passe hashé bcrypt cost 12 | `src/contexts/AuthContext.tsx:14,162` | Partiel (succès testé, cost factor non vérifié) |
| FLOW-RM-013 | Inscription réussie connecte automatiquement l'utilisateur | `src/contexts/AuthContext.tsx:166-167` | `AuthContext.test.tsx` : 1 test |
| FLOW-RM-014 | Mot de passe : min 8 chars, 1 majuscule, 1 chiffre, 1 spécial | `src/lib/authUtils.ts:29-33` | Indirect via AuthContext |
| FLOW-RM-015 | Code client : min 3, max 20, trimmed, uppercased | `src/lib/authUtils.ts:17-22` | Aucun |
| FLOW-RM-019 | Confirmation mot de passe doit correspondre (registerSchema) | `src/lib/authUtils.ts:38-41` | Indirect via AuthContext |

### Hors périmètre

Login (LOT-01), logout (LOT-03), forgotPasswordSchema (comportement mock sans action réelle, pas de règle métier testable au-delà de la validation email).

### Points à clarifier

Aucun.

---

## LOT-03 — Auth : logout, routes protégées et isolation

### Objectif

Couvrir le logout (ce qui est supprimé vs conservé), la protection des routes, la sécurité anti open-redirect, et l'isolation des données par codeClient.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-016 | Logout supprime token et wishlist username, conserve panier et historique | `src/contexts/AuthContext.tsx:176-182` | `AuthContext.test.tsx` : 2 tests |
| FLOW-RM-017 | ProtectedRoute redirige vers /login, sauvegarde pathname d'origine | `src/components/auth/ProtectedRoute.tsx:12-14` | Aucun |
| FLOW-RM-018 | Redirection post-login sécurisée (anti open-redirect) | `src/lib/authUtils.ts:102-115` | `authUtils.test.ts` : 10 tests |
| FLOW-RM-020 | Données isolées par codeClient (clés localStorage suffixées) | Multiples contexts | Aucun |

### Hors périmètre

Login (LOT-01), inscription (LOT-02). L'isolation par codeClient est transversale (panier, commandes, wishlists, EDI, RDV), mais le test de la mécanique d'isolation elle-même appartient ici.

### Points à clarifier

Aucun.

---

## LOT-04 — Catalogue : types, statuts et commandabilité

### Objectif

Couvrir la classification des titres (types, univers, statuts de stock), les règles de résolution de statut, et la commandabilité (isOrderable, comportement BookCard vs BookCardRow). Ce lot contient l'incohérence majeure identifiée dans l'audit.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-021 | Un titre à paraître n'est pas commandable (isOrderable) | `src/lib/bookUtils.ts:3-5` | `bookUtils.test.ts` : 3 tests |
| FLOW-RM-022 | 3 types de titres : nouveaute, a-paraitre, fonds | `src/data/mockBooks.ts:2` | Implicite via isOrderable |
| FLOW-RM-023 | 4 univers : Littérature, BD/Mangas, Jeunesse, Adulte-pratique | `src/data/mockBooks.ts:1` | Aucun |
| FLOW-RM-024 | 6 statuts de stock | `src/data/mockBooks.ts:4-10` | `fondsFilter.test.ts` (indirect) |
| FLOW-RM-025 | Statuts sur_commande/en_reimp interdits pour nouveautés (forçage à disponible) | `src/data/mockBooks.ts:742-751` | Aucun |
| FLOW-RM-026 | Les titres à paraître n'ont pas de statut de stock | `src/data/mockBooks.ts:753-757` | Aucun |
| FLOW-RM-027 | Un titre épuisé/rupture affiché « Indisponible » (bouton désactivé) | `src/components/catalogue/BookCard.tsx:596-598` | Aucun |
| FLOW-RM-028 | BookCard permet l'ajout au panier d'un titre à paraître | `src/components/catalogue/BookCard.tsx:622` | Aucun |
| FLOW-RM-029 | BookCardRow bloque l'ajout pour a-paraitre ET épuisé | `src/components/catalogue/BookCardRow.tsx:803` | Aucun |
| FLOW-RM-030 | Titre sur_commande/en_reimp : modale de confirmation avant ajout | `src/components/catalogue/BookCard.tsx:597,623` | Aucun |

### Hors périmètre

Recherche et filtrage (LOT-05), affichage des tooltips stock (LOT-16), modale StockAlertModal (LOT-16).

### Points à clarifier

**Incohérence majeure** : FLOW-RM-021 (`isOrderable` retourne false pour a-paraitre), FLOW-RM-028 (BookCard permet l'ajout) et FLOW-RM-029 (BookCardRow le bloque) divergent. CLAUDE.md dit « les titres à paraître ne sont PAS commandables ». Avant d'écrire les tests, il faut trancher : quel est le comportement attendu ? Les tests devront refléter la décision.

---

## LOT-05 — Catalogue : recherche et filtrage

### Objectif

Couvrir la recherche locale multi-champs (titre, auteur, ISBN, collection, genre), la recherche ISBN directe, le fallback Supabase vers mock, le filtrage par prix et par univers+statut, le calcul du prix net remisé, et la structure genres/univers.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-031 | Recherche locale multi-champs | `src/services/books.ts:76-87` | `books.test.ts` : 4 tests (titre, auteur seulement) |
| FLOW-RM-032 | Recherche ISBN directe : correspondance exacte, trim | `isbnSearch.test.ts` | `isbnSearch.test.ts` : 3 tests |
| FLOW-RM-033 | ~~Fallback Supabase vers données mock~~ **Hors périmètre** : Supabase supprimé, l'app charge uniquement les mocks | `src/services/books.ts` | n/a |
| FLOW-RM-034 | Filtrage par prix TTC : borne inf incluse, borne sup exclue | `src/data/mockBooks.ts:89-92` | Aucun |
| FLOW-RM-035 | Filtrage cumulatif univers + statut (page Fonds) | `src/pages/fonds/FondsPage.tsx` | `fondsFilter.test.ts` : 5 tests |
| FLOW-RM-036 | Calcul prix net remisé : priceTTC * (1 - rate) | `src/components/catalogue/BookCard.tsx:582-585` | `priceNet.test.ts` : 3 tests |
| FLOW-RM-037 | Genres rattachés à chaque univers (GENRE_BY_UNIVERSE) | `src/data/mockBooks.ts:39-76` | Aucun |

### Hors périmètre

Types de titres et commandabilité (LOT-04), ajout au panier (LOT-06).

### Points à clarifier

Aucun.

---

## LOT-06 — Panier : ajout, modification et persistance

### Objectif

Couvrir les opérations sur le panier (ajout, incrémentation, suppression, limite), le calcul des totaux (remises par univers, TVA 5,5%, formule netHT), et la persistance/validation du panier en localStorage.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-038 | Limite du panier à 30 articles (CART_LIMIT) | `src/contexts/CartContext.tsx:8,216-221` | `formSchemas.test.ts` (schéma), addToCart non testé |
| FLOW-RM-039 | Ajout : même livre = incrémentation quantité | `src/contexts/CartContext.tsx:224-232` | Aucun |
| FLOW-RM-040 | Limite atteinte : toast d'erreur, panier inchangé | `src/contexts/CartContext.tsx:216-221` | Aucun |
| FLOW-RM-041 | Remises par défaut : BD/Mangas 30%, Jeunesse 30%, Littérature 35%, Adulte-pratique 35% | `src/contexts/CartContext.tsx:11-16` | Partiel (tests utilisent d'autres taux) |
| FLOW-RM-042 | Taux effectifs libraire prioritaires sur REMISE_RATES | `src/contexts/CartContext.tsx:184-189` | Aucun |
| FLOW-RM-043 | Remise sur ouvrages (y compris OP) mais PAS sur PLV | `src/contexts/CartContext.tsx:129-136` | `computeTotals.test.ts` : 1 test |
| FLOW-RM-044 | TVA fixe 5,5% (taux livre) extraite du net TTC | `src/contexts/CartContext.tsx:142-144` | `computeTotals.test.ts` |
| FLOW-RM-045 | Formule : netHT = (subtotalTTC - remiseTTC) / 1.055 | `src/contexts/CartContext.tsx:141-145` | `computeTotals.test.ts` |
| FLOW-RM-046 | Panier vide : computeTotals retourne tout à 0 | `src/contexts/CartContext.tsx:120-145` | `computeTotals.test.ts` : 1 test |
| FLOW-RM-047 | updateQty < 1 supprime l'article | `src/contexts/CartContext.tsx:204-206` | Aucun |
| FLOW-RM-048 | Panier persisté en localStorage par codeClient | `src/contexts/CartContext.tsx:91-93,178-182` | Aucun |
| FLOW-RM-049 | Validation panier stocké via Zod : données invalides = panier vidé | `src/contexts/CartContext.tsx:113-118` | `storageSchemas.test.ts` (schéma), logique purge non testée |

### Hors périmètre

Tunnel de commande (LOT-07), ebooks et OP (LOT-08), storedCartSchema unitaire (LOT-18).

### Points à clarifier

**Ambiguïté FLOW-RM-041** : les tests de computeTotals utilisent des taux personnalisés (9%, 10%, 8%) et non les taux par défaut réels (30%, 35%). Un changement des taux par défaut ne casserait aucun test.

---

## LOT-07 — Panier : tunnel de commande

### Objectif

Couvrir les 3 étapes du checkout (récapitulatif, adresses, transmission), la validation d'adresse, le choix du mode de transmission, la confirmation de commande, et les options associées (livraison, référence, messages de succès).

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-050 | Tunnel en 3 étapes : récapitulatif, adresses, transmission | `src/pages/cart/checkoutSteps.ts` | `checkoutSteps.test.ts` : 8 tests |
| FLOW-RM-051 | Adresse de livraison : rue, code postal 5 chiffres, ville | `src/pages/cart/checkoutSchemas.ts:9-13` | `checkoutSchemas.test.ts` : 7 tests |
| FLOW-RM-052 | Mode de transmission : FLOWDIFF ou EDI (Dilicom) | `src/pages/cart/checkoutSchemas.ts:3-7` | Aucun |
| FLOW-RM-053 | Mode de transmission par défaut : FLOWDIFF | `src/contexts/CartContext.tsx:104` | Aucun |
| FLOW-RM-054 | Préférence mode transmission persistée par codeClient | `src/contexts/CartContext.tsx:272-277` | Aucun |
| FLOW-RM-055 | Confirmation : crée order, vide panier, écran de succès | `src/pages/cart/CartPage.tsx:1185-1208` | Aucun |
| FLOW-RM-056 | Si articles en reliquat, toast « notifié par email » | `src/pages/cart/CartPage.tsx:1206-1208` | Aucun |
| FLOW-RM-057 | Message de succès différent FLOWDIFF vs EDI | `src/pages/cart/CartPage.tsx:1217-1245` | Aucun |
| FLOW-RM-058 | Référence commande : globale max 35 car + par ligne max 35 car | `src/pages/cart/CartPage.tsx:1501-1509` | Aucun |
| FLOW-RM-059 | Livraison : standard (1-3 jours) ou date spécifique (>= aujourd'hui) | `src/pages/cart/CartPage.tsx:1736-1757` | Aucun |

### Hors périmètre

Ajout au panier et calcul des totaux (LOT-06), ebooks et OP (LOT-08), création de commande côté OrdersContext (LOT-09).

### Points à clarifier

Aucun.

---

## LOT-08 — Panier : ebooks, OP et reliquat

### Objectif

Couvrir les cas particuliers du panier : snapshot stock à l'ajout, flag reliquat pour les titres en réimpression, support ebook (ISBN + hébergeur), adresse de facturation, et structure des opérations promotionnelles (cadeau + PLV).

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-060 | Snapshot statut stock au moment de l'ajout | `src/contexts/CartContext.tsx:31` | Aucun |
| FLOW-RM-061 | Article en reliquat (en_reimp) : flag enReliquat | `src/contexts/CartContext.tsx:33` | Aucun |
| FLOW-RM-062 | Option « Adresse de facturation identique » (par défaut oui) | `src/pages/cart/CartPage.tsx:1122,1348-1358` | Aucun |
| FLOW-RM-063 | Ebooks supportés avec ISBN spécifique et hébergeur | `src/contexts/CartContext.tsx:19-24` | Aucun |
| FLOW-RM-064 | Opérations promotionnelles : cadeau offert + PLV payante | `src/contexts/CartContext.tsx:36-56` | `computeTotals.test.ts` (calcul PLV), ajout/suppression non testé |

### Hors périmètre

Calcul des totaux pour PLV (couvert dans LOT-06 via computeTotals), modale de confirmation stock (LOT-16).

### Points à clarifier

Aucun.

---

## LOT-09 — Commandes et historique

### Objectif

Couvrir la création de commande (numérotation séquentielle, statut initial, ediStatus), l'isolation par codeClient, les types de commande, les modes de livraison, et la migration de storage.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-065 | Numéro séquentiel CMD0000001+, compteur persisté | `src/contexts/OrdersContext.tsx:33-38` | Aucun |
| FLOW-RM-066 | Compteur initial à 14 (CMD0000001-014 réservés aux mocks) | `src/contexts/OrdersContext.tsx:16` | Aucun |
| FLOW-RM-067 | Commande créée avec statut « en préparation » | `src/contexts/OrdersContext.tsx:146` | Aucun |
| FLOW-RM-068 | ediStatus = PENDING si transmissionMode === EDI | `src/contexts/OrdersContext.tsx:151` | Aucun |
| FLOW-RM-069 | Commandes filtrées par codeClient | `src/contexts/OrdersContext.tsx:179-182` | Aucun |
| FLOW-RM-070 | 3 statuts : en préparation, expédié, livré | `src/data/mockOrders.ts:30-32` | `storageSchemas.test.ts` (schéma) |
| FLOW-RM-071 | Types de commande : MONO, AP, SUITE | `src/data/mockOrders.ts:40` | Aucun |
| FLOW-RM-072 | 2 modes de livraison : standard ou specific | `src/contexts/OrdersContext.tsx:57` | Aucun |
| FLOW-RM-073 | Migration storage : efface si STORAGE_VERSION change | `src/contexts/OrdersContext.tsx:19-31` | Aucun |

### Hors périmètre

Tunnel de commande et confirmation (LOT-07), retours (LOT-10), storedOrdersSchema unitaire (LOT-18).

### Points à clarifier

Aucun.

---

## LOT-10 — Retours

### Objectif

Couvrir l'éligibilité au retour (seules commandes livrées), les motifs, la validation (chaque article doit avoir un motif), la création de retour (statut initial pending), les statistiques (activeCount, avoirYTD, returnRatio, sectorAverage), et le filtrage par codeClient.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-074 | Seules les commandes « livré » sont éligibles au retour | `src/components/historique/NewReturnModal.tsx:153` | Aucun |
| FLOW-RM-075 | 5 motifs de retour | `src/data/mockReturns.ts:6-12` | Aucun |
| FLOW-RM-076 | Chaque article retourné doit avoir un motif | `src/components/historique/NewReturnModal.tsx:205` | Aucun |
| FLOW-RM-077 | Retour créé avec statut « pending » | `src/services/returnsService.ts:22` | `returnsService.test.ts` : 1 test |
| FLOW-RM-078 | 4 statuts de retour : pending, in_transit, avoir_emis, refused | `src/data/mockReturns.ts:3` | Aucun |
| FLOW-RM-079 | returnRatio = nb retours / nb commandes (0 si pas de commandes) | `src/services/returnsService.ts:51` | `returnsService.test.ts` : 1 test (cas 0 uniquement) |
| FLOW-RM-080 | activeCount = retours pending + in_transit | `src/services/returnsService.ts:45` | `returnsService.test.ts` : 1 test (>= 1) |
| FLOW-RM-081 | avoirYTD = somme avoir_amount année en cours | `src/services/returnsService.ts:47-49` | `returnsService.test.ts` : 1 test (cas 0) |
| FLOW-RM-082 | sectorAverage hardcodé à 0.22 | `src/services/returnsService.ts:53` | `returnsService.test.ts` : 1 test |
| FLOW-RM-083 | Retours filtrés par codeClient | `src/services/returnsService.ts:12-14` | Implicite |

### Hors périmètre

Commandes (LOT-09), historique des commandes côté UI.

### Points à clarifier

Aucun.

---

## LOT-11 — EDI (échanges Dilicom)

### Objectif

Couvrir la génération automatique de réponses EDI (ORDRSP, DESADV), l'isolation par codeClient, le groupement DESADV par commande, les fonctions utilitaires (filtrage, comptage flux, matching ISBN), et la génération de placeholders EDIFACT.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-084 | Commande EDI génère auto ORDRSP après 3s et DESADV après 8s | `src/contexts/EDIContext.tsx:~80-100` | Aucun |
| FLOW-RM-085 | Données EDI isolées par codeClient | `src/contexts/EDIContext.tsx:~40` | Aucun |
| FLOW-RM-086 | groupDESADVByOrder : EN_COURS si qté livrée < commandée, SOLDE sinon | `src/lib/ediUtils.ts` | Aucun |
| FLOW-RM-087 | filterEDIMessages filtre par type ou ALL | `src/lib/ediUtils.ts` | `ediUtils.test.ts` |
| FLOW-RM-088 | getFluxCounts : comptage par catégorie | `src/lib/ediUtils.ts` | `ediUtils.test.ts` |
| FLOW-RM-089 | messageContainsISBN : recherche partielle, INVOIC inclus dans la recherche | `src/lib/ediUtils.ts` | `ediUtils.test.ts` |
| FLOW-RM-090 | EDIFACT ORDERS : split titres longs en chunks de 35 chars | `src/lib/ediUtils.ts` | `ediUtils.test.ts` |
| FLOW-RM-091 | EDIFACT ORDERS : IMD auteur avec inversion nom/prénom | `src/lib/ediUtils.ts` | `ediUtils.test.ts` |

### Hors périmètre

Mode de transmission EDI dans le tunnel de commande (LOT-07), ediStatus sur les commandes (LOT-09).

### Points à clarifier

Aucun.

---

## LOT-12 — Admin — ⛔ CADUC

> **Caduc depuis le 2026-10-10.** Le back-office (`src/admin/`) est dérouté : les routes ne sont plus enregistrées, les identifiants ont été retirés de la source, et `login` renvoie `false`. Les 7 règles de ce lot (FLOW-RM-092 à 098) ne sont plus testables ni pertinentes. Les 2 tests existants (`adminServices.test.ts`) restent dans la suite pour éviter une régression si le code admin est un jour réactivé, mais aucun nouveau test n'est prévu.

### Règles (hors périmètre)

| ID | Règle | Statut |
| -- | ----- | ------ |
| FLOW-RM-092 | Credentials admin | Corrigé puis dérouté |
| FLOW-RM-093 | Session admin 8h | Dérouté |
| FLOW-RM-094 | Session admin role='admin' | Dérouté |
| FLOW-RM-095 | AdminRoute redirige | Dérouté |
| FLOW-RM-096 | computeCAMois | Dérouté |
| FLOW-RM-097 | computeTop5 | Dérouté |
| FLOW-RM-098 | StatutCommande admin inclut « annule » | Dérouté |

---

## LOT-13 — Wishlist et RDV

### Objectif

Couvrir les wishlists (listes multiples, pas de doublons, validation Zod, nommage) et le panier RDV commercial (isolation par codeClient, incrémentation, suppression). Ces 2 domaines partagent la même structure logique (liste d'items par codeClient avec ajout/incrémentation/suppression).

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-099 | Listes multiples nommées par codeClient | `src/contexts/WishlistContext.tsx` | Aucun |
| FLOW-RM-100 | Pas de doublons de livres dans une même liste | `src/contexts/WishlistContext.tsx` | Aucun |
| FLOW-RM-101 | Validation Zod au chargement (storedWishlistsSchema) | `src/contexts/WishlistContext.tsx` | `storageSchemas.test.ts` (schéma) |
| FLOW-RM-102 | Nom de liste : 1-50 chars, non vide après trim | `src/lib/formSchemas.ts:14-18` | `formSchemas.test.ts` : 5 tests |
### Hors périmètre

- FLOW-RM-120, 121, 122 (RDV) : le module RDV a été supprimé du code, ces règles n'ont plus d'emplacement à tester.
- storedWishlistsSchema unitaire (LOT-18), wishlistNameSchema unitaire (LOT-18).

### Points à clarifier

Aucun.

---

## LOT-14 — Notifications

### Objectif

Couvrir les 3 types de notifications, les conditions de déclenchement (panier non vide, nouveautés < 60 jours), et la non-persistance de l'état « lu ».

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-103 | 3 types : panier, nouveautes, topventes | `src/contexts/NotificationsContext.tsx` | Aucun |
| FLOW-RM-104 | Notification panier si panier non vide | `src/contexts/NotificationsContext.tsx` | Aucun |
| FLOW-RM-105 | Notification nouveautés basée sur livres publiés dans les 60 derniers jours | `src/contexts/NotificationsContext.tsx` | Aucun |
| FLOW-RM-106 | État « lu » non persisté (mémoire uniquement) | `src/contexts/NotificationsContext.tsx` | Aucun |

### Hors périmètre

NotificationBell (composant UI).

### Points à clarifier

Aucun.

---

## LOT-15 — Dashboard et KPIs

### Objectif

Couvrir la configuration du dashboard (zones, toggle, reorder), le filtrage par période et modes de comparaison, et les calculs KPI (exclusion commandes annulées, répartition donut).

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-107 | 4 zones configurables (actionCards, kpiCards, mainPanels, bottomPanels) | `src/hooks/useDashboardConfig.ts` | `useDashboardConfig.test.ts` |
| FLOW-RM-108 | toggleItem empêche de masquer le dernier item visible | `src/hooks/useDashboardConfig.ts` | `useDashboardConfig.test.ts` : 1 test |
| FLOW-RM-109 | Filtrage par période : presets + modes comparaison | `src/hooks/usePeriodFilter.ts` | Aucun |
| FLOW-RM-110 | computeKPIs exclut les commandes annulées | `src/data/mockDashboard.ts` | Aucun |
| FLOW-RM-111 | computeDonutData : méthode des plus grands restes | `src/data/mockDashboard.ts` | Aucun |

### Hors périmètre

Export CSV du dashboard (LOT-18), facturation (LOT-17).

### Points à clarifier

Aucun.

---

## LOT-16 — Stock : affichage et confirmation

### Objectif

Couvrir l'affichage des statuts de stock (tooltips sur_commande/en_reimp), la modale de confirmation avant ajout au panier, et le marquage reliquat pour les titres en réimpression.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-112 | Tooltip sur_commande : « 7-15 jours ouvrés » | `src/components/ui/StockStatus.tsx` | `StockStatus.test.tsx` : 1 test |
| FLOW-RM-113 | Tooltip en_reimp : délai si fourni, sinon « Délai non communiqué » | `src/components/ui/StockStatus.tsx` | `StockStatus.test.tsx` : 2 tests |
| FLOW-RM-114 | Modale confirmation pour sur_commande et en_reimp avant ajout | `src/components/ui/StockAlertModal.tsx` | Aucun |
| FLOW-RM-115 | en_reimp : ajouté comme reliquat au panier | `src/components/ui/StockAlertModal.tsx` | Aucun |

### Hors périmètre

Commandabilité globale (LOT-04), flag enReliquat dans CartItem (LOT-08).

### Points à clarifier

Aucun.

---

## LOT-17 — Facturation et offices

### Objectif

Couvrir le calcul de remise sur les factures, la TVA 5,5% facturation, et les mécaniques d'office (quantités proposées, date limite).

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-116 | Calcul remise facture : ppHT * (1 - remisePct/100) | `src/data/mockFactures.ts` | Aucun |
| FLOW-RM-117 | TVA 5,5% sur les factures | `src/data/mockFactures.ts` | Aucun |
| FLOW-RM-118 | Quantités proposées par office | `src/data/mockOffices.ts` | Aucun |
| FLOW-RM-119 | Date limite de validation par office | `src/data/mockOffices.ts` | Aucun |

### Hors périmètre

Validation des offices dans DemoStateContext (comportement technique lié à la démo).

### Points à clarifier

Aucun.

---

## LOT-18 — Utilitaires et schémas transverses

### Objectif

Couvrir les utilitaires partagés (export CSV, schémas de validation Zod pour storage et formulaires) et les composants UI transverses (feedback widget). Ce lot regroupe des fonctions déjà bien testées : l'objectif principal est de vérifier la complétude et de combler les éventuels trous.

### Règles couvertes

| ID | Règle | Emplacement | Tests existants |
| -- | ----- | ----------- | --------------- |
| FLOW-RM-123 | Export CSV : BOM UTF-8 | `src/lib/csv.ts` | `csv.test.ts` : 1 test |
| FLOW-RM-124 | Export CSV : séparateur point-virgule | `src/lib/csv.ts` | `csv.test.ts` : 1 test |
| FLOW-RM-125 | Export CSV : échappement guillemets doubles | `src/lib/csv.ts` | `csv.test.ts` : 1 test |
| FLOW-RM-126 | buildDashboardCSV : mapping statuts | `src/lib/exportCSV.ts` | `exportCSV.test.ts` : 1 test |
| FLOW-RM-127 | storedCartSchema : quantité >= 1, entière, book.id requis | `src/lib/storageSchemas.ts` | `storageSchemas.test.ts` : 7 tests |
| FLOW-RM-128 | storedOrdersSchema : statuts limités, deliveryMode limité | `src/lib/storageSchemas.ts` | `storageSchemas.test.ts` : 6 tests |
| FLOW-RM-129 | storedWishlistsSchema : id, name, createdAt requis | `src/lib/storageSchemas.ts` | `storageSchemas.test.ts` : 6 tests |
| FLOW-RM-130 | contactSchema : sujet 2-200, message 10-2000, trimmed | `src/lib/formSchemas.ts:4-7` | `formSchemas.test.ts` : 6 tests |
| FLOW-RM-131 | newsletterSchema : email valide, >= 1 newsletter | `src/lib/formSchemas.ts:9-12` | `formSchemas.test.ts` : 4 tests |
| FLOW-RM-132 | cartQtySchema : entier entre 1 et 30 | `src/lib/formSchemas.ts:20-24` | `formSchemas.test.ts` : 6 tests |
| FLOW-RM-133 | Feedback widget : limite 500 caractères | `src/components/ui/FeedbackWidget.tsx` | `FeedbackWidget.test.ts` : 1 test |
| FLOW-RM-134 | Feedback widget : détection automatique du nom de page | `src/components/ui/FeedbackWidget.tsx` | `FeedbackWidget.test.ts` |

### Hors périmètre

Logique de purge des contexts qui utilisent ces schémas (chaque lot couvre son propre context).

### Points à clarifier

Aucun.

---

## Matrice de traçabilité

| Règle | Lot |
| ----- | --- |
| FLOW-RM-001 | LOT-01 |
| FLOW-RM-002 | LOT-01 |
| FLOW-RM-003 | LOT-01 |
| FLOW-RM-004 | LOT-01 |
| FLOW-RM-005 | LOT-01 |
| FLOW-RM-006 | LOT-01 |
| FLOW-RM-007 | LOT-01 |
| FLOW-RM-008 | LOT-01 |
| FLOW-RM-009 | LOT-02 |
| FLOW-RM-010 | LOT-02 |
| FLOW-RM-011 | LOT-02 |
| FLOW-RM-012 | LOT-02 |
| FLOW-RM-013 | LOT-02 |
| FLOW-RM-014 | LOT-02 |
| FLOW-RM-015 | LOT-02 |
| FLOW-RM-016 | LOT-03 |
| FLOW-RM-017 | LOT-03 |
| FLOW-RM-018 | LOT-03 |
| FLOW-RM-019 | LOT-02 |
| FLOW-RM-020 | LOT-03 |
| FLOW-RM-021 | LOT-04 |
| FLOW-RM-022 | LOT-04 |
| FLOW-RM-023 | LOT-04 |
| FLOW-RM-024 | LOT-04 |
| FLOW-RM-025 | LOT-04 |
| FLOW-RM-026 | LOT-04 |
| FLOW-RM-027 | LOT-04 |
| FLOW-RM-028 | LOT-04 |
| FLOW-RM-029 | LOT-04 |
| FLOW-RM-030 | LOT-04 |
| FLOW-RM-031 | LOT-05 |
| FLOW-RM-032 | LOT-05 |
| FLOW-RM-033 | LOT-05 |
| FLOW-RM-034 | LOT-05 |
| FLOW-RM-035 | LOT-05 |
| FLOW-RM-036 | LOT-05 |
| FLOW-RM-037 | LOT-05 |
| FLOW-RM-038 | LOT-06 |
| FLOW-RM-039 | LOT-06 |
| FLOW-RM-040 | LOT-06 |
| FLOW-RM-041 | LOT-06 |
| FLOW-RM-042 | LOT-06 |
| FLOW-RM-043 | LOT-06 |
| FLOW-RM-044 | LOT-06 |
| FLOW-RM-045 | LOT-06 |
| FLOW-RM-046 | LOT-06 |
| FLOW-RM-047 | LOT-06 |
| FLOW-RM-048 | LOT-06 |
| FLOW-RM-049 | LOT-06 |
| FLOW-RM-050 | LOT-07 |
| FLOW-RM-051 | LOT-07 |
| FLOW-RM-052 | LOT-07 |
| FLOW-RM-053 | LOT-07 |
| FLOW-RM-054 | LOT-07 |
| FLOW-RM-055 | LOT-07 |
| FLOW-RM-056 | LOT-07 |
| FLOW-RM-057 | LOT-07 |
| FLOW-RM-058 | LOT-07 |
| FLOW-RM-059 | LOT-07 |
| FLOW-RM-060 | LOT-08 |
| FLOW-RM-061 | LOT-08 |
| FLOW-RM-062 | LOT-08 |
| FLOW-RM-063 | LOT-08 |
| FLOW-RM-064 | LOT-08 |
| FLOW-RM-065 | LOT-09 |
| FLOW-RM-066 | LOT-09 |
| FLOW-RM-067 | LOT-09 |
| FLOW-RM-068 | LOT-09 |
| FLOW-RM-069 | LOT-09 |
| FLOW-RM-070 | LOT-09 |
| FLOW-RM-071 | LOT-09 |
| FLOW-RM-072 | LOT-09 |
| FLOW-RM-073 | LOT-09 |
| FLOW-RM-074 | LOT-10 |
| FLOW-RM-075 | LOT-10 |
| FLOW-RM-076 | LOT-10 |
| FLOW-RM-077 | LOT-10 |
| FLOW-RM-078 | LOT-10 |
| FLOW-RM-079 | LOT-10 |
| FLOW-RM-080 | LOT-10 |
| FLOW-RM-081 | LOT-10 |
| FLOW-RM-082 | LOT-10 |
| FLOW-RM-083 | LOT-10 |
| FLOW-RM-084 | LOT-11 |
| FLOW-RM-085 | LOT-11 |
| FLOW-RM-086 | LOT-11 |
| FLOW-RM-087 | LOT-11 |
| FLOW-RM-088 | LOT-11 |
| FLOW-RM-089 | LOT-11 |
| FLOW-RM-090 | LOT-11 |
| FLOW-RM-091 | LOT-11 |
| FLOW-RM-092 | LOT-12 |
| FLOW-RM-093 | LOT-12 |
| FLOW-RM-094 | LOT-12 |
| FLOW-RM-095 | LOT-12 |
| FLOW-RM-096 | LOT-12 |
| FLOW-RM-097 | LOT-12 |
| FLOW-RM-098 | LOT-12 |
| FLOW-RM-099 | LOT-13 |
| FLOW-RM-100 | LOT-13 |
| FLOW-RM-101 | LOT-13 |
| FLOW-RM-102 | LOT-13 |
| FLOW-RM-103 | LOT-14 |
| FLOW-RM-104 | LOT-14 |
| FLOW-RM-105 | LOT-14 |
| FLOW-RM-106 | LOT-14 |
| FLOW-RM-107 | LOT-15 |
| FLOW-RM-108 | LOT-15 |
| FLOW-RM-109 | LOT-15 |
| FLOW-RM-110 | LOT-15 |
| FLOW-RM-111 | LOT-15 |
| FLOW-RM-112 | LOT-16 |
| FLOW-RM-113 | LOT-16 |
| FLOW-RM-114 | LOT-16 |
| FLOW-RM-115 | LOT-16 |
| FLOW-RM-116 | LOT-17 |
| FLOW-RM-117 | LOT-17 |
| FLOW-RM-118 | LOT-17 |
| FLOW-RM-119 | LOT-17 |
| FLOW-RM-120 | ~~LOT-13~~ hors périmètre (RDV supprimé) |
| FLOW-RM-121 | ~~LOT-13~~ hors périmètre (RDV supprimé) |
| FLOW-RM-122 | ~~LOT-13~~ hors périmètre (RDV supprimé) |
| FLOW-RM-123 | LOT-18 |
| FLOW-RM-124 | LOT-18 |
| FLOW-RM-125 | LOT-18 |
| FLOW-RM-126 | LOT-18 |
| FLOW-RM-127 | LOT-18 |
| FLOW-RM-128 | LOT-18 |
| FLOW-RM-129 | LOT-18 |
| FLOW-RM-130 | LOT-18 |
| FLOW-RM-131 | LOT-18 |
| FLOW-RM-132 | LOT-18 |
| FLOW-RM-133 | LOT-18 |
| FLOW-RM-134 | LOT-18 |

**Vérification** : 134 règles, 134 entrées dans la matrice, 0 orpheline.
