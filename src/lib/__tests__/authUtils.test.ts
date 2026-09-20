import { describe, it, expect } from 'vitest'
import { getSafeRedirectPath } from '@/lib/authUtils'

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
