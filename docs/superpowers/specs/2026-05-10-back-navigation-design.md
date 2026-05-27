# Navigation retour — Spec design
_2026-05-10_

## Objectif

Permettre à l'utilisateur de revenir à la page précédemment consultée depuis n'importe quelle page de l'application, via une flèche `←` discrète et cohérente avec la charte graphique.

---

## Décisions de design

| Question | Décision |
|----------|----------|
| Déclencheur | Toujours visible (pas uniquement depuis les raccourcis) |
| Comportement | `navigate(-1)` — suit l'historique réel de navigation |
| Fallback (pas d'historique) | Masqué — `useLocation().key === 'default'` |
| Pages concernées | Toutes sauf HomePage, LoginPage, RegisterPage, ForgotPasswordPage |
| Fil d'Ariane | Non retenu — structure trop plate, sidebar remplit ce rôle |

---

## Composant `BackButton`

### Fichier
`src/components/ui/BackButton.tsx`

### Comportement
- Importe `useNavigate` et `useLocation` de React Router v6
- Si `useLocation().key === 'default'` → retourne `null` (accès direct, refresh, premier écran après login)
- Sinon → affiche une flèche `←` cliquable qui appelle `navigate(-1)`

### Style
- Aucun fond, aucune bordure — style lien discret
- Couleur texte : `theme.colors.navy` (`#232f3e`)
- Hover : `theme.colors.accent` (`#C9A84C`)
- Typo : Open Sans 13px, `theme.typography.fontFamily`
- Icône : `←` (caractère Unicode ou SVG arrow-left cohérent avec les icônes existantes)
- Espacement bas : `8px` pour respirer avant le `PageEyebrow`
- Accessibilité : `aria-label="Retour à la page précédente"`

### Position dans le PageHeader
```
[← Page précédente]      ← BackButton (masqué si pas d'historique)
─────────────────────
SECTION                  ← PageEyebrow (or, uppercase, 10px)
Titre de la page         ← PageTitle (navy, bold, 2xl)
Sous-titre               ← PageSubtitle (gris, sm)
```

---

## Pages à modifier

18 pages reçoivent `<BackButton />` inséré en tête de `PageHeader` :

1. `NouveautesPage` — `/nouveautes`
2. `AParaitrePage` — `/a-paraitre`
3. `FondsPage` — `/fonds`
4. `TopVentesPage` — `/top-ventes`
5. `SelectionsPage` — `/selections`
6. `FlashInfosPage` — `/flash-infos`
7. `HistoriquePage` — `/historique`
8. `FacturationPage` — `/facturation`
9. `EDIPage` — `/edi`
10. `OfficesPage` — `/offices`
11. `FicheProduitPage` — `/livre/:id`
12. `RecherchePage` — `/recherche`
13. `MonComptePage` — `/compte`
14. `ContactPage` — `/contact`
15. `ParametresPage` — `/parametres`
16. `CartPage` — `/panier`
17. `AuteurPage` — `/auteur/:slug`
18. Pages secondaires optionnelles : `AidePage`, `CGVPage`, `NewsletterPage`, `RdvPage`

---

## Hors périmètre

- `HomePage` : point de départ, pas de retour
- `LoginPage`, `RegisterPage`, `ForgotPasswordPage` : hors layout applicatif
- Fil d'Ariane : non implémenté (structure plate, sidebar suffit)
- Historique multi-niveaux (breadcrumb trail) : non implémenté

---

## Notes d'implémentation

- **Détection fiable** : `useLocation().key` vaut `'default'` uniquement pour les navigations fraîches (accès direct URL, premier rendu post-login via `<Navigate replace>`). Toute navigation in-app React Router génère une key unique → détection sans état global.
- **FicheProduitPage** : déjà dotée d'un `useEffect([id])` pour scroll restoration. Le `BackButton` cohabite sans conflit — le retour vers la liste repositionne l'utilisateur naturellement via le comportement navigateur.
- **Pas de context ni de state global** : le composant est autonome, zéro dépendance externe au-delà de React Router.
