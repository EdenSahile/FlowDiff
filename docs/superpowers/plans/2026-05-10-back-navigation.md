# Back Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une flèche `← Retour` sur toutes les pages (hors accueil et auth), qui suit l'historique de navigation réel et se masque automatiquement si aucun historique in-app n'existe.

**Architecture:** Un composant `BackButton` réutilisable lit `useLocation().key` — si `'default'`, retourne null (accès direct / refresh) ; sinon affiche une flèche qui appelle `navigate(-1)`. Il est inséré au début du `PageHeader` de chaque page. Deux pages ont déjà un bouton retour local (RecherchePage, AuteurPage) : elles sont traitées séparément.

**Tech Stack:** React 18, React Router v6, styled-components v6, Vitest + @testing-library/react

---

## Fichiers concernés

| Action | Fichier | Rôle |
|--------|---------|------|
| Créer | `src/components/ui/BackButton.tsx` | Composant réutilisable |
| Créer | `src/components/ui/__tests__/BackButton.test.tsx` | Tests unitaires |
| Modifier | `src/pages/nouveautes/NouveautesPage.tsx` | Intégration |
| Modifier | `src/pages/a-paraitre/AParaitrePage.tsx` | Intégration |
| Modifier | `src/pages/fonds/FondsPage.tsx` | Intégration |
| Modifier | `src/pages/top-ventes/TopVentesPage.tsx` | Intégration |
| Modifier | `src/pages/selections/SelectionsPage.tsx` | Intégration |
| Modifier | `src/pages/flash-infos/FlashInfosPage.tsx` | Intégration |
| Modifier | `src/pages/historique/HistoriquePage.tsx` | Intégration |
| Modifier | `src/pages/facturation/FacturationPage.tsx` | Intégration |
| Modifier | `src/pages/edi/EDIPage.tsx` | Intégration |
| Modifier | `src/pages/offices/OfficesPage.tsx` | Intégration |
| Modifier | `src/pages/compte/MonComptePage.tsx` | Intégration |
| Modifier | `src/pages/contact/ContactPage.tsx` | Intégration |
| Modifier | `src/pages/parametres/ParametresPage.tsx` | Intégration |
| Modifier | `src/pages/cart/CartPage.tsx` | Intégration (vue principale seulement) |
| Modifier | `src/pages/catalogue/FicheProduitPage.tsx` | Intégration (avant BreadcrumbNav) |
| Modifier | `src/pages/search/RecherchePage.tsx` | Remplacement BackBtn local |
| Modifier | `src/pages/auteur/AuteurPage.tsx` | Mise à jour BackBtn local |

---

## Task 1 : Créer le composant `BackButton`

**Files:**
- Create: `src/components/ui/BackButton.tsx`
- Create: `src/components/ui/__tests__/BackButton.test.tsx`

- [ ] **Étape 1 : Écrire le test qui échoue**

```tsx
// src/components/ui/__tests__/BackButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider as SCThemeProvider } from 'styled-components'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { theme } from '@/lib/theme'
import { BackButton } from '@/components/ui/BackButton'

const mockNavigate = vi.fn()
const mockUseLocation = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate, useLocation: () => mockUseLocation() }
})

function wrap(ui: React.ReactElement) {
  return render(
    <SCThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </SCThemeProvider>
  )
}

describe('BackButton', () => {
  beforeEach(() => { mockNavigate.mockClear() })

  it('renders when location key is not default', () => {
    mockUseLocation.mockReturnValue({ pathname: '/test', search: '', hash: '', state: null, key: 'abc123' })
    wrap(<BackButton />)
    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument()
  })

  it('renders nothing when location key is default', () => {
    mockUseLocation.mockReturnValue({ pathname: '/test', search: '', hash: '', state: null, key: 'default' })
    wrap(<BackButton />)
    expect(screen.queryByRole('button', { name: /retour/i })).toBeNull()
  })

  it('calls navigate(-1) on click', () => {
    mockUseLocation.mockReturnValue({ pathname: '/test', search: '', hash: '', state: null, key: 'abc123' })
    wrap(<BackButton />)
    fireEvent.click(screen.getByRole('button', { name: /retour/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
```

- [ ] **Étape 2 : Lancer le test — vérifier qu'il échoue**

```bash
npx vitest run src/components/ui/__tests__/BackButton.test.tsx
```

Résultat attendu : `FAIL — Cannot find module '@/components/ui/BackButton'`

- [ ] **Étape 3 : Implémenter le composant**

```tsx
// src/components/ui/BackButton.tsx
import { useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { IconChevronLeft } from '@/components/ui/icons'

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.navy};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
  opacity: 0.65;
  transition: opacity 0.15s, color 0.15s;
  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.accent};
  }
`

