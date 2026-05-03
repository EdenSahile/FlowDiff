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
