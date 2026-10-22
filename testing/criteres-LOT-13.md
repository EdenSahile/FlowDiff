# Critères d'acceptation LOT-13 — Wishlist

Sources : CLAUDE.md (« créer des listes de titres », isolation par `codeClient`, persistance localStorage, validation Zod) + PDF design (« Création de listes ♡ », « Possibilité d'ajouter un titre à une liste ♡ »).

Critères rédigés **sans lire le code de production**.

---

## CA-01 — Listes multiples nommées (FLOW-RM-099)

Un libraire peut créer plusieurs listes distinctes, chacune avec un nom.
Les listes sont propres à son `codeClient` : un autre libraire ne voit pas les siennes.
Les listes persistent après déconnexion et reconnexion (localStorage).

## CA-02 — Pas de doublons dans une même liste (FLOW-RM-100)

Si un livre est déjà présent dans une liste, l'ajouter à nouveau ne crée pas de doublon.
Le même livre peut exister dans 2 listes différentes.

## CA-03 — Validation des données stockées (FLOW-RM-101)

Au chargement, les données de wishlists lues depuis le localStorage sont validées (Zod).
Si les données sont invalides ou corrompues, l'app ne plante pas : elle repart sur un état vide.

## CA-04 — Contraintes sur le nom de liste (FLOW-RM-102)

Le nom d'une liste doit contenir entre 1 et 50 caractères.
Un nom composé uniquement d'espaces est refusé (trim avant validation).
Un nom vide est refusé.
