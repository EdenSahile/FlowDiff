# Audit des règles métier FlowDiff

## 1. Périmètre analysé

- **Contexts** (12) : AuthContext, CartContext, EDIContext, NotificationsContext, OnboardingContext, OrdersContext, RdvContext, ReturnsContext, ThemeContext, ToastContext, WishlistContext, DemoStateContext
- **Services** (4) : books.ts, ordersService.ts, returnsService.ts, adminServices.ts
- **Lib / utilitaires** (12) : authUtils.ts, bookUtils.ts, csv.ts, ediUtils.ts, exportCSV.ts, format.ts, formSchemas.ts, invoicePdf.ts, mockUsers.ts, slugify.ts, storageSchemas.ts, responsive.ts
- **Pages** (22) : toutes les pages de l'application (auth, catalogue, panier, historique, EDI, etc.)
- **Composants métier** : BookCard, BookCardRow, StockStatus, StockAlertModal, UniverseFilter, NewReturnModal, NotificationBell, etc.
- **Admin** (8) : AdminAuthContext, AdminRoute, adminServices, pages admin
- **Données mock** (8) : mockBooks, mockOrders, mockReturns, mockDashboard, mockFactures, mockOffices, mockSelections, mockEDIMessages
- **Tests existants** (23 fichiers, 211 tests)

---

## 2. Domaines fonctionnels

### Authentification

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-001 | Login accepte code client OU email comme identifiant (insensible à la casse) | Recherche dans MOCK_USERS par codeClient ou email.toLowerCase() | `src/contexts/AuthContext.tsx:64-68` | `AuthContext.test.tsx` : 2 tests (code client + email) | Complète | Non |
| FLOW-RM-002 | Login valide le mot de passe via bcrypt.compare | Appel bcrypt.compare sur le hash stocké | `src/contexts/AuthContext.tsx:117-121` | `AuthContext.test.tsx` : 1 test (mot de passe incorrect) | Complète | Non |
| FLOW-RM-003 | Login échoue si identifiant introuvable | Retour `{ success: false, error }` | `src/contexts/AuthContext.tsx:112-114` | `AuthContext.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-004 | Login valide les entrées avec Zod (loginSchema) avant traitement | safeParse avant toute logique métier | `src/contexts/AuthContext.tsx:107-109` | `AuthContext.test.tsx` : 1 test (payload vide) | Complète | Non |
| FLOW-RM-005 | Token JWT mock expire après 8h | `exp: now + 8 * 3600 * 1000` dans createMockToken | `src/lib/authUtils.ts:73` | `AuthContext.test.tsx` : 1 test (token expiré nettoyé) | Complète | Non |
| FLOW-RM-006 | Restauration de session au montage si token valide en localStorage | useEffect au montage, décode et vérifie le token | `src/contexts/AuthContext.tsx:89-103` | `AuthContext.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-007 | Token malformé nettoyé au montage | try/catch sur le décodage, removeItem si échec | `src/contexts/AuthContext.tsx:99-101` | `AuthContext.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-008 | Token valide mais utilisateur introuvable : token nettoyé | Vérification findUser après décodage | `src/contexts/AuthContext.tsx:96-98` | Aucun | Absente | Non |
| FLOW-RM-009 | Inscription : code client doit exister dans VALID_CLIENT_CODES | Vérification dans le set des codes valides | `src/contexts/AuthContext.tsx:138-143` | `AuthContext.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-010 | Inscription : email doit correspondre au code client (insensible à la casse) | Comparaison email fourni vs email attendu | `src/contexts/AuthContext.tsx:144-149` | `AuthContext.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-011 | Inscription : un seul compte par code client par session (Set registeredClients) | Vérification dans un Set en mémoire | `src/contexts/AuthContext.tsx:152-155` | `AuthContext.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-012 | Inscription : mot de passe hashé avec bcrypt cost 12 | `bcrypt.hash(password, BCRYPT_COST)` avec BCRYPT_COST=12 | `src/contexts/AuthContext.tsx:14,162` | Test vérifie le succès mais pas le cost factor | Partielle | Non |
| FLOW-RM-013 | Inscription réussie connecte automatiquement l'utilisateur | setUser + createMockToken après register | `src/contexts/AuthContext.tsx:166-167` | `AuthContext.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-014 | Mot de passe : min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial | 4 regex dans passwordSchema | `src/lib/authUtils.ts:29-33` | Testé indirectement via AuthContext (password faible rejeté) | Partielle (pas de tests unitaires du schema) | Non |
| FLOW-RM-015 | Code client : min 3, max 20, trimmed, uppercased | Contraintes Zod dans loginSchema | `src/lib/authUtils.ts:17-22` | Aucun test unitaire | Absente | Non |
| FLOW-RM-016 | Logout supprime token et wishlist username, conserve panier et historique | removeItem ciblé sur token + wishlist | `src/contexts/AuthContext.tsx:176-182` | `AuthContext.test.tsx` : 2 tests | Complète | Non |
| FLOW-RM-017 | ProtectedRoute redirige vers /login si non connecté, en sauvegardant le pathname d'origine | Navigate to="/login" avec state.from | `src/components/auth/ProtectedRoute.tsx:12-14` | Aucun | Absente | Non |
| FLOW-RM-018 | Redirection post-login sécurisée (anti open-redirect) | Rejette protocol-relative, backslash, schémas | `src/lib/authUtils.ts:102-115` | `authUtils.test.ts` : 10 tests | Complète | Non |
| FLOW-RM-019 | Confirmation mot de passe doit correspondre (registerSchema) | Zod refine dans registerSchema | `src/lib/authUtils.ts:38-41` | Testé indirectement via AuthContext | Partielle | Non |
| FLOW-RM-020 | Données isolées par codeClient (clés localStorage suffixées) | Clés `bookflow_cart_<codeClient>`, `bookflow_orders_<codeClient>`, etc. | Multiples contexts | Aucun test dédié | Absente | Non |

