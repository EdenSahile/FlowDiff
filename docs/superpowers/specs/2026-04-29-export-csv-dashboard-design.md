# Design — Export CSV du Tableau de bord

**Date :** 2026-04-29  
**Scope :** Section "Tableau de bord" (KPIs) de la HomePage  
**Stack :** Vite 5 + React 18 + TypeScript strict + Styled-components v6

---

## Contexte

La section "Tableau de bord" affiche 7 KPIs calculés dynamiquement sur une période sélectionnable. L'utilisateur doit pouvoir exporter ces données au format CSV pour les réutiliser dans Excel ou Numbers.

---

## Ce qu'on construit

Un bouton **"Exporter CSV"** dans le `BilanHeader` (même rangée que "Personnaliser") qui génère et télécharge un fichier CSV à deux sections : résumé KPIs + détail des commandes de la période.

---

## Architecture

### Nouveau fichier : `src/lib/exportCSV.ts`

Fonction pure, sans état, sans dépendance externe.

```ts
exportDashboardCSV(
  kpi: PeriodKPI,
  orders: DashboardOrder[],   // déjà filtrés par période
  period: { start: Date; end: Date },
  preset: string,
): void
```

- Génère une chaîne CSV en mémoire
- Déclenche le téléchargement via `Blob` + `URL.createObjectURL` + clic programmatique
- Nettoie l'URL object après usage (`URL.revokeObjectURL`)

### Structure du fichier CSV généré

```
=== Résumé KPIs ===
Période;Du;Au;Commandes passées;Montant total TTC (€);Exemplaires commandés;Panier moyen (€);Délai moyen (j);Taux de rupture (%);Références distinctes
Ce mois-ci;2026-04-01;2026-04-29;45;12345,67;523;274,35;2,3;6,2;187

=== Détail des commandes ===
Date;Éditeur;Univers;Montant TTC (€);Nb exemplaires;Statut
2024-01-02;Gallimard;Littérature;234,50;12;Livrée
2024-01-03;Pika Édition;BD/Mangas;189,30;8;Annulée
```

**Conventions :**
- Séparateur `;` (standard français Excel/Numbers)
- Décimales avec virgule (`,`)
- Statut : `Livrée` ou `Annulée`
- Nom du fichier : `bookflow-dashboard-YYYY-MM-DD.csv` (date du jour)
- Encodage : UTF-8 avec BOM (`﻿`) pour compatibilité Excel

### Modification : `src/pages/home/HomePage.tsx`

- Nouveau bouton `ExportBtn` dans `DashboardControls`, à gauche de `CustomizeBtn`
- Style identique à `CustomizeBtn` (border, padding, font)
- Icône SVG "téléchargement" inline (cohérent avec les autres icônes du fichier)
- `onClick` → appel direct à `exportDashboardCSV(kpi, periodFilter.orders, periodFilter.period, periodFilter.preset)`

---

## Données exportées

### Section 1 — Résumé KPIs (1 ligne de données)

| Colonne | Source |
|---------|--------|
| Période | `preset` (ex: "Ce mois-ci") |
| Du | `period.start` formaté YYYY-MM-DD |
| Au | `period.end` formaté YYYY-MM-DD |
| Commandes passées | `kpi.nbCommandes` |
| Montant total TTC (€) | `kpi.montantTotal` |
| Exemplaires commandés | `kpi.nbExemplaires` |
| Panier moyen (€) | `kpi.panierMoyen` |
| Délai moyen (j) | `kpi.delaiMoyen` |
| Taux de rupture (%) | `kpi.tauxRupture * 100` |
| Références distinctes | `kpi.nbReferences` |

### Section 2 — Détail commandes (1 ligne par commande)

| Colonne | Source |
|---------|--------|
| Date | `order.date` |
| Éditeur | `order.publisher` |
| Univers | `order.universe` |
| Montant TTC (€) | `order.montantTTC` |
| Nb exemplaires | `order.nbExemplaires` |
| Statut | `order.cancelled ? 'Annulée' : 'Livrée'` |

---

## Gestion des cas limites

- **Aucune commande sur la période** : section résumé exportée avec zéros, section détail avec uniquement l'en-tête (pas de lignes de données)
- **Valeurs décimales** : toujours formatées avec virgule (`12345.67` → `12345,67`)
- **Caractères spéciaux dans les noms** : les cellules contenant `;` ou `"` sont encadrées de guillemets doubles

---

## Ce qu'on ne fait PAS

- Pas d'export XLSX (pas de dépendance supplémentaire)
- Pas d'export de la période de comparaison (hors scope)
- Pas de prévisualisation avant téléchargement

---

## Fichiers touchés

| Fichier | Action |
|---------|--------|
| `src/lib/exportCSV.ts` | Créer |
| `src/pages/home/HomePage.tsx` | Modifier (bouton + import) |
