import { describe, it, expect } from 'vitest'
import { addressSchema, parseAddressString } from '../checkoutSchemas'

describe('addressSchema', () => {
  it('validates a complete address', () => {
    const result = addressSchema.safeParse({
      rue: '12 rue de la Paix',
      codePostal: '75001',
      ville: 'Paris',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty street', () => {
    const result = addressSchema.safeParse({ rue: '', codePostal: '75001', ville: 'Paris' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-numeric postal code', () => {
    const result = addressSchema.safeParse({ rue: '12 rue de la Paix', codePostal: 'ABCDE', ville: 'Paris' })
    expect(result.success).toBe(false)
  })

  it('rejects a postal code that is not 5 digits', () => {
    const result = addressSchema.safeParse({ rue: '12 rue de la Paix', codePostal: '750', ville: 'Paris' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty city', () => {
    const result = addressSchema.safeParse({ rue: '12 rue de la Paix', codePostal: '75001', ville: '' })
    expect(result.success).toBe(false)
  })

  /* Le trim s'applique avant les contrôles : une adresse d'espaces ne doit pas partir en commande */
  it('refuse une rue composée uniquement d\'espaces', () => {
    const addressWithBlankStreet = { rue: '   ', codePostal: '75001', ville: 'Paris' }

    const parsedAddress = addressSchema.safeParse(addressWithBlankStreet)

    expect(parsedAddress.success).toBe(false)
  })

  it('refuse une ville composée uniquement d\'espaces', () => {
    const addressWithBlankCity = { rue: '12 rue de la Paix', codePostal: '75001', ville: '   ' }

    const parsedAddress = addressSchema.safeParse(addressWithBlankCity)

    expect(parsedAddress.success).toBe(false)
  })

  it('accepte une adresse saisie avec des espaces parasites et la nettoie', () => {
    const addressWithPaddedFields = { rue: '  12 rue de la Paix  ', codePostal: '  75001  ', ville: '  Paris  ' }

    const parsedAddress = addressSchema.safeParse(addressWithPaddedFields)

    expect(parsedAddress.success).toBe(true)
    if (parsedAddress.success) {
      expect(parsedAddress.data).toEqual({ rue: '12 rue de la Paix', codePostal: '75001', ville: 'Paris' })
    }
  })
})

describe('parseAddressString', () => {
  it('parses a flat address string into structured fields', () => {
    const result = parseAddressString('12 rue du Parc, 75001 Paris')
    expect(result.codePostal).toBe('75001')
    expect(result.ville).toBe('Paris')
    expect(result.rue).toBe('12 rue du Parc')
  })

  it('returns empty fields for an unparseable string', () => {
    const result = parseAddressString('')
    expect(result.rue).toBe('')
    expect(result.codePostal).toBe('')
    expect(result.ville).toBe('')
  })
})