### Catalogue

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-021 | Un titre « à paraître » n'est pas commandable (isOrderable) | `return type !== 'a-paraitre'` | `src/lib/bookUtils.ts:3-5` | `bookUtils.test.ts` : 3 tests | Complète | Oui : voir FLOW-RM-028 |
| FLOW-RM-022 | 3 types de titres : nouveaute, a-paraitre, fonds | Union type BookType | `src/data/mockBooks.ts:2` | Couvert implicitement par isOrderable | Partielle | Non |
| FLOW-RM-023 | 4 univers : Littérature, BD/Mangas, Jeunesse, Adulte-pratique | Union type Universe | `src/data/mockBooks.ts:1` | Aucun test dédié | Absente | Non |
| FLOW-RM-024 | 6 statuts de stock : disponible, stock_limite, sur_commande, en_reimp, epuise, rupture | Union type StockStatut | `src/data/mockBooks.ts:4-10` | `fondsFilter.test.ts` teste le filtrage (indirect) | Partielle | Non |
| FLOW-RM-025 | Statuts sur_commande et en_reimp interdits pour les nouveautés (forçage à disponible) | NOUVEAUTE_FORBIDDEN + resolveStatut() | `src/data/mockBooks.ts:742-751` | Aucun | Absente | Non |
| FLOW-RM-026 | Les titres à paraître n'ont pas de statut de stock | Exclus du mapping resolveStatut | `src/data/mockBooks.ts:753-757` | Aucun | Absente | Non |
| FLOW-RM-027 | Un titre épuisé ou en rupture est affiché « Indisponible » (bouton désactivé) | `isEpuise = statut === 'epuise' \|\| statut === 'rupture'` | `src/components/catalogue/BookCard.tsx:596-598` | Aucun | Absente | Non |
| FLOW-RM-028 | BookCard permet l'ajout au panier d'un titre à paraître (après confirmation popin) | L'ajout au panier n'est pas bloqué pour a-paraitre dans BookCard | `src/components/catalogue/BookCard.tsx:622` | Aucun | Absente | Oui : contredit FLOW-RM-021 et CLAUDE.md |
| FLOW-RM-029 | BookCardRow bloque l'ajout pour a-paraitre ET épuisé | `!isAParaitre && !isEpuise` | `src/components/catalogue/BookCardRow.tsx:803` | Aucun | Absente | Oui : diverge de BookCard (FLOW-RM-028) |
| FLOW-RM-030 | Un titre sur_commande ou en_reimp déclenche une modale de confirmation avant ajout | Logique conditionnelle dans BookCard | `src/components/catalogue/BookCard.tsx:597,623` | Aucun | Absente | Non |
| FLOW-RM-031 | Recherche locale multi-champs : titre, auteurs, éditeur, ISBN (nettoyé), collection, genre | searchBooksLocal avec normalisation | `src/services/books.ts:76-87` | `books.test.ts` : 4 tests (titre, auteur, vide, aucun résultat) | Partielle (ISBN, collection, genre non testés) | Non |
| FLOW-RM-032 | Recherche ISBN directe : correspondance exacte, trim des espaces | Logique de matching ISBN | `src/components/layout/__tests__/isbnSearch.test.ts` | `isbnSearch.test.ts` : 3 tests | Complète | Non |
| FLOW-RM-033 | ~~Fallback Supabase vers données mock~~ **Hors périmètre** : Supabase supprimé, l'app charge uniquement les mocks | n/a | `src/services/books.ts` | n/a | n/a | Non |
| FLOW-RM-034 | Filtrage livres par prix TTC : borne inf incluse, borne sup exclue | `>= min` et `< max` | `src/data/mockBooks.ts:89-92` | Aucun | Absente | Non |
| FLOW-RM-035 | Filtrage cumulatif univers + statut sur la page Fonds | Logique de filtrage enchaînée | `src/pages/fonds/FondsPage.tsx` | `fondsFilter.test.ts` : 5 tests | Complète | Non |
| FLOW-RM-036 | Calcul du prix net remisé : priceTTC * (1 - rate) | Formule dans BookCard | `src/components/catalogue/BookCard.tsx:582-585` | `priceNet.test.ts` : 3 tests (formule seule) | Complète (formule), pas l'intégration taux utilisateur | Non |
| FLOW-RM-037 | Genres rattachés à chaque univers (GENRE_BY_UNIVERSE) | Objet statique de mapping | `src/data/mockBooks.ts:39-76` | Aucun | Absente | Non |

