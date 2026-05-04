# Refonte UI — Éditorial Luxe (Ardoise & Champagne) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Ardoise & Champagne palette + Open Sans typography across the entire app, with full visual overhaul on 5 key pages and light token-swap on all remaining pages/components.

**Architecture:** Three-phase cascade: (1) update `theme.ts` so all styled-components using `theme.colors.*` auto-update; (2) fix hardcoded hex values that won't cascade, and do the LoginPage structural rework; (3) light cleanup pass. The LoginPage is the only page needing a structural change (split-panel layout); the other 4 key pages benefit from the theme cascade plus targeted hardcode fixes.

**Tech Stack:** Styled-components v6, React 18, Vite, TypeScript strict, Google Fonts (Open Sans)

---

### Task 1: Design system foundation — `theme.ts` + fonts

**Files:**
- Modify: `src/lib/theme.ts`
- Modify: `index.html`
- Modify: `src/index.css`

- [ ] **Step 1: Verify baseline — TS clean + tests pass**

```bash
npm run typecheck && npm test -- --run
```
Expected: no TS errors, 161 tests pass.

- [ ] **Step 2: Rewrite `src/lib/theme.ts` with Ardoise & Champagne tokens**

Replace the full file content:

```ts
export const theme = {
  colors: {
    /* ── Palette Ardoise & Champagne ── */
    primary:      '#2D3A4A',
    primaryHover: '#3D4E60',
    primaryLight: '#EDE8DF',
    accent:       '#D4A843',
    accentLight:  '#FBF6E8',

    /* Sidebar / header dark */
    navy:         '#2D3A4A',
    navyHover:    '#3D4E60',
    navyLight:    '#EDE8DF',

    /* Surfaces & texte */
    white:        '#FFFFFF',
    error:        '#C0392B',
    success:      '#226241',

    gray: {
      50:  '#F8F5EE',   // Ivoire — fond page
      100: '#EDE8DF',   // Ivoire 2 — surface légèrement teintée
      200: '#DAD4C8',   // Ivoire 3 — bordures, séparateurs
      400: '#6A6A66',   // Texte tertiaire — WCAG AA sur blanc
      600: '#555550',   // Texte secondaire
      800: '#111111',   // Texte principal
    },
  },
  typography: {
    fontFamily:      "'Open Sans', Arial, sans-serif",
    fontFamilySerif: "'Playfair Display', Georgia, serif",
    fontFamilyMono:  "'DM Mono', 'Courier New', monospace",
    sizes: {
      xs:   '0.75rem',
      sm:   '0.875rem',
      md:   '1rem',
      lg:   '1.125rem',
      xl:   '1.25rem',
      '2xl':'1.5rem',
      '3xl':'1.875rem',
    },
    weights: {
      normal:   400,
      medium:   500,
      semibold: 600,
      bold:     700,
    },
    lineHeights: {
      tight:   1.2,
      normal:  1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs:   '4px',
    sm:   '8px',
    md:   '16px',
    lg:   '24px',
    xl:   '32px',
    '2xl':'48px',
    '3xl':'64px',
  },
  radii: {
    sm:   '4px',
    md:   '6px',
    lg:   '10px',
    xl:   '14px',
    full: '9999px',
  },
  breakpoints: {
    mobile: '768px',
  },
  layout: {
    sidebarWidth:        '220px',
    headerHeight:        '68px',
    mobileHeaderHeight:  '112px',
    bottomNavHeight:     '64px',
    demoBannerHeight:    '34px',
    footerHeight:        '48px',
  },
} as const

export type Theme = typeof theme
```

- [ ] **Step 3: Update Google Fonts link in `index.html`**

Replace the existing `<link href="https://fonts.googleapis.com/css2?family=Roboto...">` line with:

```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
```

- [ ] **Step 4: Update font in `src/index.css` (line 11)**

Find:
```css
font-family: 'Roboto', Arial, sans-serif;
```
Replace with:
```css
font-family: 'Open Sans', Arial, sans-serif;
```