export function BackButton() {
  const navigate = useNavigate()
  const { key } = useLocation()
  if (key === 'default') return null
  return (
    <Btn type="button" aria-label="Retour à la page précédente" onClick={() => navigate(-1)}>
      <IconChevronLeft size={14} />
      Retour
    </Btn>
  )
}
```

- [ ] **Étape 4 : Lancer les tests — vérifier qu'ils passent**

```bash
npx vitest run src/components/ui/__tests__/BackButton.test.tsx
```

Résultat attendu : `3 tests passed`

- [ ] **Étape 5 : Vérifier que la suite globale est propre**

```bash
npx vitest run
```

Résultat attendu : tous les tests passent (≥162).

- [ ] **Étape 6 : Commit**

```bash
git add src/components/ui/BackButton.tsx src/components/ui/__tests__/BackButton.test.tsx
git commit -m "feat(ui): composant BackButton — navigate(-1), masqué si key=default"
```

---

## Task 2 : Intégrer dans NouveautesPage, AParaitrePage, FondsPage

**Files:**
- Modify: `src/pages/nouveautes/NouveautesPage.tsx`
- Modify: `src/pages/a-paraitre/AParaitrePage.tsx`
- Modify: `src/pages/fonds/FondsPage.tsx`

Pattern commun : ajouter `import { BackButton } from '@/components/ui/BackButton'` en tête de fichier, puis `<BackButton />` comme **premier enfant** de `<PageHeader>`.

- [ ] **NouveautesPage** — ajouter l'import en haut du fichier :

```tsx
import { BackButton } from '@/components/ui/BackButton'
```

Puis modifier le `<PageHeader>` (actuellement ~ligne 226) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>Nouveautés</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>Nouveautés</PageTitle>
```

- [ ] **AParaitrePage** — même pattern (~ligne 192) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>À paraître</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>À paraître</PageTitle>
```

- [ ] **FondsPage** — même pattern (~ligne 255) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>Fonds</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>Fonds</PageTitle>
```

- [ ] **Vérification TS** :

```bash
npx tsc --noEmit
```

Résultat attendu : 0 erreurs.

- [ ] **Vérification visuelle** : démarrer le serveur (`npm run dev`), naviguer de l'accueil vers Nouveautés, AParaitre, Fonds → la flèche `← Retour` doit apparaître en haut. Accès direct par URL → flèche absente.

- [ ] **Commit** :

```bash
git add src/pages/nouveautes/NouveautesPage.tsx src/pages/a-paraitre/AParaitrePage.tsx src/pages/fonds/FondsPage.tsx
git commit -m "feat(nav): BackButton dans NouveautesPage, AParaitrePage, FondsPage"
```

---

## Task 3 : Intégrer dans TopVentesPage, SelectionsPage, FlashInfosPage

**Files:**
- Modify: `src/pages/top-ventes/TopVentesPage.tsx`
- Modify: `src/pages/selections/SelectionsPage.tsx`
- Modify: `src/pages/flash-infos/FlashInfosPage.tsx`

- [ ] **TopVentesPage** — ajouter l'import, puis modifier (~ligne 600). TopVentesPage a un `<PageHeaderText>` wrapper interne ; insérer `<BackButton />` avant ce wrapper :

```tsx
// Avant
<PageHeader>
  <PageHeaderText>
    <PageEyebrow>Catalogue</PageEyebrow>

// Après
<PageHeader>
  <BackButton />
  <PageHeaderText>
    <PageEyebrow>Catalogue</PageEyebrow>
```

- [ ] **SelectionsPage** — même pattern simple (~ligne 1530) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>Sélections</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Catalogue</PageEyebrow>
  <PageTitle>Sélections</PageTitle>
```

- [ ] **FlashInfosPage** — même pattern (~ligne 500) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Informations</PageEyebrow>
  <PageTitle>Flash Infos</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Informations</PageEyebrow>
  <PageTitle>Flash Infos</PageTitle>
```

- [ ] **Vérification TS** : `npx tsc --noEmit` → 0 erreurs.

- [ ] **Commit** :

```bash
git add src/pages/top-ventes/TopVentesPage.tsx src/pages/selections/SelectionsPage.tsx src/pages/flash-infos/FlashInfosPage.tsx
git commit -m "feat(nav): BackButton dans TopVentesPage, SelectionsPage, FlashInfosPage"
```

---

## Task 4 : Intégrer dans HistoriquePage, FacturationPage, MonComptePage, ParametresPage

