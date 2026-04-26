# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 109/109 tests Vitest · dernière session 2026-04-26

---

## Session en cours — 2026-04-26

### Refonte HomePage (commit `d3a3a45`)
- [x] Étape 1 — Greeting row
- [x] Étape 2 — Bloc "Actions en attente"
- [x] Étape 3 — Bilan du mois précédent
- [x] Étape 4 — Évolution des commandes
- [x] Étape 5 — Répartition des achats
- [x] Étape 6 — Top éditeurs
- [x] Étape 7 — Suivi des flux EDI
- [x] Étape 8 — Nouveautés du mois (4 titres)
- [x] Étape 9 — Raccourcis
- [x] Étape 10 — Footer dynamique

### Corrections post-refonte (commit `35627dc`)
- [x] Étape 8 : limiter à 4 nouveautés au lieu de 8
- [x] Carte "Actions en attente" — panier : libellé "Ouvrage(s) dans le panier", compteur dynamique via `useCart().totalItems`, singulier/pluriel, clic → `/panier`
- [x] Carte "Actions en attente" — libellé 2 : "commandes à vérifier"
- [x] Carte "Actions en attente" — libellé 3 : "erreur EDI à corriger"
- [x] Carte "Actions en attente" — libellé 4 : "expéditions en retard"

---

## Prochaines étapes

Aucune tâche planifiée.

---

## Règles de travail en session

1. Lister les tâches avec `- [ ]` dans CONTEXT.md **avant** de commencer à coder
2. Cocher `- [x]` dès qu'une tâche est terminée (TS clean)
3. S'arrêter après chaque tâche et demander validation avant de passer à la suivante
4. Ne jamais commiter sans validation
5. Quand tout est fait et que l'utilisateur le demande : réécrire ce fichier pour la prochaine demande