- [ ] **Step 5: Verify TS still clean**

```bash
npm run typecheck
```
Expected: no errors. (The `styled.d.ts` extends `Theme` via structural typing — all token names are unchanged so no type breaks.)

- [ ] **Step 6: Run tests**

```bash
npm test -- --run
```
Expected: 161 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/theme.ts index.html src/index.css
git commit -m "refactor(theme): Ardoise & Champagne palette + Open Sans — design system foundation"
```

---

### Task 2: Fix hardcoded hex values in layout and shared components

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Fix BottomNav — hardcoded `#C9A84C` at line 106**

In `src/components/layout/BottomNav.tsx`, find the line with `color: #C9A84C;` and replace it with:
```ts
color: ${({ theme }) => theme.colors.accent};
```

- [ ] **Step 2: Fix Header — hardcoded hex values**

In `src/components/layout/Header.tsx`, make the following replacements:

Find (line ~184):
```ts
background: #dcdcdc;
```
Replace with:
```ts
background: ${({ theme }) => theme.colors.gray[200]};
```

Find (line ~191):
```ts
&:focus-within { background: #e8e8e8; }
```
Replace with:
```ts
&:focus-within { background: ${({ theme }) => theme.colors.gray[100]}; }
```

Find (line ~147):
```ts
color: #555;
```
Replace with:
```ts
color: ${({ theme }) => theme.colors.gray[600]};
```

Find (line ~162):
```ts
color: #111;
```
Replace with:
```ts
color: ${({ theme }) => theme.colors.gray[800]};
```

Find (line ~168):
```ts
&::placeholder { color: #555; font-size: 13px; }
```
Replace with:
```ts
&::placeholder { color: ${({ theme }) => theme.colors.gray[600]}; font-size: 13px; }
```

Find (line ~222):
```ts
color: ${({ $active }) => $active ? '#232f3e' : '#555'};
```
Replace with:
```ts
color: ${({ $active, theme }) => $active ? theme.colors.navy : theme.colors.gray[600]};
```

Find (line ~413):
```ts
&:hover { background: #25477A; }
```
Replace with:
```ts
&:hover { background: ${({ theme }) => theme.colors.primaryHover}; }
```

(Note: `#3d2f00` avatar text color at line 241 and elsewhere in Header/BurgerMenu/Sidebar is intentional dark text on a gold/champagne avatar background — `#3d2f00` on `#D4A843` gives ~7:1 contrast. Leave it unchanged.)

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 4: Run tests**

```bash
npm test -- --run
```
Expected: 161 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/BottomNav.tsx src/components/layout/Header.tsx
git commit -m "fix(layout): replace hardcoded hex values with theme tokens"
```

---

### Task 3: LoginPage — split-panel Éditorial Luxe layout

**Files:**
- Modify: `src/components/auth/AuthLayout.tsx`
- Modify: `src/pages/auth/LoginPage.tsx`

The new LoginPage uses a two-column layout: brand panel left (ardoise background), form panel right (ivoire background). `Register` and `ForgotPassword` pages keep the existing centered-card layout (`AuthPage` + `AuthCard`) unchanged.

- [ ] **Step 1: Add split-panel exports to `AuthLayout.tsx`**

Append to the end of `src/components/auth/AuthLayout.tsx` (after the existing `PasswordToggle` export):

```ts
/* ── Split-panel layout (LoginPage only) ── */

export const SplitPage = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  padding-top: ${({ theme }) => theme.layout.demoBannerHeight};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`

export const BrandPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.navy};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 52px 56px 44px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(212,168,67,0.06) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(212,168,67,0.04) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`

export const BrandPanelDotGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`

export const BrandLine = styled.div`
  width: 2px;
  height: 48px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${({ theme }) => theme.colors.accent} 20%,
    ${({ theme }) => theme.colors.accent} 80%,
    transparent 100%
  );
  margin-bottom: 20px;
