import { describe, it, expect } from 'vitest'
import { CHECKOUT_PAGES, CHECKOUT_STEPS, getNextStep, getPrevStep, isLastStep, getStepIndex, getStepLabel, parseCheckoutPage } from '../checkoutSteps'

describe('checkout stepper', () => {
  it('defines 3 steps in order', () => {
    expect(CHECKOUT_STEPS).toEqual(['recap', 'addresses', 'transmission'])
  })

  it('getStepIndex returns correct position (0-based)', () => {
    expect(getStepIndex('recap')).toBe(0)
    expect(getStepIndex('addresses')).toBe(1)
    expect(getStepIndex('transmission')).toBe(2)
  })

  it('getNextStep returns the following step', () => {
    expect(getNextStep('recap')).toBe('addresses')
    expect(getNextStep('addresses')).toBe('transmission')
  })

  it('getNextStep returns null at the last step', () => {
    expect(getNextStep('transmission')).toBeNull()
  })

  it('getPrevStep returns the preceding step', () => {
    expect(getPrevStep('addresses')).toBe('recap')
    expect(getPrevStep('transmission')).toBe('addresses')
  })

  it('getPrevStep returns null at the first step', () => {
    expect(getPrevStep('recap')).toBeNull()
  })

  it('isLastStep detects the final step', () => {
    expect(isLastStep('transmission')).toBe(true)
    expect(isLastStep('recap')).toBe(false)
    expect(isLastStep('addresses')).toBe(false)
  })

  it('getStepLabel returns a non-empty French label for each step', () => {
    for (const s of CHECKOUT_STEPS) {
      expect(getStepLabel(s).length).toBeGreaterThan(0)
    }
  })
})

describe('parseCheckoutPage, lecture de l\'etape depuis l\'URL', () => {
  it('reconnait chacune des 5 pages du tunnel', () => {
    for (const expectedPage of CHECKOUT_PAGES) {
      expect(parseCheckoutPage(expectedPage)).toBe(expectedPage)
    }
  })

  it('retombe sur le panier quand le parametre est absent', () => {
    expect(parseCheckoutPage(null)).toBe('cart')
  })

  it('retombe sur le panier quand le parametre est vide', () => {
    expect(parseCheckoutPage('')).toBe('cart')
  })

  it('retombe sur le panier quand le parametre est inconnu', () => {
    expect(parseCheckoutPage('paiement')).toBe('cart')
  })

  it('ne reconnait pas une casse differente, une URL etant comparee telle quelle', () => {
    expect(parseCheckoutPage('Addresses')).toBe('cart')
  })

  it('expose les 5 pages dans l\'ordre du parcours', () => {
    expect(CHECKOUT_PAGES).toEqual(['cart', 'recap', 'addresses', 'transmission', 'success'])
  })
})
