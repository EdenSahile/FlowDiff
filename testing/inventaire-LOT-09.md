# Inventaire LOT-09 : Commandes et historique

> Decoupage thematique cree par l'inventaire (le ticket liste les regles sans les grouper).

### Numerotation des commandes

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-065 | `generateNumero` produit un numero sequentiel au format `CMD` + 7 chiffres, et le compteur est incremente dans localStorage | 🟢 | C'est notre logique de formatage et d'incrementation, localStorage est disponible dans jsdom | Unitaire, test-first |
| FLOW-RM-066 | Le compteur demarre a 14 (les numeros CMD0000001 a CMD0000014 sont reserves aux mocks), donc le 1er appel produit CMD0000015 | 🟢 | Constante `ORDER_COUNTER_INITIAL` et valeur par defaut dans `generateNumero` : code a nous, pas de dependance externe | Unitaire, test-first |

### Attributs a la creation de commande

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-067 | `addOrder` cree une commande avec `status: 'en preparation'` | 🟢 | Affectation fixe dans notre code, dependances (AuthContext, localStorage) mockables | Unitaire, test-first |
| FLOW-RM-068 | `addOrder` pose `ediStatus = 'PENDING'` quand `transmissionMode === 'EDI'`, `undefined` sinon | 🟢 | Condition ternaire dans notre code, aucun comportement de dependance teste | Unitaire, test-first |
| FLOW-RM-072 | `addOrder` accepte 2 modes de livraison (`standard` ou `specific`) et les reporte sur la commande | 🟢 | Passage direct du parametre dans l'objet Order, code a nous | Unitaire, test-first |

### Referentiels (statuts et types)

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-070 | `ORDER_STATUSES` contient exactement 3 valeurs : en preparation, expedie, livre | 🟢 | Constante exportee, verification directe de son contenu | Unitaire, test-first |
| FLOW-RM-071 | Le type `TypeCommande` admet exactement `MONO`, `AP`, `SUITE`, et les mocks respectent ces valeurs | 🟢 | Type + donnees mock verifiables contre un tableau de valeurs attendues | Unitaire, test-first |

### Isolation et migration

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-069 | `useClientOrders` filtre les commandes par `codeClient` : seules les commandes du client demande sont retournees | 🟢 | Filtre `Array.filter` sur notre donnee, logique pure | Unitaire, test-first |
| FLOW-RM-073 | `migrateStorage` efface toutes les cles `bookflow_orders_*` et reinitialise le compteur quand `STORAGE_VERSION` change | 🟢 | Notre logique de migration, localStorage disponible dans jsdom, testable via reset de modules Vitest (`vi.resetModules`) | Unitaire, test-first |

---

## Recap

**Unitaire automatise (-> `unit-test-writer`)** :
- FLOW-RM-065 : numero sequentiel CMD + 7 chiffres, compteur incremente
- FLOW-RM-066 : compteur initial a 14, 1er numero = CMD0000015
- FLOW-RM-067 : statut initial "en preparation"
- FLOW-RM-068 : ediStatus PENDING si transmissionMode EDI
- FLOW-RM-069 : filtrage des commandes par codeClient
- FLOW-RM-070 : 3 statuts exacts (en preparation, expedie, livre)
- FLOW-RM-071 : 3 types de commande (MONO, AP, SUITE)
- FLOW-RM-072 : 2 modes de livraison (standard, specific)
- FLOW-RM-073 : migration storage efface les donnees si version change

**Couverture partielle (unitaire + smoke)** : aucune.

**Verification manuelle (-> `smoke-test-writer`)** : aucune.

## Pas de fichier de smoke pour ce lot

Aucune regle de ce lot n'est 🟠 ni 🔴, donc **il n'existe pas de `testing/smokes-LOT-09.md`, et c'est voulu**. L'absence du fichier n'est pas un oubli : un relevé qui compare le nombre d'inventaires au nombre de fichiers de smoke conclura a tort qu'il en manque.
