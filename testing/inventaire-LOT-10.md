# Inventaire LOT-10 : Retours

> Découpage thématique créé par l'inventaire (le lot liste ses 10 règles sans les grouper).

### Éligibilité et validation de la demande (UI)

| Règle | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-074 | Seules les commandes au statut `livré` sont proposées dans le sélecteur de commande du formulaire de retour | 🔴 | La liste des statuts éligibles (`ELIGIBLE_STATUSES`, `NewReturnModal.tsx:153`) n'est **pas exportée**, et le filtrage vit dans le corps du composant (`NewReturnModal.tsx:176`). Rien d'accessible depuis un test | Manuel (smoke) |
| FLOW-RM-076 | Le bouton d'envoi reste désactivé tant qu'un article coché n'a pas de motif, et aucun retour n'est créé dans ce cas | 🔴 | `allHaveReasons` (`NewReturnModal.tsx:205`) est calculé dans le corps du composant à partir du state local, non exporté. Le garde-fou de `handleSubmit` (`:208`) n'est pas atteignable sans monter le composant | Manuel (smoke) |

### Référentiels (motifs et statuts)

| Règle | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-075 | `RETURN_REASON_LABELS` contient exactement 5 motifs : `invendu`, `defaut_impression`, `mauvaise_livraison`, `doublon`, `autre`, chacun avec un libellé non vide | 🟢 | Constante exportée de `mockReturns.ts:10`, vérification directe de ses clés et de ses valeurs | Unitaire, test-first |
| FLOW-RM-078 | Le type `ReturnStatus` admet exactement 4 valeurs : `pending`, `in_transit`, `avoir_emis`, `refused`, et tous les statuts de `MOCK_RETURNS` sont dans cet ensemble | 🟢 | Pas de constante runtime pour les statuts (type seul, effacé à l'exécution), mais le test peut déclarer un `Record<ReturnStatus, true>` exhaustif, que TypeScript strict refuse de compiler si une valeur est ajoutée ou retirée, puis vérifier `MOCK_RETURNS` contre ce même ensemble. Mêmes moyens que FLOW-RM-071 au LOT-09 | Unitaire, test-first |

### Création d'un retour

| Règle | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-077 | `createReturn` renvoie un retour avec `status: 'pending'`, les champs de traitement à `null` (`blNumber`, `blGeneratedAt`, `avoirAmount`, `avoirGeneratedAt`, `refusalReason`) et le retour devient visible via `getReturns` | 🟢 | `createReturn` et `getReturns` sont exportés (`returnsService.ts:20` et `:12`). Affectation fixe dans notre code, aucune dépendance externe (le store est un tableau en mémoire) | Unitaire, test-first |

### Statistiques de retours

| Règle | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-079 | `returnRatio` = nb de retours du client / nb de ses commandes, et vaut 0 quand le client n'a aucune commande | 🟢 | `getReturnsStats` exporté (`returnsService.ts:40`). Calcul pur sur `MOCK_RETURNS` et `MOCK_ORDERS`, les 2 exportés. Les 2 branches du ternaire doivent être couvertes, pas seulement le repli à 0 | Unitaire, test-first |
| FLOW-RM-080 | `activeCount` compte exactement les retours `pending` et `in_transit`, et exclut `avoir_emis` et `refused` | 🟢 | Filtre `Array.filter` sur de la donnée à nous, via une fonction exportée. L'assertion doit porter sur un nombre exact et inclure un jeu contenant les 4 statuts | Unitaire, test-first |
| FLOW-RM-081 | `avoirYTD` = somme des `avoirAmount` dont `avoirGeneratedAt` tombe dans l'année en cours, les autres années étant exclues | 🟢 | Logique à nous dans une fonction exportée. La seule dépendance est l'horloge (`new Date().getFullYear()`), figée dans le test avec `vi.useFakeTimers()` / `vi.setSystemTime()`, sinon le résultat change au 1er janvier | Unitaire, test-first |
| FLOW-RM-082 | `sectorAverage` vaut 0.22 quel que soit le client | 🟢 | Valeur littérale renvoyée par une fonction exportée (`returnsService.ts:53`) | Unitaire, test-first |
| FLOW-RM-083 | `getReturns` et `getReturnsStats` ne renvoient que les retours du `codeClient` demandé, et une liste vide / des stats à 0 pour un client sans retour | 🟢 | Filtre sur `r.codeClient` dans 2 fonctions exportées (`returnsService.ts:13` et `:41`). Le test doit comparer 2 clients ayant chacun des retours, pas seulement un client connu contre un client inexistant | Unitaire, test-first |

---

## Ce que couvrent déjà les tests existants

`src/services/__tests__/returnsService.test.ts`, 5 tests. Ce qu'ils vérifient réellement :

| Test existant | Règle visée | Verdict |
|---|---|---|
| `activeCount >= 1 pour LIB001` | FLOW-RM-080 | **Assertion trop faible.** `toBeGreaterThanOrEqual(1)` est satisfait par n'importe quel nombre ≥ 1. Le test passerait aussi si le filtre comptait `refused` ou `avoir_emis`, c'est-à-dire précisément ce que la règle exclut. Il ne vérifie pas la règle |
| `avoirYTD = 0 pour LIB999` | FLOW-RM-081 | **Passe sans rien vérifier.** LIB999 n'a aucun retour : 0 est la valeur initiale du `reduce`. Le test resterait vert même si le filtre sur l'année ou la somme étaient cassés |
| `sectorAverage = 0.22` | FLOW-RM-082 | Couvre la règle, qui est une constante. Rien à ajouter au-delà du cas « un autre client renvoie la même valeur » |
| `returnRatio = 0 pour LIB999` | FLOW-RM-079 | **Passe sans rien vérifier.** Pour LIB999, `totalOrders` vaut 0 **et** `clientReturns.length` vaut 0 : les 2 branches du ternaire renvoient 0. Le test est vert quelle que soit la branche prise, et la division n'est jamais exercée |
| `createReturn` status `pending` | FLOW-RM-077 | Couvre le statut initial, mais seulement par l'effet de bord : il lit `after[after.length - 1]`, pas la valeur renvoyée par `createReturn`, et ne vérifie aucun des 5 champs de traitement attendus à `null` |

Ce que les tests existants laissent entièrement de côté : FLOW-RM-075, FLOW-RM-078, FLOW-RM-083 (couverture seulement implicite, sur un client sans retour), ainsi que les 2 règles d'UI FLOW-RM-074 et FLOW-RM-076.

## Pièges à signaler à `unit-test-writer`

1. **État de module partagé et mutable.** `_returns` et `_nextId` (`returnsService.ts:9-10`) vivent au niveau du module. `createReturn` pousse dans le tableau, donc un test de création change les résultats de tout test de statistiques exécuté après lui, dans le même fichier comme dans un autre. Prévoir un `vi.resetModules()` avec réimport dans chaque test qui dépend du contenu du store, ou n'utiliser que des `codeClient` dédiés et jamais réutilisés.
2. **`avoirYTD` dépend de l'année courante.** Les `avoirGeneratedAt` de `MOCK_RETURNS` sont tous en 2025. En 2026, `avoirYTD` pour LIB001 vaut 0. Toute assertion non triviale sur cette règle exige une horloge figée.
3. **`MOCK_RETURNS` n'exerce que 3 des 4 statuts** (`avoir_emis`, `in_transit`, `refused`), `pending` est absent du jeu de données. Un test de `activeCount` adossé aux seules données mock ne couvre donc que la moitié de la condition : construire un jeu de retours dédié.
4. **`MOCK_RETURNS` ne contient qu'un seul `codeClient`** (LIB001). L'isolation (FLOW-RM-083) ne se démontre pas avec ces données seules, il faut créer des retours pour un second client.

---

## Récap

**Unitaire automatisé (→ `unit-test-writer`)** :
- FLOW-RM-075 : 5 motifs de retour exacts, libellés non vides
- FLOW-RM-077 : retour créé en `pending`, champs de traitement à `null`
- FLOW-RM-078 : 4 statuts exacts, exhaustivité vérifiée à la compilation
- FLOW-RM-079 : returnRatio = retours / commandes, et 0 sans commande (les 2 branches)
- FLOW-RM-080 : activeCount = pending + in_transit, nombre exact, les 4 statuts présents dans le jeu
- FLOW-RM-081 : avoirYTD = somme de l'année en cours, horloge figée, autre année exclue
- FLOW-RM-082 : sectorAverage = 0.22
- FLOW-RM-083 : isolation par codeClient sur `getReturns` et `getReturnsStats`, avec 2 clients pourvus

Les 5 tests existants sont à reprendre, pas à compléter : 3 d'entre eux passent sans vérifier la règle qu'ils visent.

**Couverture partielle (unitaire + smoke)** : aucune.

**Vérification manuelle (→ `smoke-test-writer`)** :
- FLOW-RM-074 : ouvrir le formulaire de retour depuis l'historique et vérifier que le sélecteur ne propose que des commandes `livré`, aucune `en préparation` ni `expédié`
- FLOW-RM-076 : cocher un article sans choisir de motif et vérifier que « Envoyer la demande » reste désactivé, puis choisir le motif et vérifier qu'il s'active