`

export const BrandName = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
  margin-bottom: 4px;

  span { color: ${({ theme }) => theme.colors.accent}; }
`

export const BrandTagline = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.58);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 36px;
`

export const BrandFeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const BrandFeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255,255,255,0.72);
  line-height: 1.4;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    flex-shrink: 0;
  }
`

export const BrandFooter = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.30);
  letter-spacing: 0.05em;
`

export const FormPanel = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    background-color: ${({ theme }) => theme.colors.navy};
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

export const FormPanelInner = styled.div`
  width: 100%;
  max-width: 380px;
`
```

- [ ] **Step 2: Update imports in `LoginPage.tsx`**

Replace the `AuthLayout` import block (lines 13–22):
```tsx
import {
  AuthLogo,
  AuthTitle,
  AuthSubtitle,
  AuthForm,
  AuthError,
  AuthLink,
  PasswordWrapper,
  SplitPage,
  BrandPanel,
  BrandPanelDotGrid,
  BrandLine,
  BrandName,
  BrandTagline,
  BrandFeatureList,
  BrandFeatureItem,
  BrandFooter,
  FormPanel,
  FormPanelInner,
} from '@/components/auth/AuthLayout'
```

(Remove `AuthPage` and `AuthCard` from the import — they are no longer used in LoginPage.)

- [ ] **Step 3: Fix `ModalTitle` template literal bug and `ModalClose` hover in `LoginPage.tsx`**

Find `ModalTitle` styled component (around line 58). It has an escaped backtick `\${`. Replace:
```ts
const ModalTitle = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: \${({ theme }) => theme.colors.navy};
  margin-bottom: 8px;
`
```
with:
```ts
const ModalTitle = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 8px;
`
```

Find `ModalClose` hover (around line 84):
```ts
  &:hover {
    background: #16304f;
  }
```
Replace with:
```ts
  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
```

- [ ] **Step 4: Replace `LoginPage` JSX return with split-panel layout**

Replace the `return (...)` block and the trailing `AuthStack` styled component (everything from `return (` at line 143 to end of file at line 241) with:

```tsx
  return (
    <SplitPage>
      <BrandPanel>
        <BrandPanelDotGrid />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <BrandLine />
          <BrandName>Flow<span>Diff</span></BrandName>
          <BrandTagline>La plateforme des libraires</BrandTagline>
          <BrandFeatureList>
            <BrandFeatureItem>Catalogue fonds, nouveautés &amp; à paraître</BrandFeatureItem>
            <BrandFeatureItem>Commandes directes et suivi temps réel</BrandFeatureItem>
            <BrandFeatureItem>Remises personnalisées par thématique</BrandFeatureItem>
            <BrandFeatureItem>Historique, retours et EDI intégrés</BrandFeatureItem>
          </BrandFeatureList>
        </div>
        <BrandFooter>© 2026 FlowDiff — Accès réservé aux libraires</BrandFooter>
      </BrandPanel>

      <FormPanel>
        <FormPanelInner>
          <AuthLogo>
            <Wordmark size="lg" showBaseline />
          </AuthLogo>

          <AuthTitle>Connexion</AuthTitle>
          <AuthSubtitle>Accès réservé aux libraires</AuthSubtitle>

          <div style={{
            background: '#FFF8E1',
            border: '1px solid #FFD54F',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '0.8125rem',
            color: '#5D4037',
            marginBottom: '4px',
            lineHeight: 1.4,
          }}>
            Les identifiants sont pré-remplis. Cliquez directement sur le bouton de connexion.
          </div>

          {serverError && <AuthError role="alert">{serverError}</AuthError>}

          <AuthForm onSubmit={handleSubmit} noValidate>
            <Input
              id="identifier"
              label="Code client ou email"
              type="password"
              placeholder="LIB001 ou contact@malib.fr"
              value={form.identifier}
              onChange={handleChange('identifier')}
              error={fieldErrors.identifier}
              autoComplete="username"
              autoFocus
              disabled
            />

            <div>
              <PasswordWrapper>
                <Input
                  id="password"
                  label="Mot de passe"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                  error={fieldErrors.password}
                  autoComplete="current-password"
                  disabled
                />
              </PasswordWrapper>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <a
                href="#"
                onClick={e => { e.preventDefault(); setBlockedMsg('La réinitialisation de mot de passe a été bloquée.') }}
                style={{ fontSize: '0.875rem', color: theme.colors.navy, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Mot de passe oublié ?
              </a>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </AuthForm>

          <AuthLink>
            <a
              href="#"
              onClick={e => { e.preventDefault(); setBlockedMsg('La création de compte a été bloquée.') }}
            >
              Demander un accès
            </a>
          </AuthLink>

          <DemoBanner position="bottom" />
        </FormPanelInner>
      </FormPanel>

      {blockedMsg && <BlockedModal message={blockedMsg} onClose={() => setBlockedMsg(null)} />}
    </SplitPage>
  )
}
```

