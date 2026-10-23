# Inventaire des tests — FlowDiff

État réel de la couverture de test, module par module, tel que le code se présente aujourd'hui (pas un plan pour du code à venir).

**Ce fichier donne la vue d'ensemble. Le détail règle par règle vit dans les 18 inventaires de lot** (`testing/inventaire-LOT-*.md`), qui sont la source de vérité sur ce que couvre chaque test. Celui-ci répond à une autre question : quel module a des tests, lesquels n'en ont pas, et où est le risque.

## Légende

- 🟢 **testable en unitaire** : logique pure, dans `src/lib/`, `src/hooks/`, ou fonction de contexte appelable via `renderHook`.
- 🟠 **mixte** : une part unitaire (logique extraite) + une part qui exige un vrai rendu (React Testing Library / jsdom).
- 🔴 **nécessite un vrai navigateur** : parcours multi-écrans, observable seulement à l'écran (Playwright).

## Chiffres

| | Fichiers | Tests |
|---|---|---|
| Unitaires et rendu (Vitest) | 47 | **504** |
| End-to-end (Playwright) | 5 | **83** |

Commandes : `npx vitest run` et `npx playwright test --list`. Tous verts au moment de l'écriture.

La campagne de test par lots est terminée. Sur les 135 règles de la matrice de traçabilité de `lots-flowdiff.md` :

- **7 sont caduques** : celles du LOT-12, qui couvrait le back-office, retiré du build.
- **2 sont reportées** : FLOW-RM-133 et 134, le FeedbackWidget vivant dans `parked/feedback/` hors du build.
- **Les 126 autres appartiennent à un lot traité.** Attention à la lecture : « lot traité » ne veut pas dire « règle testée automatiquement ». Les règles classées 🔴 dans leur inventaire reposent sur un scénario de smoke manuel, et c'est là que la campagne est inachevée (voir le point 2 de la dernière section).

## `src/lib/` (fonctions pures)

| Fichier | Lignes | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|---|
| `authUtils.ts` | 128 | 🟢 fait | `authUtils.test.ts` (39 tests) : `getSafeRedirectPath` (protection open redirect), `createMockToken`/`parseMockToken`, et les 3 schémas `loginSchema`, `registerSchema`, `forgotPasswordSchema` testés en isolation. | — |
| `bookUtils.ts` | 14 | 🟢 fait | `bookUtils.test.ts` (11 tests) : `isOrderable`, dont les titres à paraître commandables. | — |
| `csv.ts` | 23 | 🟢 fait | `csv.test.ts` (12 tests) : BOM UTF-8, séparateur, les 3 cas d'échappement, nom du fichier téléchargé, CRLF. | — |
| `ediUtils.ts` | 511 | 🟢 fait | `src/pages/edi/__tests__/ediUtils.test.ts` (51 tests) : filtrage, groupage DESADV, compteurs de flux, recherche ISBN, génération EDIFACT. | **Emplacement incohérent** : le test d'un module de `src/lib/` vit dans `src/pages/edi/__tests__/`. Dette mineure, à déplacer vers `src/lib/__tests__/`. |
| `exportCSV.ts` | 258 | 🟠 partiel | `exportCSV.test.ts` (15 tests) : `buildDashboardCSV` et `buildKPIOnlyCSV`, les 2 fonctions pures du module. | Les 8 fonctions `export*CSV` qui déclenchent un téléchargement ne sont pas testées. Choix assumé (LOT-18) : elles ne renvoient rien et partagent la coquille DOM déjà couverte par `csv.test.ts`. |
| `format.ts` | 5 | 🟢 fait | `format.test.ts` (1 test) : `formatPrice`. | — |
| `formSchemas.ts` | 26 | 🟢 fait | `formSchemas.test.ts` (34 tests) : les 4 schémas, bornes exactes des 2 côtés, trim prouvé sur la valeur de sortie. | — |
| `invoicePdf.ts` | 442 | 🔴 non fait | Aucun test. Un seul export, `openInvoicePDF`, appelé par `FacturationPage.tsx:6`. | Génération de PDF : le rendu ne se teste pas utilement en unitaire. Les montants injectés, eux, sont couverts côté données par `mockFactures.test.ts` (7 tests). **Priorité basse** une fois ce constat posé. |
| `mockUsers.ts` | 59 | — | Fixture consommée par `AuthContext.test.tsx`. | Rien, ce sont des données. |
| `responsive.ts` | 18 | 🟢 non fait | Aucun test. | Constantes de breakpoints. Priorité basse. |
| `slugify.ts` | 8 | 🟢 non fait | Aucun test. | Fonction pure, test trivial. Priorité basse. |
| `storageSchemas.ts` | 47 | 🟢 fait | `storageSchemas.test.ts` (32 tests) : les 3 schémas de relecture du localStorage, valeurs par défaut, champs optionnels contraints. | — |
| `theme.ts` | 88 | — | Constantes de charte graphique. | Rien à faire. |

