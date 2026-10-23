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

  /* FLOW-RM-130 : bornes exactes, côté acceptation */
  it('accepte un sujet de 2 caractères et un message de 10 caractères', () => {
    const minimalContact = { sujet: 'AB', message: 'A'.repeat(10) }

    const parsedContact = contactSchema.safeParse(minimalContact)

    expect(parsedContact.success).toBe(true)
  })

  it('accepte un sujet de 200 caractères et un message de 2000 caractères', () => {
    const maximalContact = { sujet: 'A'.repeat(200), message: 'A'.repeat(2000) }

    const parsedContact = contactSchema.safeParse(maximalContact)

    expect(parsedContact.success).toBe(true)
  })

  /* FLOW-RM-130 : le trim s'applique avant la borne minimale */
  it('refuse un sujet qui n\'atteint 2 caractères qu\'avec ses espaces', () => {
    const contactWithPaddedSujet = { sujet: '  A  ', message: 'Message valide ici' }

    const parsedContact = contactSchema.safeParse(contactWithPaddedSujet)

    expect(parsedContact.success).toBe(false)
    expect(parsedContact.error?.issues[0].path[0]).toBe('sujet')
  })

  it('refuse un message qui n\'atteint 10 caractères qu\'avec ses espaces', () => {
    const contactWithPaddedMessage = { sujet: 'Sujet ok', message: '   Court   ' }

    const parsedContact = contactSchema.safeParse(contactWithPaddedMessage)

    expect(parsedContact.success).toBe(false)
    expect(parsedContact.error?.issues[0].path[0]).toBe('message')
  })

  it('renvoie le sujet et le message débarrassés de leurs espaces', () => {
    const contactWithSpaces = { sujet: '  Demande info  ', message: '  Message suffisamment long  ' }

    const parsedContact = contactSchema.safeParse(contactWithSpaces)

    expect(parsedContact.success).toBe(true)
    if (parsedContact.success) {
      expect(parsedContact.data.sujet).toBe('Demande info')
      expect(parsedContact.data.message).toBe('Message suffisamment long')
    }
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

  /* FLOW-RM-131 : un email saisi avec des espaces parasites est nettoyé, pas rejeté */
  it('accepte un email entouré d\'espaces et le nettoie', () => {
    const subscriptionWithPaddedEmail = { email: '  test@librairie.fr  ', selected: ['nouveautes'] }

    const parsedSubscription = newsletterSchema.safeParse(subscriptionWithPaddedEmail)

    expect(parsedSubscription.success).toBe(true)
    if (parsedSubscription.success) expect(parsedSubscription.data.email).toBe('test@librairie.fr')
  })

  it('accepte plusieurs newsletters sélectionnées', () => {
    const subscriptionWithThreeChoices = { email: 'test@librairie.fr', selected: ['nouveautes', 'bd', 'jeunesse'] }

    const parsedSubscription = newsletterSchema.safeParse(subscriptionWithThreeChoices)

    expect(parsedSubscription.success).toBe(true)
    if (parsedSubscription.success) expect(parsedSubscription.data.selected).toHaveLength(3)
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

  /* FLOW-RM-135 : bornes exactes et trim de la valeur de sortie */
  it('accepte un nom d\'un seul caractère', () => {
    const shortestName = 'A'

    const parsedName = wishlistNameSchema.safeParse(shortestName)

    expect(parsedName.success).toBe(true)
  })

  it('renvoie le nom débarrassé de ses espaces', () => {
    const nameWithSpaces = '  Saint-Valentin  '

    const parsedName = wishlistNameSchema.safeParse(nameWithSpaces)

    expect(parsedName.success).toBe(true)
    if (parsedName.success) expect(parsedName.data).toBe('Saint-Valentin')
  })

  it('accepte un nom de 50 caractères entouré d\'espaces, le trim ramenant sous la borne', () => {
    const paddedFiftyCharName = `  ${'A'.repeat(50)}  `

    const parsedName = wishlistNameSchema.safeParse(paddedFiftyCharName)

    expect(parsedName.success).toBe(true)
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

  /* FLOW-RM-132 : la quantité vient d'un champ de saisie, les valeurs non numériques doivent être refusées */
  it('refuse NaN', () => {
    expect(cartQtySchema.safeParse(NaN).success).toBe(false)
  })

  it('refuse une quantité passée en chaîne de caractères', () => {
    expect(cartQtySchema.safeParse('5').success).toBe(false)
  })

  it('refuse une quantité absente', () => {
    expect(cartQtySchema.safeParse(undefined).success).toBe(false)
  })
})