**Files:**
- Modify: `src/pages/historique/HistoriquePage.tsx`
- Modify: `src/pages/facturation/FacturationPage.tsx`
- Modify: `src/pages/compte/MonComptePage.tsx`
- Modify: `src/pages/parametres/ParametresPage.tsx`

- [ ] **HistoriquePage** (~ligne 701) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Mon historique</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Mon historique</PageTitle>
```

- [ ] **FacturationPage** (~ligne 976) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Facturation</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Facturation</PageTitle>
```

- [ ] **MonComptePage** (~ligne 194) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Mon compte</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Mon compte</PageTitle>
```

- [ ] **ParametresPage** (~ligne 333) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Paramètres</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Mon espace</PageEyebrow>
  <PageTitle>Paramètres</PageTitle>
```

- [ ] **Vérification TS** : `npx tsc --noEmit` → 0 erreurs.

- [ ] **Commit** :

```bash
git add src/pages/historique/HistoriquePage.tsx src/pages/facturation/FacturationPage.tsx src/pages/compte/MonComptePage.tsx src/pages/parametres/ParametresPage.tsx
git commit -m "feat(nav): BackButton dans Historique, Facturation, MonCompte, Parametres"
```

---

## Task 5 : Intégrer dans EDIPage, OfficesPage, ContactPage

**Files:**
- Modify: `src/pages/edi/EDIPage.tsx`
- Modify: `src/pages/offices/OfficesPage.tsx`
- Modify: `src/pages/contact/ContactPage.tsx`

- [ ] **EDIPage** (~ligne 820) — insérer avant `<TitleBlock>` :

```tsx
// Avant
<PageHeader>
  <TitleBlock>
    <PageEyebrow>Outils</PageEyebrow>

// Après
<PageHeader>
  <BackButton />
  <TitleBlock>
    <PageEyebrow>Outils</PageEyebrow>
```

- [ ] **OfficesPage** (~ligne 920) — insérer avant `<HeaderLeft>` :

```tsx
// Avant
<PageHeader>
  <HeaderLeft>
    <div>
      <PageEyebrow>Outils</PageEyebrow>

// Après
<PageHeader>
  <BackButton />
  <HeaderLeft>
    <div>
      <PageEyebrow>Outils</PageEyebrow>
```

- [ ] **ContactPage** (~ligne 248) :

```tsx
// Avant
<PageHeader>
  <PageEyebrow>Informations</PageEyebrow>
  <PageTitle>Contact</PageTitle>

// Après
<PageHeader>
  <BackButton />
  <PageEyebrow>Informations</PageEyebrow>
  <PageTitle>Contact</PageTitle>
```

- [ ] **Vérification TS** : `npx tsc --noEmit` → 0 erreurs.

- [ ] **Commit** :

```bash
git add src/pages/edi/EDIPage.tsx src/pages/offices/OfficesPage.tsx src/pages/contact/ContactPage.tsx
git commit -m "feat(nav): BackButton dans EDIPage, OfficesPage, ContactPage"
```

---

## Task 6 : Intégrer dans CartPage (vue principale)

**Files:**
- Modify: `src/pages/cart/CartPage.tsx`

CartPage a une structure multi-étapes (cart → recap → livraison → transmission → success). On intègre `<BackButton />` **uniquement sur la vue principale** (panier avec articles), avant le `<PageHeader>` qui contient "Panier" (~ligne 1498).

- [ ] **Ajouter l'import** en tête de fichier :

```tsx
import { BackButton } from '@/components/ui/BackButton'
```

- [ ] **Insérer `<BackButton />`** avant le `<PageHeader>` de la vue principale (~ligne 1498) :

```tsx
// Avant
      <PageHeader>
        <PageTitle style={{ marginBottom: 0 }}>Panier</PageTitle>
        <ClearCartBtn

// Après
      <BackButton />
      <PageHeader>
        <PageTitle style={{ marginBottom: 0 }}>Panier</PageTitle>
        <ClearCartBtn
```

Note : ne pas ajouter de BackButton aux étapes `recap`, `livraison`, `transmission`, ni à la vue `success` — l'utilisateur est dans un tunnel de commande, le retour arrière y serait confusant.

- [ ] **Vérification TS** : `npx tsc --noEmit` → 0 erreurs.

- [ ] **Vérification visuelle** : aller sur le panier depuis l'accueil → BackButton visible. Progresser dans le tunnel de commande → pas de BackButton dans les étapes suivantes.

- [ ] **Commit** :

```bash
git add src/pages/cart/CartPage.tsx
git commit -m "feat(nav): BackButton dans CartPage (vue principale uniquement)"
```

---

## Task 7 : Intégrer dans FicheProduitPage (avant BreadcrumbNav)

