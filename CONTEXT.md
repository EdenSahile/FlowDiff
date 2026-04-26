# CONTEXT — Session EDI (2026-04-26)

Ce fichier résume tout le contexte de la session de conception de la page EDI.
À donner en début de prochaine session pour reprendre sans perte.

---

## Règle de travail importante

**S'arrêter après chaque tâche et demander la validation avant de passer à la suivante.**
Ne jamais enchaîner les tâches automatiquement, même si le plan est clair.
**Mettre à jour ce fichier après chaque tâche terminée.**

---

## Ce qu'on est en train de faire

Améliorer la page **`/edi`** déjà en place :
- Remplacer le statut technique (SENT/RECEIVED) dans le tableau par un **statut métier** lisible (`getBusinessStatus`)
- Refondre le modal 👁 en un **viewer split-view** JSON métier / EDIFACT terminal
- Retirer STOCK de l'ensemble du périmètre (type TS, utils, UI, mocks)

---

## Ce qui a été fait dans cette session

| Étape | Description | Statut |
|-------|-------------|--------|
| Spec brainstorming | 4 sections validées (utils, tableau, viewer, wiring) | ✅ |
| Spec écrite | `docs/superpowers/specs/2026-04-26-edi-viewer-statut-metier-design.md` | ✅ commit `6fbd06f` |
| Plan écrit | `docs/superpowers/plans/2026-04-26-edi-viewer-statut-metier.md` | ✅ |

---

## Ce qui reste à faire — Plan en 6 tâches

| Task | Contenu | Fichiers | Statut |
|------|---------|---------|--------|
| 1 | Retirer STOCK de `ediUtils.ts` + tests | `ediUtils.ts`, `ediUtils.test.ts` | ✅ commit `f0eba76` |
| 2 | Ajouter `getBusinessStatus` (TDD) | `ediUtils.ts`, `ediUtils.test.ts` | ✅ commit `24128f2` |
| 3 | Ajouter `generateEdifactPlaceholder` (TDD) | `ediUtils.ts`, `ediUtils.test.ts` | ✅ commits `c25f101` + fix `fa110ca` |
| 4 | Créer `EDIViewer.tsx` | `src/components/edi/EDIViewer.tsx` | ✅ commit `925767e` |
| 5 | Refactorer `EDIMessageModal.tsx` en wrapper | `src/components/edi/EDIMessageModal.tsx` | ✅ commit `a785913` |
| 6 | Mettre à jour `EDIPage.tsx` | `src/pages/edi/EDIPage.tsx` | ✅ commit `ae214a7` |

---

## Fichiers de référence

| Fichier | Rôle |
|---------|------|
| `docs/superpowers/specs/2026-04-26-edi-viewer-statut-metier-design.md` | Spec validée |
| `docs/superpowers/plans/2026-04-26-edi-viewer-statut-metier.md` | Plan d'implémentation (6 tâches) |
| `docs/superpowers/specs/2026-04-26-edi-design.md` | Spec originale page EDI |
| `docs/superpowers/plans/2026-04-26-edi-page.md` | Plan original page EDI (Tasks 1–7, toutes terminées) |

---

## Décisions validées en session

| Question | Décision |
|----------|----------|
| Statut dans le tableau ? | `getBusinessStatus(type)` — dérivé du TYPE, pas du status technique |
| STOCK ? | Exclu intégralement — type TS, utils, UI, onglets, mocks |
| Architecture viewer ? | Approche B — `EDIViewer.tsx` autonome, `EDIMessageModal` wrapper |
| EDIFACT brut ? | Option C — placeholder structuré par type, généré à la volée |
| Source de vérité statut | `getBusinessStatus(type)` partout — tableau ET viewer, aucune variante |
| Override couleur ERROR ? | Oui pour la couleur uniquement (`msg.status === 'ERROR'` → rouge), texte reste métier |

---

## Nouveaux types / fonctions à créer

```ts
// src/lib/ediUtils.ts

// Type STOCK retiré :
type EDIMessageType = 'ORDERS' | 'ORDRSP' | 'DESADV' | 'INVOIC'

// Nouvelle fonction — statut métier par type :
function getBusinessStatus(type: EDIMessageType): string
// ORDERS → 'Commande envoyée'
// ORDRSP → 'Réponse commande reçue'
// DESADV → 'Info expédition reçue'
// INVOIC → 'Facture reçue'

// Nouvelle fonction — EDIFACT placeholder illustratif :
function generateEdifactPlaceholder(msg: EDIMessage): string
// Génère segments UNB/UNH/BGM/DTM/UNZ selon le type
// ORDERS → BGM+220, ORDRSP → BGM+231, DESADV → BGM+351+CPS, INVOIC → BGM+380+MOA+TAX
```

---

## Architecture des fichiers EDI (état cible)

```
src/
  lib/
    ediUtils.ts              ← types + fonctions pures (modifié)
  data/
    mockEDIMessages.ts       ← 10 messages mock (inchangé — pas de STOCK dedans)
  contexts/
    EDIContext.tsx           ← context global (inchangé)
  components/edi/
    EDIViewer.tsx            ← NOUVEAU — split view JSON / EDIFACT
    EDIMessageModal.tsx      ← refactoré — wrapper Overlay + EDIViewer
  pages/edi/
    EDIPage.tsx              ← modifié — badge statut métier + col Voir + sans onglet STOCK
    __tests__/
      ediUtils.test.ts       ← modifié — sans test STOCK, + tests nouvelles fonctions
```

---

## Patterns projet à respecter

- **Styled-components v6** — tous les styles via `theme.*` (jamais de couleurs hardcodées sauf #000000/#00FF41 pour le terminal EDIFACT)
- **Design flat** — `box-shadow: none`, `border-radius: 0`
- **Toast** — `useToast().showToast(message, type?)`
- **Tests** — Vitest, fichiers dans `__tests__/` à côté des pages concernées
- **TDD** — écrire le test avant l'implémentation pour Tasks 2 et 3

---

## Historique de la page EDI (session précédente)

Tasks 1–7 de la page EDI complètes et commitées. La page `/edi` est pleinement opérationnelle (routing, sidebar, statcards, tableau, modal, paramètres, footer).