`supabase.ts` n'existe plus : Supabase a été retiré du frontend, l'application lit `MOCK_BOOKS`.

## `src/hooks/`

| Fichier | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|
| `useAuth.ts` | — | Ré-export de `useAuthContext`. | Rien, la logique est dans `AuthContext.tsx`. |
| `useDashboardConfig.ts` | 🟢 fait | `useDashboardConfig.test.ts` (13 tests) : `reorderItems`, `toggleItem`, forme de `DEFAULT_CONFIG`. | `loadConfig`/`saveConfig` non testés directement. Priorité basse. |
| `usePeriodFilter.ts` | 🟢 fait | `usePeriodFilter.test.tsx` (9 tests) : calcul des périodes. | — |
| `useRefetchOnFocus.ts` | 🔴 non fait | Aucun test. | Hook d'effet de bord (listener sur le focus fenêtre). Ne se teste pas utilement en unitaire. Priorité basse. |

## `src/services/` et `src/admin/services/`

| Fichier | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|
| `books.ts` | 🟢 fait | `books.test.ts` (15 tests) : recherche multi-champs, recherche ISBN, filtrage. | — |
| `returnsService.ts` | 🟢 fait | `returnsService.test.ts` (13 tests) : éligibilité au retour, motifs, statistiques. | — |
| ~~`ordersService.ts`~~ | — | — | **Supprimé** : ses 3 fonctions `getOrders`, `getOrderById` et `getShipment` n'étaient importées par aucun fichier de `src/`. Les commandes passent par `OrdersContext`, couvert séparément. |
| `adminServices.ts` | 🟢 fait | `adminServices.test.ts` (2 tests) : `computeCAMois`, `computeTop5`, les 2 exports du fichier. | Rattaché au back-office, non routé. |

## `src/contexts/` et `src/admin/contexts/`

