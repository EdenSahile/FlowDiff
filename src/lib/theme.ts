export const theme = {
  colors: {
    primary:      '#E8960C',   // Ambre doré — chaud, lisible sur blanc
    primaryHover: '#CB7D08',   // Ambre foncé hover
    primaryLight: '#FEF5E0',   // Ambre très clair (fond de badge)
    navy:         '#1C3252',   // Bleu marine classique — Fnac-like, pas oppressant
    navyHover:    '#263F69',   // Légèrement plus clair
    navyLight:    '#EBF2FC',   // Bleu pâle pour fonds légers
    white:        '#FFFFFF',   // Blanc pur pour les cartes
    error:        '#C0392B',
    success:      '#1E7045',   // Vert forêt
    gray: {
      50:  '#FAFAF8',   // Blanc cassé très léger — fond de page aéré
      100: '#F3F0EC',   // Séparateurs très discrets
      200: '#E6E1DA',   // Séparateurs visibles
      400: '#B5AFA7',   // Gris moyen
      600: '#706A62',   // Texte secondaire
      800: '#2C2820',   // Texte principal — excellente lisibilité
    },
  },
  typography: {
    fontFamily: "'Roboto', Arial, sans-serif",
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
      tight:   1.25,
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
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    full: '9999px',
  },
  shadows: {
    sm:  '0 1px 3px rgba(28, 50, 82, 0.08)',
    md:  '0 4px 14px rgba(28, 50, 82, 0.10)',
    lg:  '0 10px 28px rgba(28, 50, 82, 0.14)',
    nav: '0 -2px 8px rgba(28, 50, 82, 0.08)',
  },
  breakpoints: {
    mobile: '768px',
  },
  layout: {
    sidebarWidth:    '220px',
    headerHeight:    '60px',
    bottomNavHeight: '68px',
  },
} as const

export type Theme = typeof theme
