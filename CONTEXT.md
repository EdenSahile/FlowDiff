# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 117/117 tests Vitest · dernière session 2026-04-27  
Fix mock DESADV : suppression de DESADV-2026-0507-001 (2 ex. sur ISBN 9781234567891 non confirmés dans l'ORDRSP — basé sur backorderQty au lieu de qtyConfirmed).  
Pour CMD-2026-0427-001 : 2 DESADV cohérents, les deux ISBN soldés exactement à hauteur de qtyConfirmed.

---

## Session en cours

Aucune tâche en cours.

---

## Prochaines étapes

Aucune tâche à venir.

---

## Règles de travail en session

1. Lister les tâches avec `- [ ]` dans CONTEXT.md **avant** de commencer à coder
2. Cocher `- [x]` dès qu'une tâche est terminée (TS clean)
3. S'arrêter après chaque tâche et demander validation avant de passer à la suivante
4. Ne jamais commiter sans validation
5. Quand toutes les tâches sont ✅ et que l'utilisateur le demande : vider la section "Session en cours", mettre à jour "État du build", et laisser "Prochaines étapes" vide — prêt pour la prochaine feature
