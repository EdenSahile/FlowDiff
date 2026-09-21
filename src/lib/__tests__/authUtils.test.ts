import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSafeRedirectPath, createMockToken, parseMockToken } from '@/lib/authUtils'

describe('createMockToken', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('génère un token dont le payload contient exp = iat + 8h', () => {
    const token = createMockToken('user-1', 'LIB001')

    const [, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64))

    expect(payload.exp).toBe(payload.iat + 8 * 60 * 60 * 1000)
  })

  it('inclut le userId et le codeClient dans le payload', () => {
    const token = createMockToken('user-42', 'LIBX99')

    const [, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64))

    expect(payload.sub).toBe('user-42')
    expect(payload.codeClient).toBe('LIBX99')
  })
})

describe('parseMockToken', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retourne le payload pour un token non expiré', () => {
    const token = createMockToken('user-1', 'LIB001')

    const payload = parseMockToken(token)

    expect(payload).not.toBeNull()
    expect(payload!.sub).toBe('user-1')
    expect(payload!.codeClient).toBe('LIB001')
  })

  it('retourne null pour un token expiré', () => {
    const token = createMockToken('user-1', 'LIB001')

    vi.advanceTimersByTime(8 * 60 * 60 * 1000 + 1)

    expect(parseMockToken(token)).toBeNull()
  })

  it('retourne null pour un token malformé', () => {
    expect(parseMockToken('pas-un-token')).toBeNull()
  })
})

describe('getSafeRedirectPath', () => {
  it('accepte un chemin interne simple', () => {
    expect(getSafeRedirectPath('/catalogue')).toBe('/catalogue')
  })

  it('accepte un chemin interne avec query string', () => {
    expect(getSafeRedirectPath('/catalogue?tri=titre')).toBe('/catalogue?tri=titre')
  })

  it('retourne le repli si la cible est absente (undefined)', () => {
    expect(getSafeRedirectPath(undefined)).toBe('/')
  })

  it('retourne le repli si la cible est une chaîne vide', () => {
    expect(getSafeRedirectPath('')).toBe('/')
  })

  it('retourne le repli si la cible n\'est pas une chaîne', () => {
    expect(getSafeRedirectPath(42)).toBe('/')
    expect(getSafeRedirectPath({ from: '/x' })).toBe('/')
    expect(getSafeRedirectPath(null)).toBe('/')
  })

  it('utilise un repli personnalisé si fourni', () => {
    expect(getSafeRedirectPath(undefined, '/dashboard')).toBe('/dashboard')
  })

  // Vecteur CVE-2026-40181 / CVE-2026-53669 (React Router open redirect) :
  // un chemin commençant par "//" est réinterprété par le navigateur comme
  // une URL protocol-relative et redirige hors du site.
  it('rejette une cible protocol-relative ("//evil.com")', () => {
    expect(getSafeRedirectPath('//evil.com')).toBe('/')
  })

  it('rejette une cible protocol-relative avec chemin ("//evil.com/phishing")', () => {
    expect(getSafeRedirectPath('//evil.com/phishing')).toBe('/')
  })

  it('rejette une cible avec backslash ("/\\evil.com")', () => {
    expect(getSafeRedirectPath('/\\evil.com')).toBe('/')
  })

  it('rejette une URL absolue avec schéma http(s)', () => {
    expect(getSafeRedirectPath('https://evil.com')).toBe('/')
    expect(getSafeRedirectPath('http://evil.com')).toBe('/')
  })

  it('rejette un schéma javascript:', () => {
    expect(getSafeRedirectPath('javascript:alert(1)')).toBe('/')
  })

  it('rejette une cible qui ne commence pas par "/"', () => {
    expect(getSafeRedirectPath('evil.com')).toBe('/')
    expect(getSafeRedirectPath('catalogue')).toBe('/')
  })
})
