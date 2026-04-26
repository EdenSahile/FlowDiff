# CONTEXT.md

> Fichier vivant — réécrit par Claude en fin de session ou sur demande.  
> Contient uniquement l'état courant et les prochaines étapes.  
> Ne pas y mettre de contexte projet permanent (→ CLAUDE.md).

---

## État du build
TS clean · 109/109 tests Vitest · dernière session 2026-04-27  
Chaîne EDI ORDERS → ORDRSP → DESADV complète : mocks cohérents + types + vue groupée DESADV par commande.  
Commit pushé : `f3a7b23` — feat(edi): vue groupée DESADV par commande + chaîne complète.  
Corrections EDIFACT D:96A (A1–A10) appliquées — fichier `ediUtils.ts` à jour.

---

## Session en cours — Refonte mocks EDI : chaînes ORDERS → ORDRSP → DESADV complètes

### Objectif
Pour chaque ORDERS, avoir : **lignes réelles** (EAN + titre + qty) + ORDRSP cohérent (accepté total ou partiel) + DESADV avec quantités complètes ou partielles (calculables via `qtyConfirmed` ORDRSP vs `qtyShipped` cumulé DESADV).

### 7 chaînes cibles

| # | ORDERS | ORDRSP | DESADV | État actuel |
|---|--------|--------|--------|-------------|
| 1 | CMD-2026-0424-001 — 3 lignes, Diffuseur 2 | ACCEPTED | 1 DESADV **complet** | ORDERS sans lignes réelles · ORDRSP absent · DESADV absent |
| 2 | CMD-2026-0424-002 — 7 lignes, Diffuseur 3 | PARTIAL  | 1 DESADV **partiel** | ORDERS sans lignes réelles · ORDRSP absent · DESADV absent |
| 3 | CMD-2026-0425-001 — 5 lignes, Diffuseur 1 | PARTIAL  | 2 DESADV (partiel + solde ligne 4) | ORDERS sans lignes réelles · ORDRSP absent · DESADV absent |
| 4 | CMD-2026-0426-001 — 2 lignes, Diffuseur 4 | ACCEPTED | 1 DESADV **complet** | ORDERS sans lignes réelles · ORDRSP ✅ · DESADV absent |
| 5 | CMD-2026-0426-002 — 3 lignes, Diffuseur 1 | PARTIAL  | 1 DESADV **partiel** | ORDERS sans lignes réelles · ORDRSP ✅ · DESADV absent |
| 6 | CMD-2026-0426-003 — 2 lignes, Diffuseur 3 | REJECTED | aucun DESADV | ORDERS **absent** · ORDRSP ✅ · DESADV N/A |
| 7 | CMD-2026-0427-001 — 2 lignes, Diffuseur 4 | PARTIAL  | 3 DESADV ✅ | Chaîne complète — **ne pas toucher** |

### Catalogue ISBN utilisé

| EAN | Titre | Éditeur |
|-----|-------|---------|
| 9782070360024 | Le Voyageur des confins T.1 | Gallimard |
| 9782075017346 | Kaguya-sama T.1 | Glénat |
| 9782812919483 | Pâtisserie – L'ultime référence | La Martinière |
| 9781234567890 | L'Été des sirènes | — |
| 9781234567891 | Dragon Ball Z T.3 | Glénat |
| 9782253004226 | Le Petit Prince | Le Livre de Poche |
| 9782070541027 | L'Étranger | Gallimard |
| 9782756099736 | One Piece T.105 | Glénat |
| 9782344044285 | Chainsaw Man T.12 | Kazé |
| 9782072970962 | Astérix T.38 | Albert René |
| 9782012101227 | Tintin : Les Bijoux de la Castafiore | Casterman |
| 9782070360628 | Les Misérables T.1 | Gallimard |
| 9782221257906 | Dune | Robert Laffont |

### Détail des lignes par chaîne

