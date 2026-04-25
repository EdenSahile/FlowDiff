import { describe, it, expect } from 'vitest'
import { contactSchema, newsletterSchema, wishlistNameSchema, cartQtySchema } from '@/lib/formSchemas'

/* ── contactSchema ── */
describe('contactSchema', () => {
  it('accepte un sujet et un message valides', () => {
    const result = contactSchema.safeParse({ sujet: 'Demande info', message: 'Bonjour, je voudrais savoir si...' })
    expect(result.success).toBe(true)
  })

  it('refuse un sujet trop court (< 2 caractères)', () => {
    const result = contactSchema.safeParse({ sujet: 'A', message: 'Message valide ici' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('sujet')
  })

  it('refuse un sujet trop long (> 200 caractères)', () => {
    const result = contactSchema.safeParse({ sujet: 'A'.repeat(201), message: 'Message valide ici' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('sujet')
  })

  it('refuse un message trop court (< 10 caractères)', () => {
    const result = contactSchema.safeParse({ sujet: 'Sujet ok', message: 'Court' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('message')
  })

  it('refuse un message trop long (> 2000 caractères)', () => {
    const result = contactSchema.safeParse({ sujet: 'Sujet ok', message: 'A'.repeat(2001) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('message')
  })

  it('trim le sujet et le message avant validation', () => {
    const result = contactSchema.safeParse({ sujet: '  Sujet trimé  ', message: '  Message suffisamment long  ' })
    expect(result.success).toBe(true)
  })
})

/* ── newsletterSchema ── */
describe('newsletterSchema', () => {
  it('accepte un email valide avec au moins une newsletter sélectionnée', () => {
    const result = newsletterSchema.safeParse({ email: 'test@librairie.fr', selected: ['nouveautes'] })
    expect(result.success).toBe(true)
  })

  it('refuse un email invalide', () => {
    const result = newsletterSchema.safeParse({ email: 'pas-un-email', selected: ['nouveautes'] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('email')
  })

  it('refuse un tableau selected vide', () => {
    const result = newsletterSchema.safeParse({ email: 'test@librairie.fr', selected: [] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('selected')
  })

  it('normalise l\'email en minuscules', () => {
    const result = newsletterSchema.safeParse({ email: 'TEST@Librairie.FR', selected: ['nouveautes'] })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('test@librairie.fr')
  })
})

/* ── wishlistNameSchema ── */
describe('wishlistNameSchema', () => {
  it('accepte un nom valide', () => {
    const result = wishlistNameSchema.safeParse('Saint-Valentin')
    expect(result.success).toBe(true)
  })

  it('refuse une chaîne vide', () => {
    const result = wishlistNameSchema.safeParse('')
    expect(result.success).toBe(false)
  })

  it('refuse un nom composé uniquement d\'espaces', () => {
    const result = wishlistNameSchema.safeParse('   ')
    expect(result.success).toBe(false)
  })

  it('refuse un nom trop long (> 50 caractères)', () => {
    const result = wishlistNameSchema.safeParse('A'.repeat(51))
    expect(result.success).toBe(false)
  })

  it('accepte exactement 50 caractères', () => {
    const result = wishlistNameSchema.safeParse('A'.repeat(50))
    expect(result.success).toBe(true)
  })
})

/* ── cartQtySchema ── */
describe('cartQtySchema', () => {
  it('accepte 1', () => {
    expect(cartQtySchema.safeParse(1).success).toBe(true)
  })

  it('accepte 30 (CART_LIMIT)', () => {
    expect(cartQtySchema.safeParse(30).success).toBe(true)
  })

  it('refuse 0', () => {
    expect(cartQtySchema.safeParse(0).success).toBe(false)
  })

  it('refuse 31 (au-dessus du CART_LIMIT)', () => {
    expect(cartQtySchema.safeParse(31).success).toBe(false)
  })

  it('refuse un nombre non entier', () => {
    expect(cartQtySchema.safeParse(1.5).success).toBe(false)
  })

  it('refuse une valeur négative', () => {
    expect(cartQtySchema.safeParse(-1).success).toBe(false)
  })
})
