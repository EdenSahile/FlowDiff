import { z } from 'zod'

/* ── Schémas Zod ── */

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Identifiant requis'),
  password: z
    .string()
    .min(1, 'Mot de passe requis'),
})

export const registerSchema = z
  .object({
    codeClient: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, 'Code client invalide')
      .max(20, 'Code client invalide'),
    // trim avant email : Zod applique les étapes dans l'ordre d'écriture, et un email
    // collé avec une espace parasite échouait à la validation au lieu d'être nettoyé
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Adresse email invalide'),
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Une majuscule requise')
      .regex(/[0-9]/, 'Un chiffre requis')
      .regex(/[^A-Za-z0-9]/, 'Un caractère spécial requis (!@#$…)'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmation requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Adresse email invalide'),
})

/* ── Types inférés ── */

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/* ── Token mock ── */

export interface MockTokenPayload {
  sub: string       // user id
  codeClient: string
  iat: number
  exp: number
}

export function createMockToken(userId: string, codeClient: string): string {
  const header = btoa(JSON.stringify({ alg: 'mock', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      codeClient,
      iat: Date.now(),
      exp: Date.now() + 8 * 60 * 60 * 1000, // 8h
    } satisfies MockTokenPayload)
  )
  return `${header}.${payload}.mock`
}

export function parseMockToken(token: string): MockTokenPayload | null {
  try {
    const [, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64)) as MockTokenPayload
    if (payload.exp < Date.now()) return null // expiré
    return payload
  } catch {
    return null
  }
}

/* ── Redirection post-login sécurisée ── */

/**
 * Valide une cible de redirection post-login (ex. state.from de ProtectedRoute)
 * et retourne un chemin interne sûr, ou le repli fourni si la cible est absente,
 * malformée, ou pointe hors de l'application.
 *
 * Se protège notamment contre les URLs "protocol-relative" (`//evil.com`),
 * les schémas explicites (`https://…`, `javascript:…`) et les backslashes
 * que certains navigateurs normalisent comme des slashs : le vecteur d'open
 * redirect documenté par les CVE React Router 2026 (ex. CVE-2026-40181).
 */
export function getSafeRedirectPath(target: unknown, fallback = '/'): string {
  if (typeof target !== 'string' || target.length === 0) return fallback

  // Un chemin interne valide commence par un seul "/" et jamais par "//" ou "/\"
  // (les deux sont réinterprétés comme protocol-relative par le navigateur).
  if (!/^\/(?!\/|\\)/.test(target)) return fallback

  // Rejette toute présence d'un schéma (http:, https:, javascript:, data:, etc.)
  // même encodé ou précédé d'espaces/contrôles, cas déjà couverts par le test
  // ci-dessus pour la position 0, mais on vérifie aussi le corps du chemin.
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return fallback

  return target
}

/* ── Helpers validation ── */

export function getZodErrors(
  result: { success: false; error: z.ZodError } | { success: true }
): Record<string, string> {
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue: z.ZodIssue) => [issue.path[0], issue.message])
  )
}
