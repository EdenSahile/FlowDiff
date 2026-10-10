# Inventaire des tests - LOT-04

## Catalogue : types, statuts et commandabilite

> Decoupage thematique cree par l'inventaire (le ticket liste les regles a plat, sans groupes).

---

### Classification des titres

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-022 | Les 3 types de titres (nouveaute, a-paraitre, fonds) sont les seuls presents dans les donnees | 🟢 | Verification d'invariant sur le tableau exporte `MOCK_BOOKS` : on itere et on verifie que chaque `book.type` appartient a l'union `BookType`. Pas de dependance externe. | Unitaire, test-first |
| FLOW-RM-023 | Les 4 univers (Litterature, BD/Mangas, Jeunesse, Adulte-pratique) sont les seuls presents dans les donnees | 🟢 | Meme logique : invariant sur `MOCK_BOOKS`, chaque `book.universe` appartient a l'union `Universe`. Pas de dependance externe. | Unitaire, test-first |

### Statuts de stock et resolution

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-024 | Les 6 statuts de stock (disponible, stock_limite, sur_commande, en_reimp, epuise, rupture) sont les seuls presents dans les donnees | 🟢 | Invariant sur `MOCK_BOOKS` : chaque `book.statut` (quand il existe) appartient a l'union `StockStatut`. Pas de dependance externe. | Unitaire, test-first |
| FLOW-RM-025 | Les statuts sur_commande et en_reimp sont interdits pour les nouveautes (forces a disponible par `resolveStatut`) | 🟢 | `resolveStatut` est une fonction pure interne. Elle n'est pas exportee, mais son effet est observable sur `MOCK_BOOKS` : on verifie qu'aucune nouveaute n'a le statut sur_commande ou en_reimp. On peut aussi tester la logique directement en extrayant la fonction ou en construisant des cas via les `STOCK_OVERRIDES` existants. | Unitaire, test-first |
| FLOW-RM-026 | Les titres a paraitre n'ont pas de statut de stock (propriete `statut` absente) | 🟢 | Observable sur `MOCK_BOOKS` : on verifie que tous les livres avec `type === 'a-paraitre'` n'ont pas de propriete `statut`. Logique du mapping a la ligne 753-756. | Unitaire, test-first |

### Commandabilite et ajout au panier

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-021 | Un titre a paraitre EST commandable (`isOrderable` doit retourner `true` pour `a-paraitre`) | 🟢 | `isOrderable` est une fonction pure exportee. Le test existant dans `bookUtils.test.ts` ligne 13 asserte `false` pour `a-paraitre` : **ce test reflete l'ancienne regle et devra etre corrige**. | Unitaire, test-first (correction du test existant) |
| FLOW-RM-027 | Un titre epuise ou en rupture affiche "Indisponible" avec bouton desactive | 🟠 | Le branchement `isEpuise = book.statut === 'epuise' \|\| book.statut === 'rupture'` et `isOrderable = !isEpuise` (BookCard ligne 596-598) est du code a nous, testable via @testing-library/react avec hooks mockes. Le test unitaire verifie la presence du texte "Indisponible" et l'attribut `disabled` du bouton dans le DOM. Un smoke confirme le rendu visuel reel (bouton grise, interaction bloquee dans le navigateur). | Unitaire (rendu conditionnel) + smoke manuel (verification visuelle) |
| FLOW-RM-028 | BookCard permet l'ajout au panier d'un titre a paraitre (comportement correct) | 🟠 | Le handler `handleAdd` (ligne 619-625) ne bloque pas pour `isAParaitre`, il ouvre une popin de notes. Testable en unitaire via @testing-library/react : rendre BookCard avec un livre a-paraitre, cliquer sur le bouton d'ajout, verifier que la popin s'ouvre (changement du DOM). Smoke necessaire pour confirmer que le parcours complet (popin > confirmation > ajout effectif au panier) fonctionne dans le navigateur. | Unitaire (clic > popin ouverte dans le DOM) + smoke manuel (parcours complet d'ajout) |
| FLOW-RM-029 | BookCardRow bloque l'ajout pour a-paraitre (BUG a corriger) et pour epuise (correct) | 🟠 | `isOrderable = !isAParaitre && !isEpuise` (ligne 803) : le `!isAParaitre` est un bug. Le test unitaire sera ecrit pour le comportement corrige (a-paraitre commandable, epuise non commandable), via @testing-library/react. Smoke necessaire pour confirmer que le bouton est bien actif/inactif visuellement apres correction. | Unitaire (rendu conditionnel apres correction) + smoke manuel (verification visuelle) |
| FLOW-RM-030 | Un titre sur_commande ou en_reimp declenche une modale de confirmation avant ajout | 🟠 | `needsConfirm` (ligne 597) et le branchement dans `handleAdd` (ligne 623) sont du code a nous. Le test unitaire rend BookCard avec un livre sur_commande, clique sur ajout, et verifie que la modale apparait dans le DOM. Smoke necessaire pour confirmer l'interaction complete (modale > choix > ajout au panier) dans le navigateur. Note : le contenu de la modale StockAlertModal est hors perimetre (LOT-16), on teste uniquement le declenchement. | Unitaire (clic > modale presente dans le DOM) + smoke manuel (interaction complete) |

---

## Recap

### Tests unitaires automatises (unit-test-writer)

- FLOW-RM-021 : `isOrderable` retourne `true` pour les 3 types (correction du test existant pour a-paraitre)
- FLOW-RM-022 : invariant sur les types dans MOCK_BOOKS
- FLOW-RM-023 : invariant sur les univers dans MOCK_BOOKS
- FLOW-RM-024 : invariant sur les statuts dans MOCK_BOOKS
- FLOW-RM-025 : aucune nouveaute avec statut sur_commande ou en_reimp dans MOCK_BOOKS
- FLOW-RM-026 : aucun a-paraitre avec propriete statut dans MOCK_BOOKS

### Couverture partielle : unitaire + smoke manuel

- FLOW-RM-027 : unitaire (bouton disabled + texte "Indisponible" dans le DOM) + smoke "verifier visuellement qu'un titre epuise/rupture affiche un bouton grise non cliquable"
- FLOW-RM-028 : unitaire (clic sur ajout > popin dans le DOM) + smoke "verifier qu'un titre a paraitre peut etre ajoute au panier via la popin de notes dans BookCard"
- FLOW-RM-029 : unitaire (bouton actif pour a-paraitre, inactif pour epuise apres correction du bug) + smoke "verifier visuellement que BookCardRow autorise l'ajout pour un a-paraitre et le bloque pour un epuise"
- FLOW-RM-030 : unitaire (clic sur ajout > modale presente dans le DOM) + smoke "verifier que la modale de confirmation s'affiche pour un titre sur_commande ou en_reimp avant ajout"

### Verification manuelle uniquement (smoke-test-writer)

Aucune regle dans ce lot ne releve exclusivement du smoke.

---

## Tests existants a corriger

- `src/lib/__tests__/bookUtils.test.ts` ligne 13 : `expect(isOrderable('a-paraitre')).toBe(false)` reflete l'ancienne regle. Doit devenir `.toBe(true)` apres correction de `isOrderable`.
- `src/pages/fonds/__tests__/fondsFilter.test.ts` : tests de filtrage existants, pas directement impactes par ce lot mais utilisent les types `StockStatut` et `Universe`.
