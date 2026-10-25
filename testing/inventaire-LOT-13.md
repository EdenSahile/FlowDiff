# Inventaire LOT-13 : Wishlist

Source : `testing/criteres-LOT-13.md`

Les 4 regles forment un seul paquet (pas de decoupage dans le ticket, et <= 8 regles).

---

### Wishlist

| Regle | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| FLOW-RM-099 | Listes multiples nommees, propres au `codeClient`, persistees en localStorage | 🟢 | Toute la logique est a nous : `storageKey` genere la cle par `codeClient`, `loadLists` charge et valide, `createList` cree. localStorage est fourni par jsdom, on ne teste pas le navigateur mais notre code de lecture/ecriture. | Unitaire, test-first |
| FLOW-RM-100 | Pas de doublons de livres dans une meme liste (meme livre OK dans 2 listes differentes) | 🟢 | Logique pure dans `addToList` : comparaison `book.id` + ajout conditionnel. Aucune dependance externe. | Unitaire, test-first |
| FLOW-RM-101 | Validation Zod au chargement, fallback sur etat vide si donnees corrompues | 🟢 | Le schema (`storedWishlistsSchema`) est du Zod pur, et le fallback dans `loadLists` est une decision a nous (safeParse + retour `[]`). Tout est testable en isolation. | Unitaire, test-first |
| FLOW-RM-102 | Nom de liste : 1-50 caracteres, non vide apres trim | 🟢 | Schema Zod pur (`wishlistNameSchema`), aucune dependance. | Unitaire, test-first |

---

## Tests existants

- **FLOW-RM-099** : 4 tests dans `src/contexts/__tests__/storageKeyIsolation.test.tsx` (section `WishlistContext`) couvrent l'isolation par `codeClient`, le suffixe `guest`, et la persistance apres recreation du contexte. Il manque : creation de plusieurs listes distinctes, verification que chacune porte son nom.
- **FLOW-RM-100** : aucun test existant.
- **FLOW-RM-101** : 6 tests dans `src/lib/__tests__/storageSchemas.test.ts` (section `storedWishlistsSchema`) couvrent la forme du schema. Il manque : test du comportement de `loadLists` face a des donnees corrompues (fallback sur `[]`, pas de crash).
- **FLOW-RM-102** : 5 tests dans `src/lib/__tests__/formSchemas.test.ts` (section `wishlistNameSchema`). Couverture complete des CA-04.

---

## Recap

### Unitaire automatise (-> `unit-test-writer`)

- FLOW-RM-099 : completer les tests existants (creation de plusieurs listes, nommage)
- FLOW-RM-100 : ecrire les tests (ajout sans doublon, meme livre dans 2 listes)
- FLOW-RM-101 : ecrire le test de fallback de `loadLists` sur donnees corrompues
- FLOW-RM-102 : deja couvert, rien a ajouter

### Couverture partielle (unitaire + smoke)

Aucune regle.

### Verification manuelle (-> `smoke-test-writer`)

Aucune regle.

## Pas de fichier de smoke pour ce lot

Aucune regle de ce lot n'est 🟠 ni 🔴, donc **il n'existe pas de `testing/smokes-LOT-13.md`, et c'est voulu**. L'absence du fichier n'est pas un oubli : un relevé qui compare le nombre d'inventaires au nombre de fichiers de smoke conclura a tort qu'il en manque.
