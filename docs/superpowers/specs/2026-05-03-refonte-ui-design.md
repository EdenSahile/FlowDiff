# Spec — Refonte UI : Éditorial Luxe (Ardoise & Champagne)

**Date** : 2026-05-03  
**Statut** : Validé — prêt à implémenter

---

## Décision esthétique

Direction retenue : **Éditorial Luxe**  
Approche : **Hybride C** — design system complet → 5 pages clés refaites → touches légères sur les 17 autres

---

## Nouveau design system

### Typographie

| Rôle | Police | Source |
|------|--------|--------|
| Corps + UI | **Open Sans** | Google Fonts |
| Titres éditoriaux (couvertures, hero) | *(Open Sans bold suffit — pas de serif séparé)* | — |

Remplace : `Roboto` (actuel) → `Open Sans`

### Palette Ardoise & Champagne

Nouveaux tokens (remplacent `src/lib/theme.ts`) :

| Token | Hex | Usage |
|-------|-----|-------|
| `ardoise` | `#2D3A4A` | Fond sidebar/header, CTA primaires, texte titres |
| `ardoiseHover` | `#3D4E60` | Hover CTA |
| `ardoiseLight` | `rgba(45,58,74,0.06)` | Surfaces tintées très légères |
| `champagne` | `#D4A843` | Accent — badges, liens actifs sidebar, accents |
| `champagneBg` | `#FBF6E8` | Fond or très clair |
| `ivoire` | `#F8F5EE` | Fond général de l'app |
| `ivoire2` | `#EDE8DF` | Surface secondaire (tabs, zones alternées) |
| `ivoire3` | `#DAD4C8` | Bordures, séparateurs |
| `white` | `#FFFFFF` | Cards, inputs |
| `text` | `#2A2A28` | Texte principal |
| `text2` | `#4A4A46` | Texte secondaire |
| `text3` | `#6A6A66` | Placeholders, texte tertiaire |
| `success` | `#226241` | États positifs, disponibilité |
| `successBg` | `#E6F2EC` | Fond success |
| `error` | `#C0392B` | Erreurs, actions destructrices |
| `errorBg` | `#FDECEA` | Fond error |

### Shadows & radii

```
--shadow: 0 1px 4px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05)
--radius: 6px  (boutons, inputs, cards petites)
lg-radius: 10px (cards normales)
xl-radius: 14px (modals)
```

---

## Pages clés — refonte complète (5 pages)

Ces 5 pages sont refaites visuellement en utilisant les nouvelles classes/tokens.  
Les mockups de référence sont dans `.superpowers/brainstorm/63208-1777743595/content/`.

| Page | Fichier mockup | Composant React |
|------|---------------|-----------------|
| HomePage | `homepage-full.html` | `src/pages/HomePage.tsx` |
| LoginPage | `login.html` | `src/pages/LoginPage.tsx` |
| FondsPage | `fonds.html` | `src/pages/FondsPage.tsx` |
| FicheProduitPage | `fiche-livre.html` | `src/pages/FicheProduitPage.tsx` |
| CartPage | `panier.html` | `src/pages/CartPage.tsx` |

---

## Touches légères — 17 autres pages

Pour toutes les autres pages, uniquement :
1. Remplacer les couleurs hardcodées par les nouveaux tokens
2. Remplacer `Roboto` / `fontFamily` par `Open Sans`
3. Ajuster `background: #F4F4F0` → `#F8F5EE` (ivoire)
4. Ajuster `#232f3e` → `#2D3A4A` (ardoise)
5. Ajuster `#C9A84C` → `#D4A843` (champagne)

Pages concernées (liste indicative) :
- `NouveautesPage`, `AParaitrePage`, `TopVentesPage`, `SelectionsPage`
- `FlashInfosPage`, `ProfilePage`, `OrderHistoryPage`, `OrderDetailPage`
- `RegisterPage`, `ForgotPasswordPage`
- Composants layout : `Sidebar`, `TopNav`, `BottomNav`, `SearchBar`
- Composants partagés : `BookCard`, `FilterBar`, `Badge`, `Button`

---

## Stratégie d'implémentation

### Phase 1 — Design system
- Mettre à jour `src/lib/theme.ts` avec la nouvelle palette
- Mettre à jour l'import Google Fonts dans `index.html` (Open Sans)
- Mettre à jour les composants UI partagés (Button, Badge, Input)

### Phase 2 — 5 pages clés
Ordre : `LoginPage` → `HomePage` → `FondsPage` → `FicheProduitPage` → `CartPage`

### Phase 3 — Touches légères
Remplacement en masse des tokens sur les 17 autres pages/composants.

---

## Contraintes techniques

- Styled-components v6 — toujours utiliser `theme.colors.*`, jamais de couleurs hardcodées
- Pas de régression fonctionnelle — les tests Vitest (`computeTotals`, `isOrderable`) doivent rester verts
- Pas de changement de routing, state, ou logique métier
- WCAG AA maintenu : `text3` (`#6A6A66`) = 4.8:1 sur blanc ✓
