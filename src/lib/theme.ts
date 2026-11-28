export const theme = {
  colors: {
    /* ── Palette Ardoise & Champagne ── */
    primary:      '#2D3A4A',
    primaryHover: '#3D4E60',
    primaryLight: '#EDE8DF',
    accent:       '#D4A843',
    accentLight:  '#FBF6E8',
    /*
      Or lisible en texte sur fond clair. `accent` ne dépasse pas 2,21 de
      contraste sur blanc et 1,82 sur gray.100, quand WCAG AA demande 4,5 pour
      du petit texte et 3 pour une icône : il ne tient comme couleur de texte
      que sur navy, à 5,22. accentDark passe sur les 4 fonds clairs du thème,
      de 5,11 sur gray.100 à 6,24 sur blanc.
    */
    accentDark:   '#7A5C12',

    /* Sidebar / header dark */
    navy:         '#2D3A4A',
    navyHover:    '#3D4E60',
    navyLight:    '#EDE8DF',

    /* Surfaces & texte */
    white:        '#FFFFFF',
    error:        '#C0392B',
    success:      '#226241',

    gray: {
      50:  '#F8F5EE',
      100: '#EDE8DF',
      200: '#DAD4C8',
      400: '#6A6A66',
      600: '#555550',
      800: '#111111',
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
    sm:   '4px',     // badges, tags, indicateurs
    md:   '6px',     // boutons, inputs
    lg:   '10px',    // cards
    xl:   '14px',    // modals, grands panneaux
    full: '9999px',  // pills, avatars
  },
  breakpoints: {
    mobile: '768px',
    xs: '360px',
    sm: '480px',
    md: '768px',
    lg: '1024px',
    xl: '1400px',
  },
  layout: {
    sidebarWidth:        '220px',
    headerHeight:        '64px',
    mobileHeaderHeight:  '112px',
    bottomNavHeight:     '64px',
    demoBannerHeight:    '34px',
    footerHeight:        '48px',
  },
} as const

export type Theme = typeof theme
