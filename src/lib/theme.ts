export const theme = {
  colors: {
    /* ── Palette Forêt & Lin ── */
    primary:      '#232f3e',    // Bleu — CTA, boutons, sidebar
    primaryHover: '#42556c',   // Bleu légèrement plus clair au hover
    primaryLight: '#E6EFE9',   // Fond très clair (badges, highlights)
    accent:       '#C9A84C',   // Or — signal nouveauté, badges, accents
    accentLight:  '#F7F0DC',   // Fond or très clair

    /* Sidebar / header dark */
    navy:         '#232f3e',    // Bleu forêt — fond sidebar/header
    navyHover:    '#2D5C44',   // Légèrement plus clair
    navyLight:    '#E6EFE9',   // Vert pâle pour surfaces alternées

    /* Surfaces & texte */
    white:        '#FFFFFF',    // Blanc pur — surfaces cards
    error:        '#C0392B',
    success:      '#226241',   // Vert forêt — états positifs, disponibilité, "expédié"

    gray: {
      50:  '#F4F4F0',   // Fond page (lin neutre)
      100: '#EAEAE6',   // Surface légèrement teintée
      200: '#D8D8D4',   // Bordures, séparateurs
      400: '#6B6B68',   // Texte tertiaire, placeholders — 5.3:1 sur blanc (WCAG AA)
      600: '#555550',   // Texte secondaire
      800: '#111111',   // Texte principal
    },
  },
  typography: {
    fontFamily:      "'Roboto', Arial, sans-serif",
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
  /* Design plat assumé : radii sm/md/lg/xl = '0px', full = pill.
     box-shadow: none !important dans index.css annule toute ombre globalement. */
  radii: {
    sm:   '0px',
    md:   '0px',
    lg:   '0px',
    xl:   '0px',
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
  },
} as const

export type Theme = typeof theme
