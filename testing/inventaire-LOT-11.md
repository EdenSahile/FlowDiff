# Inventaire LOT-11 : EDI (echanges Dilicom)

> 8 regles, un seul tableau (pas de sous-groupes dans le lot).

### Regles EDI

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-084 | Commande EDI genere auto ORDRSP apres 3s et DESADV apres 8s | :red_circle: | La logique vit dans un `useEffect` de `EDIProvider` (`EDIContext.tsx:87-160`), avec 2 `setTimeout` et des appels a `setMessages`. Rien n'est exporte ni accessible en dehors du composant. Tester exigerait de monter `EDIProvider` avec ses 2 contextes parents (`AuthContext`, `OrdersContext`) et de piloter des timers React, ce qui depasse le perimetre unitaire | Manuel (smoke) |
| FLOW-RM-085 | Donnees EDI isolees par `codeClient` | :red_circle: | L'isolation repose sur les cles localStorage suffixees par `codeClient` (`messagesKey`, `paramsKey`, `versionKey`, lignes 27-29), mais ces fonctions ne sont **pas exportees**. Le mecanisme complet passe par `loadMessages`/`loadParams` (egalement non exportes) puis par le state du provider. Verifier l'isolation exige de monter le provider avec 2 utilisateurs distincts et d'inspecter localStorage | Manuel (smoke) |
| FLOW-RM-086 | `groupDESADVByOrder` : statut `EN_COURS` si qte livree < commandee, `SOLDE` sinon | :green_circle: | Fonction exportee (`ediUtils.ts:112`), logique pure. Prend un tableau de `EDIMessage[]`, renvoie `{ grouped, ungrouped }`. Le calcul du statut par ligne (`qtyShippedTotal >= qtyConfirmed`) et le `globalStatus` agrege sont du code a nous, sans dependance externe | Unitaire, test-first |
| FLOW-RM-087 | `filterEDIMessages` filtre par type ou `ALL` | :green_circle: | Fonction exportee (`ediUtils.ts:207`), filtre trivial. 3 tests existants couvrent deja la regle (`ediUtils.test.ts:22-34`) | Unitaire, test-first. Tests existants a verifier contre la spec |
| FLOW-RM-088 | `getFluxCounts` : `orders` = ORDERS+PENDING, `expeditions` = tous DESADV, `factures` = INVOIC+PENDING, `errors` = tout ERROR | :green_circle: | Fonction exportee (`ediUtils.ts:212`), aggregation pure sur un tableau. 4 tests existants couvrent deja les 4 compteurs (`ediUtils.test.ts:36-49`) | Unitaire, test-first. Tests existants a verifier contre la spec |
| FLOW-RM-089 | `messageContainsISBN` : recherche partielle (prefixe), chaine vide = pas de filtre, INVOIC inclus dans la recherche | :green_circle: | Fonction exportee (`ediUtils.ts:184`), logique pure par branche de type. 8 tests existants (`ediUtils.test.ts:88-142`). Le code cherche dans `orderIds` et `lines[].ean` d'un INVOIC (decision confirmee : on doit pouvoir chercher par ISBN sur les INVOIC). Le test existant passe un INVOIC sans `lines`, il faut ajouter un cas avec des lignes | Unitaire, test-first |
| FLOW-RM-090 | EDIFACT ORDERS : split titres longs en chunks de 35 chars dans `IMD+L+050` | :green_circle: | `titleToImd050` n'est pas exportee, mais testable via `generateEdifactPlaceholder` (exportee, `ediUtils.ts:509`). Logique pure de decoupage de chaine. 1 test existant couvre le cas 36 chars (`ediUtils.test.ts:277-291`) | Unitaire, test-first. Passer par `generateEdifactPlaceholder` |
| FLOW-RM-091 | EDIFACT ORDERS : IMD auteur avec inversion nom/prenom (009/010/011) | :green_circle: | `parseAuthorImd` n'est pas exportee, mais testable via `generateEdifactPlaceholder`. Logique pure de formatage. 1 test existant couvre « Kamel Daoud » → « Daoud, Kamel. » (`ediUtils.test.ts:245-265`) | Unitaire, test-first. Passer par `generateEdifactPlaceholder` |

---

## Ce que couvrent deja les tests existants

`src/pages/edi/__tests__/ediUtils.test.ts`, 31 tests repartis en 6 `describe`. Ce qui touche les 8 regles du lot :