### Panier et commande

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-038 | Limite du panier à 30 articles (CART_LIMIT) | Constante + vérification dans addToCart | `src/contexts/CartContext.tsx:8,216-221` | `formSchemas.test.ts` : cartQtySchema testé | Partielle (schéma oui, addToCart non) | Non |
| FLOW-RM-039 | Ajout au panier : même livre = incrémentation quantité (merge par book.id + ebookOption) | Logique de merge dans addToCart | `src/contexts/CartContext.tsx:224-232` | Aucun | Absente | Non |
| FLOW-RM-040 | Si limite atteinte, toast d'erreur et panier inchangé | showToast('error') + return | `src/contexts/CartContext.tsx:216-221` | Aucun | Absente | Non |
| FLOW-RM-041 | Remises par défaut par univers : BD/Mangas 30%, Jeunesse 30%, Littérature 35%, Adulte-pratique 35% | REMISE_RATES constant | `src/contexts/CartContext.tsx:11-16` | Tests computeTotals utilisent des taux différents | Partielle | Oui : les tests ne vérifient pas les taux réels par défaut |
| FLOW-RM-042 | Taux effectifs : remisesParUnivers du libraire prioritaire sur REMISE_RATES | Logique de fallback dans getRate | `src/contexts/CartContext.tsx:184-189` | Aucun | Absente | Non |
| FLOW-RM-043 | Remise appliquée sur les ouvrages (y compris OP) mais PAS sur la PLV | Condition isPLV dans computeTotals | `src/contexts/CartContext.tsx:129-136` | `computeTotals.test.ts` : 1 test dédié | Complète | Non |
| FLOW-RM-044 | TVA fixe à 5,5% (taux livre) extraite du net TTC | Constantes 0.055 et 1.055 | `src/contexts/CartContext.tsx:142-144` | `computeTotals.test.ts` : vérifié | Complète | Non |
| FLOW-RM-045 | Formule : netHT = (subtotalTTC - remiseTTC) / 1.055, tva = netHT * 0.055, totalTTC = netHT + tva | Calcul séquentiel dans computeTotals | `src/contexts/CartContext.tsx:141-145` | `computeTotals.test.ts` : vérifications arithmétiques | Complète | Non |
| FLOW-RM-046 | Panier vide : computeTotals retourne tout à 0 | Guard clause en entrée | `src/contexts/CartContext.tsx:120-145` | `computeTotals.test.ts` : 1 test | Complète | Non |
| FLOW-RM-047 | updateQty : si qty < 1, supprime l'article | filter dans updateQty | `src/contexts/CartContext.tsx:204-206` | Aucun | Absente | Non |
| FLOW-RM-048 | Panier persisté en localStorage par codeClient | Clé `bookflow_cart_<codeClient>` | `src/contexts/CartContext.tsx:91-93,178-182` | Aucun | Absente | Non |
| FLOW-RM-049 | Validation du panier stocké via storedCartSchema (Zod) : données invalides = panier vidé | safeParse dans loadCart | `src/contexts/CartContext.tsx:113-118` | `storageSchemas.test.ts` : schéma testé | Partielle (schéma oui, logique purge non) | Non |
| FLOW-RM-050 | Tunnel de commande en 3 étapes : récapitulatif, adresses, mode de transmission | checkoutSteps définit les étapes | `src/pages/cart/checkoutSteps.ts` | `checkoutSteps.test.ts` : 8 tests | Complète | Non |
| FLOW-RM-051 | Adresse de livraison : rue requis, code postal 5 chiffres, ville requis | addressSchema Zod | `src/pages/cart/checkoutSchemas.ts:9-13` | `checkoutSchemas.test.ts` : 7 tests | Complète | Non |
| FLOW-RM-052 | Mode de transmission : FLOWDIFF ou EDI (Dilicom) | transmissionModeSchema enum | `src/pages/cart/checkoutSchemas.ts:3-7` | Aucun | Absente | Non |
| FLOW-RM-053 | Mode de transmission par défaut : FLOWDIFF | Valeur initiale dans CartContext | `src/contexts/CartContext.tsx:104` | Aucun | Absente | Non |
| FLOW-RM-054 | Préférence mode de transmission persistée en localStorage par codeClient | Clé `bookflow_transmission_<codeClient>` | `src/contexts/CartContext.tsx:272-277` | Aucun | Absente | Non |
| FLOW-RM-055 | Confirmation de commande : crée une order, vide le panier, affiche écran de succès | Enchaînement addOrder + clearCart | `src/pages/cart/CartPage.tsx:1185-1208` | Aucun | Absente | Non |
| FLOW-RM-056 | Si commande contient des articles en reliquat, toast « notifié par email dès expédition » | Condition enReliquat dans le flux de confirmation | `src/pages/cart/CartPage.tsx:1206-1208` | Aucun | Absente | Non |
| FLOW-RM-057 | Message de succès différent selon mode FLOWDIFF vs EDI | Affichage conditionnel | `src/pages/cart/CartPage.tsx:1217-1245` | Aucun | Absente | Non |
| FLOW-RM-058 | Référence commande : globale (max 35 car) + par ligne (max 35 car) | maxLength sur les champs | `src/pages/cart/CartPage.tsx:1501-1509` | Aucun | Absente | Non |
| FLOW-RM-059 | Livraison : standard (1-3 jours) ou date spécifique (>= aujourd'hui) | Logique de sélection | `src/pages/cart/CartPage.tsx:1736-1757` | Aucun | Absente | Non |
| FLOW-RM-060 | Snapshot statut stock au moment de l'ajout au panier | stockSnapshot sur l'item | `src/contexts/CartContext.tsx:31` | Aucun | Absente | Non |
| FLOW-RM-061 | Article en reliquat (en_reimp, expédition différée) : flag booléen enReliquat sur l'item | Champ dans CartItem | `src/contexts/CartContext.tsx:33` | Aucun | Absente | Non |
| FLOW-RM-062 | Option « Adresse de facturation identique à la livraison » (par défaut : oui) | Checkbox dans CartPage | `src/pages/cart/CartPage.tsx:1122,1348-1358` | Aucun | Absente | Non |
| FLOW-RM-063 | Ebooks supportés avec ISBN spécifique et hébergeur | Champs ebookISBN, ebookHost dans CartItem | `src/contexts/CartContext.tsx:19-24` | Aucun | Absente | Non |
| FLOW-RM-064 | Opérations promotionnelles : cadeau offert + PLV payante | Structure OPCartGroup | `src/contexts/CartContext.tsx:36-56` | `computeTotals.test.ts` : test PLV/remise OP | Partielle (calcul couvert, ajout/suppression non) | Non |

### Commandes et historique

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-065 | Numéro de commande séquentiel : format CMD0000001+, compteur persisté en localStorage | generateNumero avec compteur incrémental | `src/contexts/OrdersContext.tsx:33-38` | Aucun | Absente | Non |
| FLOW-RM-066 | Compteur initial à 14 (CMD0000001 à CMD0000014 réservés aux mocks) | INITIAL_COUNTER = 14 | `src/contexts/OrdersContext.tsx:16` | Aucun | Absente | Non |
| FLOW-RM-067 | Commande créée avec statut « en préparation » | Valeur par défaut à la création | `src/contexts/OrdersContext.tsx:146` | Aucun | Absente | Non |
| FLOW-RM-068 | ediStatus = PENDING si transmissionMode === EDI, undefined sinon | Condition dans addOrder | `src/contexts/OrdersContext.tsx:151` | Aucun | Absente | Non |
| FLOW-RM-069 | Commandes filtrées par codeClient (isolation par librairie) | useClientOrders filtre par codeClient | `src/contexts/OrdersContext.tsx:179-182` | Aucun | Absente | Non |
| FLOW-RM-070 | 3 statuts de commande : en préparation, expédié, livré | Valeurs autorisées dans storedOrdersSchema et mockOrders | `src/data/mockOrders.ts:30-32` | `storageSchemas.test.ts` : schéma testé | Partielle (schéma validé, pas les transitions) | Non |
| FLOW-RM-071 | Types de commande : MONO, AP, SUITE | Union type dans mockOrders | `src/data/mockOrders.ts:40` | Aucun | Absente | Non |
| FLOW-RM-072 | 2 modes de livraison : standard ou specific (date choisie) | deliveryMode dans OrdersContext | `src/contexts/OrdersContext.tsx:57` | Aucun | Absente | Non |
| FLOW-RM-073 | Migration storage : efface les commandes ancienne numérotation quand STORAGE_VERSION change | Condition version dans loadOrders | `src/contexts/OrdersContext.tsx:19-31` | Aucun | Absente | Non |

### Retours

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-074 | Seules les commandes « livré » sont éligibles au retour | ELIGIBLE_STATUSES = new Set(['livré']) | `src/components/historique/NewReturnModal.tsx:153` | Aucun | Absente | Non |
| FLOW-RM-075 | 5 motifs de retour : invendu, defaut_impression, mauvaise_livraison, doublon, autre | Union type ReturnReason | `src/data/mockReturns.ts:6-12` | Aucun | Absente | Non |
| FLOW-RM-076 | Chaque article retourné doit avoir un motif (validation allHaveReasons) | Condition dans NewReturnModal | `src/components/historique/NewReturnModal.tsx:205` | Aucun | Absente | Non |
| FLOW-RM-077 | Retour créé avec statut « pending » | Valeur par défaut dans createReturn | `src/services/returnsService.ts:22` | `returnsService.test.ts` : 1 test | Complète | Non |
| FLOW-RM-078 | 4 statuts de retour : pending, in_transit, avoir_emis, refused | Union type ReturnStatus | `src/data/mockReturns.ts:3` | Aucun | Absente | Non |
| FLOW-RM-079 | returnRatio = nb retours / nb commandes du client (0 si pas de commandes) | Calcul dans getReturnsStats | `src/services/returnsService.ts:51` | `returnsService.test.ts` : 1 test (ratio=0) | Partielle (seul le cas 0 est testé) | Non |
| FLOW-RM-080 | activeCount = retours pending + in_transit | Filtrage dans getReturnsStats | `src/services/returnsService.ts:45` | `returnsService.test.ts` : 1 test (>= 1) | Partielle | Non |
| FLOW-RM-081 | avoirYTD = somme avoir_amount des retours de l'année en cours | Filtrage + somme dans getReturnsStats | `src/services/returnsService.ts:47-49` | `returnsService.test.ts` : 1 test (cas 0) | Partielle (seul le cas 0) | Non |
| FLOW-RM-082 | sectorAverage hardcodé à 0.22 | Constante dans getReturnsStats | `src/services/returnsService.ts:53` | `returnsService.test.ts` : 1 test | Complète | Non |
| FLOW-RM-083 | Retours filtrés par codeClient | Filtre dans getReturns | `src/services/returnsService.ts:12-14` | Couvert implicitement | Partielle | Non |

### EDI (échange de données Dilicom)

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-084 | Commande EDI génère auto ORDRSP après 3s et DESADV après 8s | setTimeout dans EDIContext | `src/contexts/EDIContext.tsx:~80-100` | Aucun | Absente | Non |
| FLOW-RM-085 | Données EDI isolées par codeClient (clé localStorage) | Clé suffixée par codeClient | `src/contexts/EDIContext.tsx:~40` | Aucun | Absente | Non |
| FLOW-RM-086 | groupDESADVByOrder : statut EN_COURS si qté livrée < commandée, SOLDE sinon | Logique de comparaison dans ediUtils | `src/lib/ediUtils.ts` | Aucun | Absente | Non |
| FLOW-RM-087 | filterEDIMessages filtre par type ou ALL | Fonction utilitaire | `src/lib/ediUtils.ts` | `ediUtils.test.ts` : tests existants | Complète | Non |
| FLOW-RM-088 | getFluxCounts : orders=ORDERS+PENDING, expeditions=tous DESADV, factures=INVOIC+PENDING, errors=tout ERROR | Comptage par catégorie | `src/lib/ediUtils.ts` | `ediUtils.test.ts` : tests existants | Complète | Non |
| FLOW-RM-089 | messageContainsISBN : recherche partielle (préfixe), chaîne vide = pas de filtre, INVOIC inclus dans la recherche | Logique de matching ISBN dans messages | `src/lib/ediUtils.ts` | `ediUtils.test.ts` : tests existants | Complète | Non |
| FLOW-RM-090 | EDIFACT ORDERS : split titres longs en chunks de 35 chars dans IMD+L+050 | Découpage dans generateEdifactPlaceholder | `src/lib/ediUtils.ts` | `ediUtils.test.ts` : tests existants | Complète | Non |
| FLOW-RM-091 | EDIFACT ORDERS : IMD auteur avec inversion nom/prénom (009/010/011) | Transformation dans generateEdifactPlaceholder | `src/lib/ediUtils.ts` | `ediUtils.test.ts` : tests existants | Complète | Non |

### Admin

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-092 | ~~Credentials admin hardcodés~~ **corrigé le 2026-10-10** : retirés de la source, y compris le `defaultValue` qui les pré-remplissait dans le formulaire. Back-office déroté, `login` renvoie `false`. Vérifié absents du bundle produit. | n/a | `src/admin/contexts/AdminAuthContext.tsx`, `src/admin/pages/AdminLoginPage.tsx` | `adminAuth.test.ts` supprimé, il testait ses propres réimplémentations | Résolu | Non |
| FLOW-RM-093 | Session admin expire après 8h | exp dans le token admin | `src/admin/contexts/AdminAuthContext.tsx` | `adminAuth.test.ts` : 1 test | Complète | Non |
| FLOW-RM-094 | Session admin requiert role='admin' | Vérification du rôle dans le token | `src/admin/contexts/AdminAuthContext.tsx` | `adminAuth.test.ts` : 1 test | Complète | Non |
| FLOW-RM-095 | AdminRoute redirige vers /admin/login si non authentifié | Guard route | `src/admin/AdminRoute.tsx` | Aucun | Absente | Non |
| FLOW-RM-096 | computeCAMois : exclut les commandes annulées, filtre mois courant, somme TTC | Filtrage + agrégation | `src/admin/services/adminServices.ts` | `adminServices.test.ts` : 1 test | Complète | Non |
| FLOW-RM-097 | computeTop5 : agrège quantités par ISBN tous mois confondus, tri descendant | Agrégation + tri | `src/admin/services/adminServices.ts` | `adminServices.test.ts` : 1 test | Complète | Non |
| FLOW-RM-098 | StatutCommande admin : en_preparation, expedie, livre, annule (inclut « annule ») | Union type dans admin/types.ts | `src/admin/types.ts` | Implicite via tests services | Partielle | Oui : le statut « annule » n'existe pas côté libraire |

### Wishlist

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-099 | Listes multiples nommées par codeClient | Structure lists[] dans WishlistContext | `src/contexts/WishlistContext.tsx` | Aucun | Absente | Non |
| FLOW-RM-100 | Pas de doublons de livres dans une même liste | Vérification avant ajout | `src/contexts/WishlistContext.tsx` | Aucun | Absente | Non |
| FLOW-RM-101 | Validation Zod au chargement (storedWishlistsSchema) | safeParse dans loadWishlists | `src/contexts/WishlistContext.tsx` | `storageSchemas.test.ts` : schéma testé | Partielle (schéma oui, logique purge non) | Non |
| FLOW-RM-102 | Nom de liste : 1-50 chars, non vide après trim | wishlistNameSchema | `src/lib/formSchemas.ts:14-18` | `formSchemas.test.ts` : 5 tests | Complète | Non |

### Notifications

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-103 | 3 types de notification : panier, nouveautes, topventes | Union type dans NotificationsContext | `src/contexts/NotificationsContext.tsx` | Aucun | Absente | Non |
| FLOW-RM-104 | Notification panier apparaît si panier non vide | Condition sur items.length | `src/contexts/NotificationsContext.tsx` | Aucun | Absente | Non |
| FLOW-RM-105 | Notification nouveautés basée sur livres type='nouveaute' publiés dans les 60 derniers jours | Filtre par date de parution | `src/contexts/NotificationsContext.tsx` | Aucun | Absente | Non |
| FLOW-RM-106 | État « lu » non persisté (mémoire uniquement) | State React sans localStorage | `src/contexts/NotificationsContext.tsx` | Aucun | Absente | Non |

### Dashboard

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-107 | 4 zones configurables (actionCards, kpiCards, mainPanels, bottomPanels) | Structure dans useDashboardConfig | `src/hooks/useDashboardConfig.ts` | `useDashboardConfig.test.ts` : tests existants | Complète | Non |
| FLOW-RM-108 | toggleItem empêche de masquer le dernier item visible | Guard dans toggleItem | `src/hooks/useDashboardConfig.ts` | `useDashboardConfig.test.ts` : 1 test | Complète | Non |
| FLOW-RM-109 | Filtrage par période : presets (last-7/30/this-month, etc.) + modes comparaison | Logique dans usePeriodFilter | `src/hooks/usePeriodFilter.ts` | Aucun | Absente | Non |
| FLOW-RM-110 | computeKPIs exclut les commandes annulées | Filtrage dans mockDashboard | `src/data/mockDashboard.ts` | Aucun | Absente | Non |
| FLOW-RM-111 | computeDonutData : méthode des plus grands restes pour répartition % | Algorithme mathématique | `src/data/mockDashboard.ts` | Aucun | Absente | Non |

### Stock

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-112 | Tooltip sur_commande : « 7-15 jours ouvrés » | Texte conditionnel dans StockStatus | `src/components/ui/StockStatus.tsx` | `StockStatus.test.tsx` : 1 test | Complète | Non |
| FLOW-RM-113 | Tooltip en_reimp : affiche délai si fourni, sinon « Délai non communiqué » | Logique conditionnelle | `src/components/ui/StockStatus.tsx` | `StockStatus.test.tsx` : 2 tests | Complète | Non |
| FLOW-RM-114 | Modale confirmation pour sur_commande et en_reimp avant ajout panier | StockAlertModal conditionnel | `src/components/ui/StockAlertModal.tsx` | Aucun | Absente | Non |
| FLOW-RM-115 | en_reimp : ajouté comme reliquat au panier | Flag enReliquat=true | `src/components/ui/StockAlertModal.tsx` | Aucun | Absente | Non |

### Facturation

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-116 | Calcul remise facture : ppHT * (1 - remisePct/100) | Formule dans mockFactures | `src/data/mockFactures.ts` | Aucun | Absente | Non |
| FLOW-RM-117 | TVA 5,5% sur les factures | Taux dans mockFactures | `src/data/mockFactures.ts` | Aucun | Absente | Non |

### Offices

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-118 | Quantités proposées par office | Structure dans mockOffices | `src/data/mockOffices.ts` | Aucun | Absente | Non |
| FLOW-RM-119 | Date limite de validation par office | Champ dateLimite | `src/data/mockOffices.ts` | Aucun | Absente | Non |

### RDV (rendez-vous commercial)

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-120 | Items RDV isolés par codeClient | Clé localStorage suffixée | `src/contexts/RdvContext.tsx` | Aucun | Absente | Non |
| FLOW-RM-121 | addToRdv incrémente la quantité si le livre existe déjà | Logique de merge | `src/contexts/RdvContext.tsx` | Aucun | Absente | Non |
| FLOW-RM-122 | updateQty supprime l'item RDV si qty < 1 | Logique de suppression | `src/contexts/RdvContext.tsx` | Aucun | Absente | Non |

### Utilitaires transverses

| ID | Règle métier | Preuve dans le projet | Emplacement | Tests existants | Couverture apparente | Ambiguïté |
| -- | ------------ | --------------------- | ----------- | --------------- | -------------------- | --------- |
| FLOW-RM-123 | Export CSV : BOM UTF-8 en début de fichier (compatibilité Excel) | Préfixe BOM dans csv.ts | `src/lib/csv.ts` | `csv.test.ts` : 1 test | Complète | Non |
| FLOW-RM-124 | Export CSV : séparateur point-virgule (convention française) | Séparateur dans csv.ts | `src/lib/csv.ts` | `csv.test.ts` : 1 test | Complète | Non |
| FLOW-RM-125 | Export CSV : échappement guillemets doubles | Logique d'échappement | `src/lib/csv.ts` | `csv.test.ts` : 1 test | Complète | Non |
| FLOW-RM-126 | buildDashboardCSV : commande active = « Livrée », annulée = « Annulée » | Mapping statut dans exportCSV | `src/lib/exportCSV.ts` | `exportCSV.test.ts` : 1 test | Complète | Non |
| FLOW-RM-127 | storedCartSchema : quantité >= 1, entière, book.id requis | Schéma Zod | `src/lib/storageSchemas.ts` | `storageSchemas.test.ts` : 7 tests | Complète | Non |
| FLOW-RM-128 | storedOrdersSchema : statuts limités (en préparation/expédié/livré), deliveryMode limité | Schéma Zod | `src/lib/storageSchemas.ts` | `storageSchemas.test.ts` : 6 tests | Complète | Non |
| FLOW-RM-129 | storedWishlistsSchema : id, name, createdAt requis | Schéma Zod | `src/lib/storageSchemas.ts` | `storageSchemas.test.ts` : 6 tests | Complète | Non |
| FLOW-RM-130 | contactSchema : sujet 2-200 car, message 10-2000 car, tous trimmed | Schéma Zod | `src/lib/formSchemas.ts:4-7` | `formSchemas.test.ts` : 6 tests | Complète | Non |
| FLOW-RM-131 | newsletterSchema : email valide, au moins 1 newsletter sélectionnée | Schéma Zod | `src/lib/formSchemas.ts:9-12` | `formSchemas.test.ts` : 4 tests | Complète | Non |
| FLOW-RM-132 | cartQtySchema : entier entre 1 et 30 (CART_LIMIT) | Schéma Zod | `src/lib/formSchemas.ts:20-24` | `formSchemas.test.ts` : 6 tests | Complète | Non |
| FLOW-RM-133 | Feedback widget : limite 500 caractères | maxLength dans FeedbackWidget | `src/components/ui/FeedbackWidget.tsx` | `FeedbackWidget.test.ts` : 1 test | Complète | Non |
| FLOW-RM-134 | Feedback widget : détection automatique du nom de page depuis la route | Extraction depuis pathname | `src/components/ui/FeedbackWidget.tsx` | `FeedbackWidget.test.ts` : tests existants | Complète | Non |

---

## 3. Règles sans couverture de test identifiée

| ID | Règle | Domaine | Criticité fonctionnelle |
| -- | ----- | ------- | ----------------------- |
| FLOW-RM-008 | Token valide mais utilisateur introuvable : token nettoyé | Auth | Haute |
| FLOW-RM-015 | Code client : min 3, max 20, trimmed, uppercased | Auth | Moyenne |
| FLOW-RM-017 | ProtectedRoute redirige vers /login | Auth | Haute |
| FLOW-RM-020 | Données isolées par codeClient | Auth | Haute |
| FLOW-RM-025 | Statuts sur_commande/en_reimp interdits pour nouveautés | Catalogue | Moyenne |
| FLOW-RM-026 | Titres à paraître n'ont pas de statut de stock | Catalogue | Moyenne |
| FLOW-RM-027 | Titre épuisé/rupture affiché « Indisponible » | Catalogue | Moyenne |
| FLOW-RM-028 | BookCard permet ajout à paraître au panier | Catalogue | Haute (incohérence) |
| FLOW-RM-029 | BookCardRow bloque ajout à paraître | Catalogue | Haute (incohérence) |
| FLOW-RM-030 | Modale confirmation sur_commande/en_reimp | Catalogue | Moyenne |
| ~~FLOW-RM-033~~ | ~~Fallback Supabase vers données mock~~ | ~~Catalogue~~ | Hors périmètre (Supabase supprimé) |
| FLOW-RM-034 | Filtrage par prix (borne sup exclue) | Catalogue | Basse |
| FLOW-RM-037 | Genres par univers (GENRE_BY_UNIVERSE) | Catalogue | Basse |
| FLOW-RM-039 | Ajout panier : même livre = incrémentation | Panier | Haute |
| FLOW-RM-040 | Limite panier atteinte : toast + rejet | Panier | Haute |
| FLOW-RM-042 | Taux effectifs libraire prioritaires sur défaut | Panier | Haute |
| FLOW-RM-047 | updateQty < 1 supprime l'article | Panier | Moyenne |
| FLOW-RM-048 | Panier persisté par codeClient | Panier | Haute |
| FLOW-RM-052 | Mode transmission FLOWDIFF ou EDI | Panier | Moyenne |
| FLOW-RM-053 | Mode transmission par défaut FLOWDIFF | Panier | Basse |
| FLOW-RM-054 | Préférence transmission persistée | Panier | Basse |
| FLOW-RM-055 | Confirmation commande : crée order + vide panier | Panier | Haute |
| FLOW-RM-058 | Référence commande max 35 car | Panier | Basse |
| FLOW-RM-059 | Livraison standard ou date spécifique | Panier | Moyenne |
| FLOW-RM-060 | Snapshot statut stock à l'ajout | Panier | Basse |
| FLOW-RM-063 | Ebooks avec ISBN spécifique | Panier | Basse |
| FLOW-RM-065 | Numéro commande séquentiel CMD+ | Commandes | Moyenne |
| FLOW-RM-067 | Commande créée « en préparation » | Commandes | Moyenne |
| FLOW-RM-068 | ediStatus = PENDING si mode EDI | Commandes | Moyenne |
| FLOW-RM-069 | Commandes filtrées par codeClient | Commandes | Haute |
| FLOW-RM-071 | Types de commande MONO/AP/SUITE | Commandes | Basse |
| FLOW-RM-074 | Seules commandes « livré » éligibles au retour | Retours | Haute |
| FLOW-RM-075 | 5 motifs de retour | Retours | Moyenne |
| FLOW-RM-076 | Chaque article retourné doit avoir un motif | Retours | Haute |
| FLOW-RM-084 | Commande EDI génère auto ORDRSP/DESADV | EDI | Moyenne |
| FLOW-RM-085 | Données EDI isolées par codeClient | EDI | Haute |
| FLOW-RM-086 | groupDESADVByOrder : EN_COURS vs SOLDE | EDI | Moyenne |
| FLOW-RM-095 | AdminRoute redirige si non authentifié | Admin | Moyenne |
| FLOW-RM-099 | Wishlists multiples nommées par codeClient | Wishlist | Moyenne |
| FLOW-RM-100 | Pas de doublons dans une wishlist | Wishlist | Moyenne |
| FLOW-RM-103 | 3 types de notification | Notifications | Basse |
| FLOW-RM-104 | Notification panier si panier non vide | Notifications | Basse |
| FLOW-RM-105 | Notification nouveautés < 60 jours | Notifications | Basse |
| FLOW-RM-109 | Filtrage dashboard par période | Dashboard | Moyenne |
| FLOW-RM-110 | computeKPIs exclut commandes annulées | Dashboard | Moyenne |
| FLOW-RM-111 | computeDonutData plus grands restes | Dashboard | Basse |
| FLOW-RM-114 | Modale confirmation stock avant ajout | Stock | Moyenne |
| FLOW-RM-115 | en_reimp ajouté comme reliquat | Stock | Moyenne |
| FLOW-RM-116 | Calcul remise facture | Facturation | Moyenne |
| FLOW-RM-117 | TVA 5,5% factures | Facturation | Moyenne |
| FLOW-RM-118 | Quantités proposées par office | Offices | Basse |
| FLOW-RM-119 | Date limite validation office | Offices | Basse |
| FLOW-RM-120 | Items RDV isolés par codeClient | RDV | Moyenne |
| FLOW-RM-121 | addToRdv incrémente si existe | RDV | Moyenne |
| FLOW-RM-122 | updateQty RDV supprime si < 1 | RDV | Moyenne |

---

## 4. Règles partiellement couvertes

| ID | Règle | Ce qui est couvert | Ce qui manque |
| -- | ----- | ------------------ | ------------- |
| FLOW-RM-012 | Inscription bcrypt cost 12 | Le succès de l'inscription est testé | Le cost factor n'est pas vérifié (pas d'assertion sur le hash) |
| FLOW-RM-014 | Mot de passe : 8 chars, majuscule, chiffre, spécial | Rejet d'un mot de passe faible via AuthContext | Tests unitaires du schema passwordSchema (chaque contrainte individuellement) |
| FLOW-RM-019 | Confirmation mot de passe doit correspondre | Testé indirectement via register | Test unitaire du refine registerSchema |
| FLOW-RM-024 | 6 statuts de stock | Filtrage par statut testé dans fondsFilter | Exhaustivité des statuts (validité de chaque valeur) |
| FLOW-RM-031 | Recherche multi-champs | Titre et auteur testés | ISBN (avec nettoyage espaces/tirets), collection, genre non testés |
| FLOW-RM-038 | Limite panier 30 articles | cartQtySchema (max 30) testé | Comportement de addToCart quand limite atteinte non testé |
| FLOW-RM-041 | Remises par défaut par univers | computeTotals testé avec des taux personnalisés | Les taux par défaut réels (30%/35%) ne sont pas vérifiés |
| FLOW-RM-049 | Validation panier stocké via Zod | storedCartSchema testé unitairement | La logique de purge dans CartContext (données invalides = panier vidé) non testée |
| FLOW-RM-064 | Opérations promotionnelles (cadeau + PLV) | Calcul remise PLV testé dans computeTotals | Ajout/suppression d'OP dans le panier non testé |
| FLOW-RM-070 | 3 statuts de commande | storedOrdersSchema valide les statuts | Transitions entre statuts non testées |
| FLOW-RM-079 | returnRatio | Cas ratio=0 (pas de commandes) testé | Cas avec commandes et retours (ratio > 0) non testé |
| FLOW-RM-080 | activeCount retours | Test vérifie >= 1 pour LIB001 | Valeur exacte non vérifiée, pas de test avec 0 actifs |
| FLOW-RM-081 | avoirYTD | Cas 0 (librairie sans données) testé | Cas avec avoirs réels non testé |
| FLOW-RM-098 | StatutCommande admin inclut « annule » | Utilisé implicitement dans tests services | Le statut « annule » n'existe pas côté libraire (storedOrdersSchema), divergence non testée |
| FLOW-RM-101 | Validation wishlists stockées via Zod | storedWishlistsSchema testé unitairement | Logique de purge dans WishlistContext non testée |

---

## 5. Incohérences ou risques

### Incohérence majeure : commandabilité des titres à paraître

**Règles concernées** : FLOW-RM-021, FLOW-RM-028, FLOW-RM-029

- `isOrderable()` dans `bookUtils.ts` retourne `false` pour les titres à paraître
- `BookCardRow` utilise `!isAParaitre && !isEpuise` pour bloquer l'ajout (cohérent)
- `BookCard` ne bloque pas l'ajout pour les titres à paraître : après une popin de confirmation, le livre est ajouté au panier
- CLAUDE.md stipule : « les titres à paraître ne sont PAS commandables via l'app »

3 sources, 2 comportements différents. `isOrderable()` n'est pas utilisé de manière cohérente dans les composants d'affichage.

### Divergence statuts de commande admin vs libraire

**Règle concernée** : FLOW-RM-098

Le côté admin (`src/admin/types.ts`) définit 4 statuts de commande incluant `annule`. Le côté libraire (`storedOrdersSchema`) n'autorise que 3 statuts (en préparation, expédié, livré). Si une commande est marquée « annulée » côté admin, la validation Zod côté libraire la rejetterait au chargement.

### Règles métier non documentées dans le code

- La formule de calcul des totaux du panier (FLOW-RM-045) est critique mais non commentée : `netHT = (subtotalTTC - remiseTTC) / 1.055` est une extraction inverse de TVA. La méthode (extraire la TVA du TTC remisé plutôt que calculer le HT avant remise puis ajouter la TVA) produit des résultats légèrement différents. Aucune documentation ne dit si c'est intentionnel.
- Le seuil de 60 jours pour les notifications « nouveautés » (FLOW-RM-105) n'a pas de source documentée.
- La constante `sectorAverage = 0.22` (FLOW-RM-082) est hardcodée sans source.

### Dépendances qui empêchent un vrai test unitaire

- `AuthContext.login()` et `register()` appellent `bcrypt.compare()` / `bcrypt.hash()` sans injection possible. Les tests actuels utilisent le vrai bcrypt (cost 4 en dev), ce qui les rend lents (~10s pour le register avec cost 12). Un mock de bcrypt simplifierait les tests.
- La persistance localStorage traverse tous les contexts (Cart, Orders, Wishlist, EDI, RDV, Dashboard). Tester l'isolation par codeClient nécessite un environment jsdom fonctionnel (corrigé dans cette session pour Node 26).

### Tests qui pourraient masquer un faux positif

- `computeTotals.test.ts` utilise ses propres taux de remise (9%, 10%, 8%) plutôt que les taux par défaut réels (30%, 35%). Si les taux par défaut changent, aucun test ne casserait.
- `returnsService.test.ts` teste essentiellement des cas à 0 (ratio=0, avoir=0). Un bug dans le calcul avec des données réelles ne serait pas détecté.

---

## 6. Proposition de découpage en lots

### Lot 1 : Panier et calcul des totaux

- **Règles** : FLOW-RM-038 à FLOW-RM-064
- **Justification** : coeur transactionnel de l'application, forte densité de règles métier non testées (ajout, incrémentation, limite, taux effectifs, suppression, persistance, OP)
- **Priorité** : haute

### Lot 2 : Authentification et isolation des données

- **Règles** : FLOW-RM-008, FLOW-RM-014, FLOW-RM-015, FLOW-RM-017, FLOW-RM-019, FLOW-RM-020
- **Justification** : sécurité d'accès et isolation par librairie. La plupart des règles auth sont déjà couvertes, ce lot comble les trous restants (schemas unitaires, ProtectedRoute, isolation codeClient)
- **Priorité** : haute

### Lot 3 : Commandabilité et stock

- **Règles** : FLOW-RM-021, FLOW-RM-025 à FLOW-RM-030, FLOW-RM-060, FLOW-RM-061, FLOW-RM-112 à FLOW-RM-115
- **Justification** : l'incohérence BookCard vs BookCardRow sur les titres à paraître est un risque fonctionnel majeur. Ce lot couvre la commandabilité, les statuts de stock, et les modales de confirmation
- **Priorité** : haute

### Lot 4 : Commandes et retours

- **Règles** : FLOW-RM-065 à FLOW-RM-083
- **Justification** : cycle de vie complet commande (création, statuts, numérotation) et retours (éligibilité, motifs, statistiques). Beaucoup de règles sans test
- **Priorité** : haute

### Lot 5 : EDI (échanges Dilicom)

- **Règles** : FLOW-RM-084 à FLOW-RM-091
- **Justification** : domaine cohérent, fonctions utilitaires déjà partiellement testées. Reste à couvrir la génération auto des réponses EDI et le groupement DESADV
- **Priorité** : moyenne

### Lot 6 : Recherche et filtrage catalogue

- **Règles** : FLOW-RM-031, FLOW-RM-033 à FLOW-RM-037
- **Justification** : recherche multi-champs partiellement testée (ISBN, collection, genre manquants), filtrage prix non testé
- **Priorité** : moyenne

### Lot 7 : Dashboard, KPIs et export

- **Règles** : FLOW-RM-107 à FLOW-RM-111, FLOW-RM-116, FLOW-RM-117
- **Justification** : indicateurs métier (CA, KPIs, donut) et facturation. Le dashboard config est bien testé, mais les calculs KPI et le filtrage par période ne le sont pas
- **Priorité** : moyenne

### Lot 8 : Wishlist, RDV, notifications, offices

- **Règles** : FLOW-RM-099 à FLOW-RM-106, FLOW-RM-118 à FLOW-RM-122
- **Justification** : domaines secondaires avec des règles simples (ajout/suppression, doublons, isolation codeClient). Logique similaire entre Wishlist et RDV (incrémentation, suppression si qty < 1)
- **Priorité** : basse

### Lot 9 : Admin

- **Règles** : FLOW-RM-092 à FLOW-RM-098
- **Justification** : la majorité est déjà couverte. Reste AdminRoute et la divergence de statuts admin/libraire
- **Priorité** : basse
