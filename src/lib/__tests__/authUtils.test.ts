import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getSafeRedirectPath, createMockToken, parseMockToken, registerSchema } from '@/lib/authUtils'

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

  it('rejette le schéma data:', () => {
    expect(getSafeRedirectPath('data:text/html,<h1>evil</h1>')).toBe('/')
  })

  it('accepte un chemin avec fragment (#)', () => {
    expect(getSafeRedirectPath('/page#section')).toBe('/page#section')
  })

  it('laisse passer les caractères URL-encodés sans les décoder', () => {
    expect(getSafeRedirectPath('/%2Fpage')).toBe('/%2Fpage')
  })
})

describe('registerSchema', () => {
  const validInput = {
    codeClient: 'LIB001',
    email: 'test@example.com',
    password: 'Test1234!',
    confirmPassword: 'Test1234!',
  }

  describe('FLOW-RM-014 : validation du mot de passe', () => {
    it('rejette un mot de passe trop court (< 8 caracteres)', () => {
      const input = { ...validInput, password: 'Ab1!xyz', confirmPassword: 'Ab1!xyz' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const passwordErrors = parsed.error.issues.filter(i => i.path[0] === 'password')
        expect(passwordErrors.some(e => e.message === 'Minimum 8 caractères')).toBe(true)
      }
    })

    it('rejette un mot de passe sans majuscule', () => {
      const input = { ...validInput, password: 'test1234!', confirmPassword: 'test1234!' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const passwordErrors = parsed.error.issues.filter(i => i.path[0] === 'password')
        expect(passwordErrors.some(e => e.message === 'Une majuscule requise')).toBe(true)
      }
    })

    it('rejette un mot de passe sans chiffre', () => {
      const input = { ...validInput, password: 'Testtest!', confirmPassword: 'Testtest!' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const passwordErrors = parsed.error.issues.filter(i => i.path[0] === 'password')
        expect(passwordErrors.some(e => e.message === 'Un chiffre requis')).toBe(true)
      }
    })

    it('rejette un mot de passe sans caractere special', () => {
      const input = { ...validInput, password: 'Test12345', confirmPassword: 'Test12345' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const passwordErrors = parsed.error.issues.filter(i => i.path[0] === 'password')
        expect(passwordErrors.some(e => e.message.includes('caractère spécial'))).toBe(true)
      }
    })

    it('accepte un mot de passe valide (8+ chars, majuscule, chiffre, special)', () => {
      const parsed = registerSchema.safeParse(validInput)

      expect(parsed.success).toBe(true)
    })
  })

  describe('FLOW-RM-015 : validation et transformation du code client', () => {
    it('rejette un code client trop court (< 3 caracteres)', () => {
      const input = { ...validInput, codeClient: 'AB' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const codeErrors = parsed.error.issues.filter(i => i.path[0] === 'codeClient')
        expect(codeErrors.some(e => e.message === 'Code client invalide')).toBe(true)
      }
    })

    it('rejette un code client trop long (> 20 caracteres)', () => {
      const input = { ...validInput, codeClient: 'A'.repeat(21) }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const codeErrors = parsed.error.issues.filter(i => i.path[0] === 'codeClient')
        expect(codeErrors.some(e => e.message === 'Code client invalide')).toBe(true)
      }
    })

    it('trim les espaces et met en majuscules un code valide', () => {
      const input = { ...validInput, codeClient: '  lib001  ' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.codeClient).toBe('LIB001')
      }
    })

    it('rejette un code trop court apres trim meme si la chaine brute depasse 3 caracteres', () => {
      const input = { ...validInput, codeClient: '  a  ' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const codeErrors = parsed.error.issues.filter(i => i.path[0] === 'codeClient')
        expect(codeErrors.some(e => e.message === 'Code client invalide')).toBe(true)
      }
    })

    it('accepte un code de 3 caracteres (borne min)', () => {
      const input = { ...validInput, codeClient: 'abc' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.codeClient).toBe('ABC')
      }
    })

    it('accepte un code de 20 caracteres (borne max)', () => {
      const input = { ...validInput, codeClient: 'a'.repeat(20) }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.codeClient).toBe('A'.repeat(20))
      }
    })
  })

  describe('FLOW-RM-019 : confirmation mot de passe', () => {
    it('rejette si password !== confirmPassword, erreur sur confirmPassword', () => {
      const input = { ...validInput, confirmPassword: 'Autre1234!' }

      const parsed = registerSchema.safeParse(input)

      expect(parsed.success).toBe(false)
      if (!parsed.success) {
        const confirmErrors = parsed.error.issues.filter(i => i.path[0] === 'confirmPassword')
        expect(confirmErrors.some(e => e.message === 'Les mots de passe ne correspondent pas')).toBe(true)
      }
    })

    it('accepte si password === confirmPassword', () => {
      const parsed = registerSchema.safeParse(validInput)

      expect(parsed.success).toBe(true)
    })
  })
})
