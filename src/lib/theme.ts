export const theme = {
  colors: {
    /* ── Palette Forêt & Lin ── */
    primary:      '#226241',   // Vert forêt — CTA, boutons, sidebar
    primaryHover: '#2D5C44',   // Vert légèrement plus clair au hover
    primaryLight: '#E6EFE9',   // Fond très clair (badges, highlights)
    accent:       '#C9A84C',   // Or — signal nouveauté, badges, accents
    accentLight:  '#F7F0DC',   // Fond or très clair

    /* Sidebar / header dark */
    navy:         '#226241',   // Vert forêt — fond sidebar/header
    navyHover:    '#2D5C44',   // Légèrement plus clair
    navyLight:    '#E6EFE9',   // Vert pâle pour surfaces alternées

    /* Surfaces & texte */
    white:        '#FFFFFF',    // Blanc pur — surfaces cards
    error:        '#C0392B',
    success:      '#226241',

    gray: {
      50:  '#F4F4F0',   // Fond page (lin neutre)
      100: '#EAEAE6',   // Surface légèrement teintée
      200: '#D8D8D4',   // Bordures, séparateurs
      400: '#9A9A96',   // Texte tertiaire, placeholders
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
  radii: {
    sm:   '0px',
    md:   '0px',
    lg:   '0px',
    xl:   '0px',
    full: '9999px',
  },
  shadows: {
    sm:  'none',
    md:  'none',
    lg:  'none',
    nav: 'none',
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