| Test(s) existant(s) | Regle visee | Verdict |
|---|---|---|
| `filterEDIMessages` (3 tests) | FLOW-RM-087 | Couvrent `ALL`, `ORDERS`, `DESADV`. Les types `ORDRSP` et `INVOIC` ne sont pas testes explicitement en tant que filtres |
| `getFluxCounts` (4 tests) | FLOW-RM-088 | Couvrent les 4 compteurs sur le jeu `BASE`. Attention : le jeu ne contient qu'un seul message par type pertinent (1 ORDERS PENDING, 1 DESADV, 1 INVOIC PENDING, 1 ERROR). Un test avec 0 message de chaque type manque |
| `messageContainsISBN` (8 tests) | FLOW-RM-089 | Bonne couverture : ORDERS match/miss, prefixe, ORDRSP, DESADV match/miss, INVOIC false, chaine vide. Le cas INVOIC est teste avec un payload sans `lines` ni `orderIds`, pas avec un payload complet |
| `generateEdifactPlaceholder` ORDERS split (1 test) | FLOW-RM-090 | Couvre 36 chars (1 chunk desc + 1 char cont). Les cas limites manquent : exactement 35, 70, 71, titre vide |
| `generateEdifactPlaceholder` ORDERS IMD auteur (1 test) | FLOW-RM-091 | Couvre « prenom nom » → « nom, prenom. ». Le cas auteur a 1 seul mot (pas de prenom) n'est pas teste |
| Aucun test | FLOW-RM-084 | Aucune couverture |
| Aucun test | FLOW-RM-085 | Aucune couverture |
| Aucun test | FLOW-RM-086 | Aucune couverture |

## Pieges a signaler a `unit-test-writer`

1. **FLOW-RM-089 (INVOIC) : regle mise a jour.** La recherche par ISBN sur les INVOIC est le comportement voulu (decision utilisateur). Le test existant passe un INVOIC sans `lines` ni `orderIds`, donc il ne couvre pas le cas positif. Ajouter un test avec un INVOIC contenant des lignes EAN.
2. **`groupDESADVByOrder` (FLOW-RM-086) exige un jeu de donnees croise.** La fonction lit les ORDRSP pour obtenir `qtyConfirmed` par ligne, puis les DESADV pour `qtyShipped`. Le jeu de test doit contenir des messages des 2 types pointant vers le meme `orderId` via le champ `payload.orderId`. Construire au minimum : (a) un cas `EN_COURS` (qtyShipped < qtyConfirmed), (b) un cas `SOLDE` (qtyShipped >= qtyConfirmed), (c) un DESADV sans `orderId` (doit atterrir dans `ungrouped`).
3. **FLOW-RM-090 et FLOW-RM-091 passent par `generateEdifactPlaceholder`.** `titleToImd050` et `parseAuthorImd` ne sont pas exportees. Tout test unitaire passe par la fonction englobante, ce qui couple le test a toute la chaine EDIFACT. Si un test echoue, la cause peut venir de n'importe quel segment. Privilegier des assertions `toContain` ciblees sur les segments IMD concernes.
4. **Caracteres speciaux EDIFACT.** `escEdifact` echappe `?`, `+`, `:`, `'` avec un `?` devant. Un titre contenant ces caracteres allonge la chaine echappee et peut decaler le point de split a 35 chars. En tenir compte dans les cas limites de FLOW-RM-090.

---

## Recap

**Unitaire automatise (→ `unit-test-writer`)** :
- FLOW-RM-086 : `groupDESADVByOrder`, statut EN_COURS vs SOLDE selon qte livree/commandee
- FLOW-RM-087 : `filterEDIMessages`, filtrage par type ou ALL
- FLOW-RM-088 : `getFluxCounts`, 4 compteurs (orders, expeditions, factures, errors)
- FLOW-RM-089 : `messageContainsISBN`, recherche partielle + chaine vide + INVOIC inclus
- FLOW-RM-090 : split titres longs en chunks de 35 chars dans IMD+L+050 (via `generateEdifactPlaceholder`)
- FLOW-RM-091 : IMD auteur avec inversion nom/prenom 009/010/011 (via `generateEdifactPlaceholder`)

Tests existants : FLOW-RM-087, 088, 089, 090, 091 ont des tests, mais avec des trous de couverture identifies ci-dessus. FLOW-RM-086 n'a aucun test.

**Couverture partielle (unitaire + smoke)** : aucune.

**Verification manuelle (→ `smoke-test-writer`)** :
- FLOW-RM-084 : passer une commande en mode EDI et verifier qu'un ORDRSP apparait apres ~3s, puis un DESADV apres ~8s dans la liste des messages EDI
- FLOW-RM-085 : se connecter avec 2 codes clients differents, passer une commande EDI sur chacun, verifier que les messages de l'un n'apparaissent pas chez l'autre
