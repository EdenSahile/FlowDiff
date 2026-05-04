export const bp = {
  xs: 360,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1400,
} as const

export const mq = {
  xs: `@media (min-width: ${bp.xs}px)`,
  sm: `@media (min-width: ${bp.sm}px)`,
  md: `@media (min-width: ${bp.md}px)`,
  lg: `@media (min-width: ${bp.lg}px)`,
  xl: `@media (min-width: ${bp.xl}px)`,
  belowSm: `@media (max-width: ${bp.sm - 1}px)`,
  belowMd: `@media (max-width: ${bp.md - 1}px)`,
  belowLg: `@media (max-width: ${bp.lg - 1}px)`,
} as const