(The `AuthStack` styled component that follows is removed — `FormPanelInner` replaces it.)

- [ ] **Step 5: Run typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 6: Run tests**

```bash
npm test -- --run
```
Expected: 161 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/auth/AuthLayout.tsx src/pages/auth/LoginPage.tsx
git commit -m "feat(login): split-panel Éditorial Luxe layout"
```

---

### Task 4: FicheProduitPage — remove hardcoded Roboto + ivoire border tints

**Files:**
- Modify: `src/pages/catalogue/FicheProduitPage.tsx`

- [ ] **Step 1: Replace all hardcoded `'Roboto'` font-family references**

In `src/pages/catalogue/FicheProduitPage.tsx`, there are 7 occurrences of `font-family: 'Roboto', Arial, sans-serif;` at lines 650, 671, 691, 713, 720, 759, 870 (approximate). Replace each with:
```ts
font-family: ${({ theme }) => theme.typography.fontFamily};
```

Run to confirm count:
```bash
grep -c "Roboto" src/pages/catalogue/FicheProduitPage.tsx
```
Expected: 0 after replacements.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 3: Run tests**

```bash
npm test -- --run
```
Expected: 161 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/catalogue/FicheProduitPage.tsx
git commit -m "fix(fiche-produit): replace hardcoded Roboto with theme font token"
```

---

### Task 5: HomePage — fix `#C9A84C` SVG hardcodes

**Files:**
- Modify: `src/pages/home/HomePage.tsx`

The theme cascade from Task 1 handles all styled-components in HomePage automatically. The only remaining issues are two JSX inline SVG attributes that reference the old accent color.

- [ ] **Step 1: Add `theme` import to `HomePage.tsx`**

In `src/pages/home/HomePage.tsx`, add to the imports at the top:
```tsx
import { theme } from '@/lib/theme'
```

- [ ] **Step 2: Fix `stroke="#C9A84C"` at line ~677**

Find:
```tsx
<polyline points={comparePoly} fill="none" stroke="#C9A84C" strokeWidth="1.2"
```
Replace with:
```tsx
<polyline points={comparePoly} fill="none" stroke={theme.colors.accent} strokeWidth="1.2"
```

- [ ] **Step 3: Fix `$color="#C9A84C"` at line ~1720**

Find:
```tsx
<ChartLegendLine $color="#C9A84C" $dashed />
```
Replace with:
```tsx
<ChartLegendLine $color={theme.colors.accent} $dashed />
```

- [ ] **Step 4: Fix inline `color: '#6B6B68'` at lines ~264, ~277**

Find (two occurrences in JSX):
```tsx
style={{ color: '#6B6B68', flexShrink: 0 }}
```
and
```tsx
style={{ flexShrink: 0, color: '#6B6B68', marginTop: 1 }}
```
Replace with:
```tsx
style={{ color: theme.colors.gray[400], flexShrink: 0 }}
```
and
```tsx
style={{ flexShrink: 0, color: theme.colors.gray[400], marginTop: 1 }}
```

