# Inventaire des tests — FlowDiff

État réel de la couverture de test, module par module, tel que le code se présente aujourd'hui (pas un plan pour du code à venir). Sur le modèle de l'inventaire équivalent de StoryPilot-ai.

## Légende

- 🟢 **testable en unitaire** — logique pure, déjà extraite ou extractible dans `src/lib/`, `src/hooks/`, ou fonction de contexte appelable via `renderHook`.
- 🟠 **mixte** — une part unitaire (logique extraite) + une part qui nécessite un vrai rendu (React Testing Library / jsdom).
- 🔴 **nécessite un vrai navigateur** — parcours utilisateur multi-écrans, résultat observable seulement à l'écran (Playwright). **FlowDiff n'a aucun outillage e2e actuellement** (pas de Playwright, pas de `e2e/`) — voir section dédiée.

Contrairement à StoryPilot (un seul écran, 5 endpoints API), FlowDiff est une application à 23 pages côté libraire + 5 pages admin, avec 13 contexts React. Cet inventaire est donc volontairement priorisé par criticité métier plutôt que traité de façon exhaustive en une passe.

## `src/lib/` (fonctions pures)

| Fichier | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|
| `authUtils.ts` | 🟢 fait | `authUtils.test.ts` (12 tests) — `getSafeRedirectPath` (protection open redirect, ajoutée 2026-09-02). | Schémas `loginSchema`/`registerSchema`/`forgotPasswordSchema` et `createMockToken`/`parseMockToken` testés indirectement via `AuthContext.test.tsx`, pas en isolation. Acceptable (pas de duplication utile), à revisiter seulement si ces fonctions deviennent réutilisées ailleurs. |
| `bookUtils.ts` | 🟢 fait | `bookUtils.test.ts` (3 tests) — `isOrderable`. | Vérifier s'il existe d'autres exports non couverts (à re-scanner si le fichier grossit). |
| `csv.ts` | 🟢 fait | `csv.test.ts` (4 tests) — export CSV, BOM UTF-8. | — |
| `exportCSV.ts` | 🟢 fait | `exportCSV.test.ts` (7 tests) — `buildDashboardCSV`. | — |
| `formSchemas.ts` | 🟢 fait | `formSchemas.test.ts` (21 tests) — `contactSchema` et autres. | — |
| `storageSchemas.ts` | 🟢 fait | `storageSchemas.test.ts` (19 tests) — schémas de validation localStorage (panier, etc.). | — |
| `ediUtils.ts` | 🟢 fait | Testé dans `src/pages/edi/__tests__/ediUtils.test.ts` (39 tests) — `filterEDIMessages` et probablement d'autres. | **Emplacement à corriger** : le test d'un fichier `src/lib/ediUtils.ts` vit dans `src/pages/edi/__tests__/`, pas dans `src/lib/__tests__/`. Incohérent avec la convention du reste du projet (test co-localisé avec le module `lib` qu'il teste). Dette technique mineure, à déplacer. |
| `invoicePdf.ts` | 🔴 non fait | Aucun test. | Génération de PDF (facturation) : logique de mise en page difficile à unit-tester utilement ; à couvrir plutôt via un test de non-régression sur les données injectées (montants, TVA) plutôt que sur le rendu PDF lui-même. **Priorité moyenne** — la facturation est sensible (montants), mais le risque principal est déjà couvert côté schémas/calculs si extraits ailleurs à vérifier. |
| `mockUsers.ts` | — | Fixture de test, pas du code applicatif à tester en soi. | Rien — c'est une source de données mock, `AuthContext.test.tsx` la consomme déjà. |
| `responsive.ts` | 🟢 non fait | Aucun test. | À vérifier : si contient des fonctions pures (breakpoints), tests triviaux à ajouter. Priorité basse. |
| `slugify.ts` | 🟢 non fait | Aucun test. | Fonction pure typique, test trivial à écrire (quelques minutes). Priorité basse mais "quick win". |
| `supabase.ts` | — | Non testable en unitaire (initialisation de client externe). | Rien à faire ici — la logique métier qui *utilise* le client doit être testée via mocks au niveau des services, pas ce fichier. |
| `theme.ts` | — | Constantes de charte graphique, pas de logique. | Rien à faire. |

## `src/hooks/`

| Fichier | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|
| `useAuth.ts` | — | Ré-export de `useAuthContext` (`AuthContext.tsx`). | Rien — la vraie logique est dans `AuthContext.tsx`, voir section contexts. |
| `useDashboardConfig.ts` | 🟢 fait | `useDashboardConfig.test.ts` (13 tests) — `reorderItems`, `toggleItem`, forme de `DEFAULT_CONFIG`. Test `bottomPanels` corrigé le 2026-09-02 (attendait 3, la config réelle en a 2 depuis le retrait de `panel-raccourcis`). | `loadConfig`/`saveConfig` (localStorage) non testés directement. Priorité basse (logique simple, déjà protégée par try/catch). |
| `usePeriodFilter.ts` | 🔴 non fait | Aucun test. | À évaluer — utilisé sur plusieurs pages de filtrage (historique, EDI, dashboard ?). Si la logique de calcul de période est pure, l'extraire et la tester. **Priorité moyenne**, dépend du nombre de pages qui en dépendent. |
| `useRefetchOnFocus.ts` | 🔴 non fait | Aucun test. | Hook d'effet de bord (event listener sur focus fenêtre) — difficile à unit-tester utilement, candidat plutôt pour une vérification en e2e si le comportement est critique. Priorité basse. |

## `src/services/` et `src/admin/services/`

| Fichier | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|
| `books.ts` | 🟢 fait | `books.test.ts` (4 tests) — `searchBooksLocal`. | Vérifier les autres exports éventuels. |
| `returnsService.ts` | 🟢 fait | `returnsService.test.ts` (5 tests) — `getReturnsStats`. | — |
| `ordersService.ts` | 🔴 non fait | Aucun test. | 3 fonctions exportées (`getOrders`, `getOrderById`, `getShipment`), toutes async. **Priorité haute** : les commandes sont le cœur métier de l'app B2B ; aucune fonction de ce fichier n'est couverte. |
| `adminServices.ts` | 🟢 fait | `adminServices.test.ts` (2 tests) — `computeCAMois`, `computeTop5`. Les 2 fonctions exportées du fichier sont couvertes. | — |

## `src/contexts/` et `src/admin/contexts/`

| Fichier | Lignes | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|---|
| `AuthContext.tsx` | 200 | 🟢 fait | `AuthContext.test.tsx` (18 tests, ajouté 2026-09-02) — login (succès/échecs), register (succès/échecs), logout, restauration/nettoyage de session, erreur hors provider. | — |
| `CartContext.tsx` | 307 | 🟠 partiel | `computeTotals.test.ts` (8 tests) — logique de calcul des totaux/remises extraite et testée. | Le reste du contexte (ajout/suppression d'articles, persistance localStorage, synchronisation) n'est testé qu'indirectement. **Priorité haute** — le panier est un flux critique (commande = revenu). |
| `OrdersContext.tsx` | 182 | 🔴 non fait | Aucun test direct. | **Priorité haute** — dépend de `ordersService.ts` (également non testé). |
| `EDIContext.tsx` | 183 | 🟠 partiel | Logique de filtrage testée via `ediUtils.test.ts` (39 tests, mais emplacement incohérent — voir note `src/lib/`). | Le contexte lui-même (état, actions) non testé directement. Priorité moyenne — la logique métier la plus risquée (parsing/filtrage) est déjà couverte. |
| `WishlistContext.tsx` | 143 | 🔴 non fait | Aucun test. | Priorité basse-moyenne (fonctionnalité secondaire, pas transactionnelle). |
| `NotificationsContext.tsx` | 120 | 🔴 non fait | Aucun test. | Priorité basse. |
| `RdvContext.tsx` | 116 | 🔴 non fait | Aucun test. | Priorité basse. |
| `ReturnsContext.tsx` | 93 | 🟠 partiel | Logique couverte côté service (`returnsService.test.ts`). | Contexte lui-même non testé. Priorité basse (service déjà couvert). |
| `ToastContext.tsx` | 58 | 🟢 partiel | `toastAction.test.ts` (2 tests) — forme du payload d'action. | Reste du contexte (affichage/dismiss) non testé, priorité basse (UI non critique). |
| `AdminAuthContext.tsx` | 54 | 🟢 fait | `adminAuth.test.ts` (3 tests) — accepte/rejette les identifiants. | Couverture correcte pour la taille du fichier. |
| `OnboardingContext.tsx` | 46 | 🔴 non fait | Aucun test. | Priorité basse. |
| `DemoStateContext.tsx` | 35 | 🔴 non fait | Aucun test. | Priorité basse. |
| `ThemeContext.tsx` | 10 | — | Aucun test. | Trivial, pas nécessaire. |

## Pages (`src/pages/`, `src/admin/pages/`)

Aucune page n'a de test de rendu complet (React Testing Library). La discipline actuelle du projet consiste à extraire la logique métier pure dans un fichier `xxxUtils.ts`/`xxxFilter.ts` colocalisé et à la tester isolément — approche cohérente avec StoryPilot, mais qui laisse le rendu et les interactions utilisateur non couverts partout.

| Page | Lignes | Logique extraite testée | Rendu testé | Priorité si à combler |
|---|---|---|---|---|
| `HomePage.tsx` | 2682 | Non | Non | **Haute** — page d'accueil/dashboard, la plus grosse du projet, aucune couverture du tout. |
| `FicheProduitPage.tsx` | 1951 | Non (via `priceNet.test.ts` côté composant `catalogue`, calcul de prix net remisé) | Non | Haute — fiche produit = déclencheur d'achat. |
| `CartPage.tsx` | 1854 | Oui — `checkoutSchemas.test.ts` (7), `checkoutSteps.test.ts` (8) | Non | **Haute** — tunnel de commande, flux transactionnel le plus critique de l'app. |
| `SelectionsPage.tsx` | 1642 | Non | Non | Moyenne. |
| `OfficesPage.tsx` | 1330 | Non | Non | Moyenne. |
| `FacturationPage.tsx` | 1328 | Non | Non | **Haute** — montants financiers, contient aussi le bug potentiel de `setState` synchrone dans `useEffect` relevé lors de l'audit lint. |
| `EDIPage.tsx` | 1055 | Oui — `ediUtils.test.ts` (39, emplacement à corriger) | Non | Moyenne (logique déjà couverte). |
| `HistoriquePage.tsx` | 1023 | Non | Non | Moyenne. |
| `TopVentesPage.tsx` | 669 | Non | Non | Basse-moyenne. Note : c'est aussi la page où `tsc` remontait des erreurs de typage avant installation propre des deps (`theme` implicite `any`) — à revérifier une fois l'environnement CI en place. |
| `FlashInfosPage.tsx` | 642 | Non | Non | Basse. |
| `RecherchePage.tsx` | 597 | Non | Non | Moyenne (point d'entrée catalogue). |
| `RdvPage.tsx` | 583 | Non | Non | Basse. |
| `ParametresPage.tsx` | 440 | Non | Non | Basse. |
| `MonComptePage.tsx` | 427 | Non | Non | Moyenne (données personnelles/facturation). |
| `AdminCataloguePage.tsx` | 314 | Non | Non | Moyenne (outil interne, moins de risque utilisateur final). |
| `ContactPage.tsx` | 328 | Non | Non | Basse. |
| `FondsPage.tsx` | 348 | Oui — `fondsFilter.test.ts` (5) | Non | Basse (logique couverte). |
| `NouveautesPage.tsx` | 300 | Non | Non | Basse. |
| `AdminDashboardPage.tsx` | 248 | Non (`adminServices.ts` couvert séparément) | Non | Basse. |
| `OrderTransmissionStep.tsx` | 253 | Non | Non | Moyenne (fait partie du tunnel de commande). |
| `LoginPage.tsx` | 293 | Oui, partiellement — `authUtils.test.ts` couvre `getSafeRedirectPath` ; `AuthContext.test.tsx` couvre la logique métier appelée. | Non (formulaire, modale de blocage, etc.) | Moyenne — logique critique déjà couverte, reste le rendu/interactions. |
| `AdminLibrairesPage.tsx` | 208 | Non | Non | Basse. |
| `NewsletterPage.tsx` | 224 | Non | Non | Basse. |
| `AParaitrePage.tsx` | 251 | Non | Non | Basse. |
| `AuteurPage.tsx` | 198 | Non | Non | Basse. |
| `AdminCommandesPage.tsx` | 197 | Non | Non | Basse-moyenne. |
| `RegisterPage.tsx` | 183 | Oui, via `AuthContext.test.tsx` (schéma register). | Non | Basse (logique déjà couverte). |
| `AidePage.tsx` | 177 | Non | Non — probablement statique. | Basse. |
| `CGVPage.tsx` | 152 | Non | Non — page statique. | Très basse, pas nécessaire. |
| `AdminLoginPage.tsx` | 132 | Non (`AdminAuthContext` couvert séparément) | Non | Basse. |
| `ForgotPasswordPage.tsx` | 110 | Non | Non | Basse. |

**Composants UI partagés déjà couverts** (hors tableau ci-dessus, dans `src/components/`) : `BackButton` (3 tests, rendu), `StockStatus` (6 tests, logique `getTooltipText`), `FeedbackWidget` (16 tests, `getPageName`), `PriceNet`/catalogue (3 tests), `isbnSearch` layout (3 tests).

## E2E (Playwright)

🔴 **Aucun outillage e2e n'existe actuellement dans FlowDiff.** Ni `playwright.config.ts`, ni dossier `e2e/`, ni dépendance `@playwright/test` dans `package.json`. C'est l'écart le plus net avec StoryPilot, qui a 4 tests e2e couvrant son parcours critique unique.

Pour FlowDiff, un premier socle e2e raisonnable (pas exhaustif) couvrirait, par ordre de priorité métier :

1. **Connexion → panier → commande** (le tunnel transactionnel complet, l'équivalent du parcours "brief → génération → résultats" de StoryPilot).
2. **Connexion refusée / session expirée** (redirection vers `/login`, y compris non-régression du correctif open redirect du 2026-09-02).
3. **Navigation complète entre les sections principales** (Accueil, Catalogue, Panier, Historique, EDI) via le menu.

Non fait à ce stade — proposé comme chantier suivant, pas improvisé dans cet inventaire.

## Résumé chiffré (2026-09-02)

- **211 tests unitaires**, 24 fichiers de test (`npx vitest run`, tous verts).
- 0 test de rendu de page complète, 0 test e2e.
- Modules `lib/` : 10/14 couverts (les 4 restants sont soit non pertinents à tester — `supabase.ts`, `theme.ts`, `mockUsers.ts` — soit priorité basse — `responsive.ts`, `slugify.ts`).
- Contexts : 3/13 bien couverts (`AuthContext`, `AdminAuthContext`, `CartContext` partiellement), 10 non testés directement.
- Pages : 5/28 ont de la logique extraite testée ; aucune n'a de test de rendu.

## Priorités (prochains chantiers, par ordre suggéré)

1. `ordersService.ts` + `OrdersContext.tsx` — cœur métier (commandes), zéro couverture actuelle.
2. `CartContext.tsx` au-delà de `computeTotals` — flux transactionnel.
3. Rendu de `CartPage.tsx` / `LoginPage.tsx` (React Testing Library) — les deux pages où une régression a le plus de conséquences directes (revenu, sécurité).
4. Déplacer `ediUtils.test.ts` de `src/pages/edi/__tests__/` vers `src/lib/__tests__/` (cohérence de convention, pas une urgence).
5. Nettoyer le `LABEL['panel-raccourcis']` orphelin dans `CustomizerDrawer.tsx` (dette mineure identifiée en corrigeant le test `useDashboardConfig`).
6. Socle e2e Playwright (voir section dédiée).

*Ce fichier est un état des lieux vivant, à mettre à jour à chaque chantier de test significatif — pas un log daté à conserver tel quel indéfiniment (cf. convention `CLAUDE.md` sur les blocs de session).*
