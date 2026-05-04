# Audit & Refonte Mobile Responsive — BookFlow

**Date :** 2026-05-04  
**Scope :** Toutes les pages (19 pages + composants layout)  
**Cible :** 360px → 1400px  
**Approche :** Hybrid — système de breakpoints unifié + refonte progressive

---

## Contexte

L'app BookFlow n'a pas de système de breakpoints unifié. Les pages utilisent des valeurs hardcodées disparates (`480px`, `700px`, `900px`, `1024px`) et une approche incohérente (`min-width` vs `max-width`). 4 pages sont entièrement cassées sur mobile (0 media queries layout), 11 sont partielles.

**Critères de succès :**
- Aucun scroll horizontal sur aucun écran (360px → 1400px)
- Touch targets ≥ 44px sur tous les éléments interactifs
- Taille de police ≥ 16px sur le contenu principal
- Layouts adaptatifs (colonnes → lignes selon l'espace disponible)

---

## Système de Breakpoints Unifié

### Nouveau fichier `src/lib/responsive.ts`

```typescript
export const breakpoints = {
  xs: 360,      // Petits téléphones (iPhone SE)
  sm: 480,      // Téléphones standards (iPhone 13+)
  md: 768,      // Tablettes (iPad) — aligne avec theme.breakpoints.mobile existant
  lg: 1024,     // Petit desktop
  xl: 1400,     // Desktop standard
}

export const mediaQueries = {
  xs: `@media (min-width: 360px)`,
  sm: `@media (min-width: 480px)`,
  md: `@media (min-width: 768px)`,
  lg: `@media (min-width: 1024px)`,
  xl: `@media (min-width: 1400px)`,
  below: {
    sm: `@media (max-width: 479px)`,
    md: `@media (max-width: 767px)`,
    lg: `@media (max-width: 1023px)`,
  },
}
```

### Mise à jour `src/lib/theme.ts`

Ajouter les nouveaux breakpoints dans le theme existant (le breakpoint `mobile: '768px'` reste comme source de vérité pour `md`, pour la rétrocompatibilité) :

```typescript
breakpoints: {
  mobile: '768px',  // rétrocompatibilité
  xs: '360px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1400px',
},
```

### Pattern grid réutilisable

Toutes les grilles de cards suivent ce pattern standard :

```typescript
// 1 col → 2 col → 3 col → 4 col
const BookGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};

  ${mediaQueries.sm} { grid-template-columns: repeat(2, 1fr); }
  ${mediaQueries.md} { grid-template-columns: repeat(3, 1fr); }
  ${mediaQueries.lg} { grid-template-columns: repeat(4, 1fr); }
`
```

---

## Audit — État des pages

### Pages cassées (priorité max)

| Page | Problèmes |
|------|-----------|
| **RecherchePage** | 0 media queries, grid `minmax(220px, 1fr)` sans adaptation, filtres overflow |
| **MonComptePage** | 0 media queries layout, formulaire déborde, seul `prefers-reduced-motion` présent |
| **FacturationPage** | 0 media queries layout, tableau overflow horizontal, touch targets < 44px |
| **ParametresPage** | 0 media queries layout, toggles non adaptés, sections juxtaposées sans flex-wrap |

### Pages partielles (Vague 1 — core)

| Page | Problèmes | Ce qui fonctionne |
|------|-----------|-------------------|
| **FondsPage** | Valeurs hardcodées 480px/1024px à aligner | Grid 3 breakpoints bien défini |
| **NouveautesPage** | Grid démarre à 2 col — trop serré à 360px, sous-onglets sans flex-wrap | Grid 768px+ auto-fill OK |
| **CartPage** | `grid-template-columns: 130px 1fr` figé, récap HT à largeur fixe | Layout sidebar → 1 col OK |
| **HistoriquePage** | `repeat(3, 1fr)` figé sans media query | — |
| **RecherchePage** | *(voir cassées)* | — |

### Pages partielles (Vague 2 — secondaires)

| Page | Problèmes |
|------|-----------|
| **SelectionsPage** | Grid couvertures 2 col fixe, cartes débordent à 360px |
| **EDIPage** | Zone upload non adaptée, tableau sans scroll horizontal |
| **FlashInfosPage** | Quelques flex-direction à finaliser |
| **HomePage (Dashboard)** | Breakpoints 700px/900px incohérents, KPI grid 5 col → 2 col à 700px seulement |
| **Auth (Login/Register/Forgot)** | Formulaires max-width fixe potentiellement non centrés |

### Pages correctes (aligner sur le nouveau système)

| Page | État |
|------|------|
| **OfficesPage** | 11 media queries — meilleure couverture, à aligner sur nomenclature |
| **Header** | Mobile-first dark/blanc OK — vérifier NotificationBell mobile |
| **ContactPage / RdvPage** | Layout simple, peu de risque |

---

## Plan d'exécution

### Étape 0 — Fondations (½ journée)

1. Créer `src/lib/responsive.ts` avec breakpoints constants + helpers `mediaQueries`
2. Mettre à jour `src/lib/theme.ts` avec les nouveaux breakpoints nommés
3. Créer un composant utilitaire `ResponsiveGrid` (grid standard 1→2→3→4 col)

### Vague 1 — Core pages (2 jours)

Pages critiques du flux principal (commande/browsing) :

1. **FondsPage** — aligner les 3 breakpoints sur `responsive.ts`
2. **NouveautesPage** — démarrer à 1 col (360px), 2 col (480px+), sous-onglets flex-wrap
3. **CartPage** — book item grid (130px 1fr) → flex responsive, récap adaptatif
4. **HistoriquePage** — grid 3 col → 1/2/3 selon breakpoints
5. **RecherchePage** — responsive complet (0 → full)

### Vague 2 — Pages secondaires (1,5 jour)

6. **MonComptePage** — formulaire responsive + touch targets ≥ 44px
7. **FacturationPage** — tableau → layout card sur mobile
8. **ParametresPage** — toggles + sections flex-wrap
9. **SelectionsPage** — grille couvertures responsive
10. **EDIPage** — zone upload + tableau scroll horizontal
11. **HomePage (Dashboard)** — unifier breakpoints 700px/900px sur `responsive.ts`

### Vague 3 — Polish + vérification (½ journée)

12. **FlashInfosPage** — finaliser issues restantes
13. **Auth pages** — vérifier formulaires en conditions réelles
14. **OfficesPage** — aligner nomenclature sur le nouveau système
15. Vérification globale : touch targets ≥ 44px, font ≥ 16px, 0 scroll horizontal

---

## Règles de mise en œuvre

- **Mobile-first** : toujours écrire le style de base pour 360px, puis surcharger avec `min-width`
- **Jamais de valeurs hardcodées** : toujours passer par `mediaQueries.*` de `responsive.ts`
- **Touch targets** : tout élément interactif (bouton, lien, toggle) → `min-height: 44px; min-width: 44px`
- **Font minimum** : `font-size` jamais < 16px pour le contenu principal (labels, descriptions)
- **Overflow** : tout conteneur potentiellement large → `overflow-x: hidden` ou `overflow-x: auto` avec scroll visible
- **Grilles de books** : utiliser systématiquement le pattern 1→2→3→4 col via `ResponsiveGrid`