**Files:**
- Modify: `src/pages/catalogue/FicheProduitPage.tsx`

FicheProduitPage a déjà un `<BreadcrumbNav>` (Accueil > Fonds > Univers > Titre). Le `<BackButton />` s'insère juste **avant** ce breadcrumb, non pas dedans.

- [ ] **Ajouter l'import** :

```tsx
import { BackButton } from '@/components/ui/BackButton'
```

- [ ] **Insérer `<BackButton />`** avant `<BreadcrumbNav>` (~ligne 1448) :

```tsx
// Avant
    <Page>
      <BreadcrumbNav aria-label="Fil d'Ariane">

// Après
    <Page>
      <BackButton />
      <BreadcrumbNav aria-label="Fil d'Ariane">
```

- [ ] **Vérification TS** : `npx tsc --noEmit` → 0 erreurs.

- [ ] **Vérification visuelle** : accéder à une fiche depuis Fonds → `← Retour` apparaît au-dessus du breadcrumb. Clic → retour sur la liste Fonds. Accès direct par URL → pas de BackButton.

- [ ] **Commit** :

```bash
git add src/pages/catalogue/FicheProduitPage.tsx
git commit -m "feat(nav): BackButton dans FicheProduitPage (avant BreadcrumbNav)"
```

---

## Task 8 : Mettre à jour RecherchePage (remplace BackBtn local)

**Files:**
- Modify: `src/pages/search/RecherchePage.tsx`

RecherchePage a son propre `BackBtn` styled-component (fond transparent, navy, ~ligne 128). Il est utilisé à 3 endroits (~lignes 511, 524, 537). Remplacer par `<BackButton />` et supprimer le styled-component local.

- [ ] **Ajouter l'import** du composant global :

```tsx
import { BackButton } from '@/components/ui/BackButton'
```

- [ ] **Supprimer** le styled-component local `BackBtn` (de la définition ~ligne 128 jusqu'à la fermeture du template literal, ~ligne 145).

- [ ] **Remplacer les 3 usages** de `<BackBtn onClick={() => navigate(-1)}>← Retour</BackBtn>` par `<BackButton />` (~lignes 511, 524, 537).

- [ ] **Supprimer** l'import de `useNavigate` s'il n'est plus utilisé pour d'autres choses dans le fichier (vérifier d'abord).

- [ ] **Vérification TS** : `npx tsc --noEmit` → 0 erreurs.

- [ ] **Commit** :

```bash
git add src/pages/search/RecherchePage.tsx
git commit -m "feat(nav): RecherchePage — remplace BackBtn local par BackButton"
```

---

## Task 9 : Mettre à jour AuteurPage (BackBtn sur fond sombre)

**Files:**
- Modify: `src/pages/auteur/AuteurPage.tsx`

AuteurPage a un `BackBtn` local (style pilule blanc sur Hero navy, ~ligne 30) qui appelle déjà `navigate(-1)`. Il faut **conserver ce style** (fond sombre = texte blanc) mais ajouter la détection de l'historique (`useLocation().key`).

- [ ] **Ajouter l'import** de `useLocation` si absent :

```tsx
import { useNavigate, useLocation } from 'react-router-dom'
```

- [ ] **Ajouter la détection dans le composant** — dans le corps du composant `AuteurPage`, après les autres hooks existants :

```tsx
const { key: locationKey } = useLocation()
```

- [ ] **Conditionner l'affichage** du `<BackBtn>` (~ligne 214) :

```tsx
// Avant
<BackBtn onClick={() => navigate(-1)}>← Retour</BackBtn>

// Après
{locationKey !== 'default' && (
  <BackBtn onClick={() => navigate(-1)}>← Retour</BackBtn>
)}
```

- [ ] **Vérification TS** : `npx tsc --noEmit` → 0 erreurs.

- [ ] **Vérification visuelle** : accéder à une page auteur depuis une fiche → `← Retour` visible (pill blanc). Accès direct `/auteur/xxx` → bouton absent.

- [ ] **Commit** :

```bash
git add src/pages/auteur/AuteurPage.tsx
git commit -m "feat(nav): AuteurPage — BackBtn conditionné sur locationKey"
```

---

## Task 10 : Vérification finale

- [ ] **Suite de tests complète** :

```bash
npx vitest run
```

Résultat attendu : tous les tests passent (≥165 avec les 3 nouveaux).

- [ ] **Build de production** :

```bash
npm run build
```

Résultat attendu : 0 erreurs, 0 warnings TypeScript.

- [ ] **Mise à jour CONTEXT.md** — cocher toutes les tâches dans la section "Session en cours — Navigation retour (BackButton)".
