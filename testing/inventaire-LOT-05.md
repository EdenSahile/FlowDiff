# Inventaire des tests : LOT-05 : Catalogue, recherche et filtrage

## Résumé

| État | Nb règles |
|------|-----------|
| 🟢 Testable en unitaire | 4 |
| 🟢 Déjà couvert | 3 |
| 🟠 Partiel (unitaire + smoke) | 0 |
| 🔴 Vérifiable à la main uniquement | 0 |
| **Total** | **7** |

---

## Règles déjà couvertes

### FLOW-RM-032 : Recherche ISBN directe : correspondance exacte, trim

- **État** : 🟢 Déjà couvert
- **Tests existants** : `src/components/layout/__tests__/isbnSearch.test.ts` (3 tests)
- **Couverture** : correspondance exacte, ISBN inexistant, trim des espaces

### FLOW-RM-035 : Filtrage cumulatif univers + statut (page Fonds)

- **État** : 🟢 Déjà couvert
- **Tests existants** : `src/pages/fonds/__tests__/fondsFilter.test.ts` (5 tests)
- **Couverture** : sans filtre, univers seul, statut seul, cumulatif, combinaison vide

### FLOW-RM-036 : Calcul prix net remisé : priceTTC * (1 - rate)

- **État** : 🟢 Déjà couvert
- **Tests existants** : `src/components/catalogue/__tests__/priceNet.test.ts` (3 tests)
- **Couverture** : remise 30%, sans remise, remise 33% sur prix décimal

---

## Règles à tester en unitaire

### FLOW-RM-031 : Recherche locale multi-champs

- **État** : 🟢 Testable en unitaire (compléter la couverture)
- **Tests existants** : `src/services/__tests__/books.test.ts` (4 tests : titre, auteur, vide, aucun résultat)
- **Fonction** : `searchBooksLocal` (`src/services/books.ts:76-87`)
- **Ce qui manque** :
  - Recherche par ISBN (avec nettoyage espaces et tirets : `q.replace(/[\s-]/g, '')`)
  - Recherche par éditeur (`publisher`)
  - Recherche par collection
  - Recherche par genre
  - Requête avec espaces autour (trim)
  - Insensibilité à la casse sur tous les champs

### FLOW-RM-033 : Fallback Supabase vers données mock

- **État** : 🟢 Testable en unitaire (avec mock de supabase)
- **Tests existants** : aucun
- **Fonction** : `loadAllBooks` (`src/services/books.ts:43-59`)
- **Cas à couvrir** :
  - Supabase retourne des données : utilise les données Supabase
  - Supabase retourne un tableau vide : fallback vers MOCK_BOOKS
  - Supabase retourne une erreur : fallback vers MOCK_BOOKS
  - Cache module-level : 2e appel retourne le cache sans refetch

### FLOW-RM-034 : Filtrage par prix TTC : borne inf incluse, borne sup exclue

- **État** : 🟢 Testable en unitaire
- **Tests existants** : aucun
- **Fonction** : `filterBooksByPrice` (`src/data/mockBooks.ts:89-92`)
- **Cas à couvrir** :
  - Prix = borne inf exacte : inclus (`>=`)
  - Prix = borne sup exacte : exclu (`<`)
  - Prix entre 2 bornes : inclus
  - Aucune tranche sélectionnée : retourne tous les livres
  - Plusieurs tranches : union (livre dans au moins 1 tranche)
  - Tranche "50 EUR et plus" (max = Infinity)

### FLOW-RM-037 : Genres rattachés à chaque univers (GENRE_BY_UNIVERSE)

- **État** : 🟢 Testable en unitaire
- **Tests existants** : aucun
- **Structure** : `GENRE_BY_UNIVERSE` (`src/data/mockBooks.ts:39-76`)
- **Cas à couvrir** :
  - Les 4 univers sont présents comme clés
  - Chaque univers a au moins 1 genre
  - Aucun genre n'est une chaîne vide
  - Pas de doublons entre univers (un genre n'apparaît que dans 1 univers)

---

## Récapitulatif pour unit-test-writer

| ID | Règle | Fichier test | À faire |
|----|-------|-------------|---------|
| FLOW-RM-031 | Recherche multi-champs | `src/services/__tests__/books.test.ts` | Compléter : ISBN, éditeur, collection, genre, trim, casse |
| FLOW-RM-032 | Recherche ISBN directe | `src/components/layout/__tests__/isbnSearch.test.ts` | Rien (déjà couvert) |
| FLOW-RM-033 | Fallback Supabase → mock | `src/services/__tests__/books.test.ts` | Nouveau describe : mock supabase, fallback, cache |
| FLOW-RM-034 | Filtrage par prix | `src/data/__tests__/filterBooksByPrice.test.ts` | Nouveau fichier : bornes, union, Infinity |
| FLOW-RM-035 | Filtrage univers + statut | `src/pages/fonds/__tests__/fondsFilter.test.ts` | Rien (déjà couvert) |
| FLOW-RM-036 | Prix net remisé | `src/components/catalogue/__tests__/priceNet.test.ts` | Rien (déjà couvert) |
| FLOW-RM-037 | Genres par univers | `src/data/__tests__/genreByUniverse.test.ts` | Nouveau fichier : intégrité structure |

## Pas de fichier de smoke pour ce lot

Aucune regle de ce lot n'est 🟠 ni 🔴, donc **il n'existe pas de `testing/smokes-LOT-05.md`, et c'est voulu**. L'absence du fichier n'est pas un oubli : un relevé qui compare le nombre d'inventaires au nombre de fichiers de smoke conclura a tort qu'il en manque.