| Fichier | Lignes | Classement | Ce qui existe | Ce qui manque |
|---|---|---|---|---|
| `CartContext.tsx` | 358 | 🟢 fait | `computeTotals.test.ts` (11), `cartOperations.test.tsx` (24), `lot08-cart-ebooks-op.test.tsx` (27), `storageKeyIsolation.test.tsx` (9) : totaux et ventilation de TVA par taux, ajout/modification/suppression, limite de démonstration, ebooks et OP, isolation par `codeClient`. | — |
| `AuthContext.tsx` | 200 | 🟢 fait | `AuthContext.test.tsx` (21) et `AuthContext.register-bcrypt.test.tsx` (1) : login, register, logout, restauration et nettoyage de session, coût bcrypt. | — |
| `EDIContext.tsx` | 183 | 🟠 partiel | Logique couverte par `ediUtils.test.ts` (51). | Le provider lui-même (génération automatique d'ORDRSP et DESADV par `setTimeout`, isolation par `codeClient`) relève du smoke manuel, classé 🔴 dans l'inventaire du LOT-11. |
| `OrdersContext.tsx` | 182 | 🟢 fait | `lot09-orders.test.tsx` (14), `lot09-migration.test.ts` (4), `lot09-migration-noop.test.ts` (3) : création de commande, numérotation, isolation par `codeClient`, migration de storage. | — |
| `WishlistContext.tsx` | 143 | 🟢 fait | `wishlist.test.tsx` (6), complété par `e2e/wishlist.spec.ts` (2 tests). | — |
| `NotificationsContext.tsx` | 120 | 🟢 fait | `notifications.test.tsx` (7). | — |
| `ReturnsContext.tsx` | 103 | 🟠 partiel | Logique couverte côté service (`returnsService.test.ts`, 13 tests). | Le provider lui-même n'est pas testé. Priorité basse. |
| `ToastContext.tsx` | 58 | 🟠 partiel | `toastAction.test.ts` (2) : forme du payload d'action. | Affichage et fermeture non testés. Priorité basse, UI non critique. |
| `AdminAuthContext.tsx` | 50 | 🔴 non fait | Aucun test. Le fichier `adminAuth.test.ts` a disparu avec le retrait des identifiants en dur de la source. | Rien à faire tant que le back-office n'est pas routé. |
| `OnboardingContext.tsx` | 46 | 🔴 non fait | Aucun test. | Priorité basse. |
| `DemoStateContext.tsx` | 35 | 🔴 non fait | Aucun test. | Priorité basse. |
| `ThemeContext.tsx` | 10 | — | Aucun test. | Trivial, pas nécessaire. |

`RdvContext.tsx` n'existe plus : la fonctionnalité de rendez-vous a été supprimée pendant le LOT-13.

## Pages (`src/pages/`, `src/admin/pages/`)

La discipline du projet est d'extraire la logique métier dans un module colocalisé et de la tester isolément, puis de couvrir le parcours à l'écran en e2e plutôt qu'en rendu jsdom. 3 pages ont malgré tout un test de rendu, écrit quand le comportement tenait à l'affichage lui-même.

| Page | Lignes | Logique extraite testée | Rendu testé | Priorité si à combler |
|---|---|---|---|---|
| `HomePage.tsx` | 2838 | Via `mockDashboard.test.ts` (14) et `useDashboardConfig.test.ts` (13) | Non | Moyenne. La plus grosse page du projet, couverte par la navigation e2e mais pas dans son détail. |
| `FicheProduitPage.tsx` | 1850 | Via `priceNet.test.ts` (3) | Oui, `FicheProduitPage.test.tsx` (1) | Moyenne. |
| `CartPage.tsx` | 1828 | Oui : `checkoutSchemas.test.ts` (10), `checkoutSteps.test.ts` (8), `checkoutTunnel.test.ts` (14) | Non | Basse, le tunnel est le mieux couvert du projet. |
| `SelectionsPage.tsx` | 1685 | Non | Non | Moyenne, couverte en navigation e2e seulement. |
| `FacturationPage.tsx` | 1332 | Via `mockFactures.test.ts` (7) | Non | Basse, complétée par `e2e/facturation.spec.ts` (23 tests). |
| `OfficesPage.tsx` | 1298 | Non | Non | Moyenne. |
| `HistoriquePage.tsx` | 1023 | Via `usePeriodFilter.test.tsx` (9) | Non | Basse. |
| `FlashInfosPage.tsx` | 906 | Via `mockFlashInfos.test.ts` (5) | Oui, `FlashInfosPage.test.tsx` (3) | Basse. |
| `EDIPage.tsx` | 813 | Oui : `ediUtils.test.ts` (51) | Non | Basse. |
| `TopVentesPage.tsx` | 669 | Non | Non | Basse. |
| `RecherchePage.tsx` | 597 | Via `books.test.ts` (15) et `isbnSearch.test.ts` (3) | Non | Basse. |
| `ParametresPage.tsx` | 440 | Via `formSchemas.test.ts` (34) | Non | Basse. |
| `MonComptePage.tsx` | 427 | Non | Non | Moyenne, données de la librairie. |
| `FondsPage.tsx` | 363 | Oui : `fondsFilter.test.ts` (5) | Non | Basse. |
| `ContactPage.tsx` | 328 | Via `formSchemas.test.ts` | Non | Basse. |
| `NouveautesPage.tsx` | 315 | Via `catalogueType.test.ts` (5) | Non | Basse. |
| `LoginPage.tsx` | 293 | Oui : `authUtils.test.ts` (39), `AuthContext.test.tsx` (21) | Non | Basse. Les 2 champs sont désactivés et préremplis en mode démonstration. |
| `AParaitrePage.tsx` | 273 | Via `catalogueType.test.ts` et `bookUtils.test.ts` | Non | Basse. |
| `OrderTransmissionStep.tsx` | 253 | Oui : `checkoutTunnel.test.ts` (14) | Non | Basse. |
| `AuteurPage.tsx` | 198 | Non | Non | Basse. |
| `RegisterPage.tsx` | 183 | Oui : `authUtils.test.ts` | Non | Basse. |
| `AidePage.tsx` | 177 | Non | Non | Basse, page statique. |
| `CGVPage.tsx` | 152 | Non | Non | Très basse, page statique. |
| `ForgotPasswordPage.tsx` | 110 | Oui : `authUtils.test.ts` | Non | Basse. |

**Back-office, hors du build** : `AdminCataloguePage` (315), `AdminDashboardPage` (248), `AdminLibrairesPage` (210), `AdminCommandesPage` (191), `AdminLoginPage` (132). Non routées, leurs services échouent si on les appelle. Aucun test attendu tant qu'elles ne sont pas rebranchées. Le LOT-12 qui les couvrait a été déclaré caduc pour cette raison.

`NewsletterPage.tsx` et `RdvPage.tsx` ne figurent plus ici : toutes deux supprimées, la première comme code mort, la seconde avec la fonctionnalité de rendez-vous.

**Composants partagés couverts** (`src/components/`) : `BookCard` (7 tests, rendu), `BookCardRow` (4, rendu), `CatalogueLoadState` (3), `CatalogueFilters` (2), `StockAlertModal` (8), `StockStatus` (6), `BackButton` (3), `ProtectedRoute` (4), `priceNet` (3), `isbnSearch` (3). Les 16 tests du `FeedbackWidget` ont disparu avec son déplacement dans `parked/feedback/`.

## E2E (Playwright)

Playwright est installé et configuré (`playwright.config.ts`), le dossier `e2e/` contient **83 tests dans 5 fichiers**, tous verts.

| Fichier | Tests | Périmètre |
|---|---|---|
| `navigation.spec.ts` | 28 | Desktop : connexion, redirection des routes protégées, les 15 liens de la sidebar, recherche par mot-clé et par ISBN, panier, footer, URL inconnue, déconnexion, retour arrière depuis une sélection. |
| `navigation-mobile.spec.ts` | 23 | Viewport 390x844 : sidebar masquée, bottom bar, les 5 onglets, les 11 liens du menu burger, logo, recherche, panier, déconnexion. |
| `facturation.spec.ts` | 23 | Factures et avoirs, filtres, ouverture du PDF. |
| `tunnel-commande.spec.ts` | 7 | Panier vide en session neuve, ajout d'un titre et badge, les 3 étapes du tunnel, écran de confirmation, panier vidé après envoi, commande retrouvée dans l'historique, absence d'erreur JS sur le parcours complet. |
| `wishlist.spec.ts` | 2 | Création d'une liste et ajout d'un titre. |

**Piège relevé en écrivant `tunnel-commande.spec.ts`, vérifié par diagnostic** : `getByRole('button', { name: 'Ajouter au panier' })` ne sélectionne pas le bouton d'une carte de liste, il sélectionne **la carte**. La carte est un `article[role="button"]` (`BookCard.tsx:640`) et le nom accessible d'un élément se calcule sur tout son contenu textuel, qui inclut le libellé du bouton imbriqué. Le clic tombe alors au centre de la carte et navigue vers la fiche produit sans rien ajouter. Deux conséquences :

- **Pour les tests** : viser le bouton avec un sélecteur que la carte ne peut pas satisfaire, par exemple `locator('button[aria-label="Ajouter au panier"]')`.
- **Pour l'application** : une carte `role="button"` qui contient d'autres boutons est invalide en accessibilité. Un lecteur d'écran annonce « bouton » suivi de tout le texte de la carte, et les contrôles imbriqués sont mal atteignables. Non corrigé, hors périmètre de la campagne de test.

## Ce qui reste, par ordre suggéré

1. **Les smokes manuels de la campagne.** Seuls 5 lots sur 17 ont un fichier de scénarios (`smokes-LOT-02`, `03`, `04`, `10`, `11`), et rien ne trace si l'un d'eux a été exécuté. Les lots suivants ont été traités sans en écrire. C'est le plus gros reste de la campagne.
2. **Déplacer `ediUtils.test.ts`** de `src/pages/edi/__tests__/` vers `src/lib/__tests__/`, pour suivre la convention du projet.
3. `slugify.ts` et `responsive.ts`, 2 modules purs sans test. Gain faible, coût faible.
4. Les pages sans aucune logique extraite ni rendu testé : `SelectionsPage`, `OfficesPage`, `MonComptePage`, `TopVentesPage`, `AuteurPage`. Couvertes en navigation e2e, pas dans leur détail.

Fermés depuis la version précédente de ce fichier : l'e2e du tunnel de commande (`tunnel-commande.spec.ts`, 7 tests) et la suppression de `ordersService.ts`.

*Ce fichier est un état des lieux vivant, à mettre à jour à chaque chantier de test significatif, pas un log daté à conserver tel quel.*