**Chaîne 1 — CMD-2026-0424-001 (Diffuseur 2, ACCEPTED → COMPLET)**
- L.1 9782070360024 ×2 → confirmé 2 → expédié 2 ✓
- L.2 9782253004226 ×3 → confirmé 3 → expédié 3 ✓
- L.3 9782070541027 ×1 → confirmé 1 → expédié 1 ✓

**Chaîne 2 — CMD-2026-0424-002 (Diffuseur 3, PARTIAL → PARTIEL)**
- L.1 9782075017346 ×4 → confirmé 4 → expédié 4 ✓
- L.2 9782756099736 ×3 → confirmé 3 → expédié 3 ✓
- L.3 9782344044285 ×2 → confirmé 2 → expédié 2 ✓
- L.4 9782012101227 ×2 → confirmé 2 → expédié 2 ✓
- L.5 9782072970962 ×3 → confirmé 2 (1 backorder) → expédié 2
- L.6 9782070360628 ×1 → confirmé 1 → expédié 1 ✓
- L.7 9782221257906 ×2 → confirmé 0 (backorder total) → expédié 0
→ DESADV partiel : 14 ex. expédiés (L.7 absent + L.5 partiel)

**Chaîne 3 — CMD-2026-0425-001 (Diffuseur 1, PARTIAL → 2 DESADV)**
- L.1 9782070360024 ×3 → confirmé 3 → expédié 3 ✓ (DESADV-1)
- L.2 9782075017346 ×2 → confirmé 2 → expédié 2 ✓ (DESADV-1)
- L.3 9782812919483 ×1 → confirmé 0 (rupture) → jamais expédié
- L.4 9782344044285 ×3 → confirmé 2 (1 backorder) → expédié 2 (DESADV-1) + 1 solde (DESADV-2)
- L.5 9782756099736 ×1 → confirmé 1 → expédié 1 ✓ (DESADV-1)

**Chaîne 4 — CMD-2026-0426-001 (Diffuseur 4, ACCEPTED → COMPLET)**
- L.1 9782070360024 ×5 → confirmé 5 → expédié 5 ✓
- L.2 9782075017346 ×3 → confirmé 3 → expédié 3 ✓

**Chaîne 5 — CMD-2026-0426-002 (Diffuseur 1, PARTIAL → PARTIEL)**
- L.1 9782070360024 ×10 → confirmé 10 → expédié 10 ✓
- L.2 9782075017346 ×8 → confirmé 3 (5 backorder) → expédié 3
- L.3 9782812919483 ×4 → confirmé 0 (backorder total) → jamais expédié

**Chaîne 6 — CMD-2026-0426-003 (Diffuseur 3, REJECTED → pas de DESADV)**
- L.1 9782070360024 ×6 → refusé
- L.2 9782075017346 ×4 → refusé

---

### Étapes
- [x] **Étape 0** : CONTEXT.md mis à jour
- [ ] **Étape 1** : Mettre les lignes réelles dans tous les ORDERS (màj `edi-old-1`, `edi-old-2`, `edi-old-3`, `edi-rec-1`, `edi-rec-2`) + ajouter ORDERS pour chaîne 6 + supprimer `edi-old-4` (DESADV sans orderId devenu inutile)
- [ ] **Étape 2** : Ajouter les ORDRSP manquants (chaînes 1, 2, 3)
- [ ] **Étape 3** : Ajouter les DESADV manquants (chaînes 1, 2, 3, 4, 5)
- [ ] **Étape 4** : Vérifier build TS + tests

---

## Règles de travail en session

1. Lister les tâches avec `- [ ]` dans CONTEXT.md **avant** de commencer à coder
2. Cocher `- [x]` dès qu'une tâche est terminée (TS clean)
3. S'arrêter après chaque tâche et demander validation avant de passer à la suivante
4. Ne jamais commiter sans validation
5. Quand toutes les tâches sont ✅ et que l'utilisateur le demande : vider la section "Session en cours", mettre à jour "État du build", et laisser "Prochaines étapes" vide — prêt pour la prochaine feature