- [ ] **Step 5: Run typecheck + tests**

```bash
npm run typecheck && npm test -- --run
```
Expected: no TS errors, 161 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/home/HomePage.tsx
git commit -m "fix(home): replace hardcoded accent/gray hex with theme tokens"
```

---

### Task 6: Light-touch pass — remaining pages

**Files:**
- Modify: `src/pages/edi/EDIPage.tsx`
- Modify: `src/pages/facturation/FacturationPage.tsx`
- Modify: `src/pages/offices/OfficesPage.tsx`

These pages have isolated old-palette hardcodes. CartPage and FondsPage are clean — the theme cascade from Task 1 is sufficient for them.

- [ ] **Step 1: Fix `EDIPage.tsx` — hardcoded `#232f3e`**

In `src/pages/edi/EDIPage.tsx` at line ~1093, find:
```tsx
<strong style={{ color: '#232f3e' }}>🏢 DILICOM</strong>
```

This is a JSX inline style. Add `import { theme } from '@/lib/theme'` if not already imported, then replace:
```tsx
<strong style={{ color: theme.colors.navy }}>🏢 DILICOM</strong>
```

- [ ] **Step 2: Fix `FacturationPage.tsx` — hardcoded `#232f3e`**

In `src/pages/facturation/FacturationPage.tsx` at lines ~213 and ~230, find:
```ts
border: 2px solid #232f3e;
```
and
```ts
background: #232f3e;
```
Replace with:
```ts
border: 2px solid ${({ theme }) => theme.colors.navy};
```
and
```ts
background: ${({ theme }) => theme.colors.navy};
```

- [ ] **Step 3: Fix `OfficesPage.tsx` — hardcoded `#232f3e`**

In `src/pages/offices/OfficesPage.tsx` at line ~925, find:
```tsx
$color={activeFilter === 'Tous' ? '#232f3e' : '#555550'}
```
Replace with:
```tsx
$color={activeFilter === 'Tous' ? theme.colors.navy : theme.colors.gray[600]}
```

Add `import { theme } from '@/lib/theme'` to the file's imports if not already present.

- [ ] **Step 4: Verify no remaining old-palette hardcodes**

```bash
grep -rn "'#232f3e'\|#232f3e\|#C9A84C\|Roboto" src/ | grep -v "node_modules\|\.test\.\|theme\.ts"
```
Expected: no output (all old-palette hardcodes removed).

- [ ] **Step 5: Run typecheck + tests**

```bash
npm run typecheck && npm test -- --run
```
Expected: no TS errors, 161 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/edi/EDIPage.tsx src/pages/facturation/FacturationPage.tsx src/pages/offices/OfficesPage.tsx
git commit -m "fix(pages): replace remaining old-palette hardcoded hex with theme tokens"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by task |
|---|---|
| `theme.ts` new Ardoise & Champagne tokens | Task 1 |
| Open Sans font (index.html + index.css) | Task 1 |
| Sidebar auto-updates (uses `theme.colors.navy` + `theme.colors.accent` via const) | Task 1 cascade |
| Button, Badge, Input auto-update (all use `theme.colors.*`) | Task 1 cascade |
| BottomNav hardcoded `#C9A84C` | Task 2 |
| Header hardcoded hex values | Task 2 |
| LoginPage split-panel layout | Task 3 |
| FicheProduitPage Roboto removal | Task 4 |
| HomePage `#C9A84C` SVG hardcodes | Task 5 |
| FondsPage, CartPage | Task 1 cascade (no hardcodes in these files for old palette) |
| EDI, Facturation, Offices light-touch | Task 6 |
| Tests remain green throughout | Every task runs `npm test -- --run` |

**No placeholders found** — all steps contain exact file paths, line numbers, and code.

**Type consistency** — `theme.colors.navy`, `theme.colors.accent`, `theme.colors.gray[400]` etc. are used consistently throughout, matching the token names in Task 1's `theme.ts`.
