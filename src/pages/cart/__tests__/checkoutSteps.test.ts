import { describe, it, expect } from 'vitest'
import { CHECKOUT_PAGES, CHECKOUT_STEPS, getNextStep, getPrevStep, isLastStep, getStepIndex, getStepLabel, parseCheckoutPage } from '../checkoutSteps'

describe('checkout stepper', () => {
  it('defines the two remaining steps in order', () => {
    expect(CHECKOUT_STEPS).toEqual(['addresses', 'recap'])
  })

  it('navigates from addresses to the verification screen', () => {
    expect(getStepIndex('addresses')).toBe(0)
    expect(getNextStep('addresses')).toBe('recap')
    expect(getPrevStep('recap')).toBe('addresses')
    expect(isLastStep('recap')).toBe(true)
  })

  it('keeps labels for each step', () => {
    for (const step of CHECKOUT_STEPS) expect(getStepLabel(step).length).toBeGreaterThan(0)
  })
})

describe('parseCheckoutPage', () => {
  it('reads valid pages and falls back to cart for invalid values', () => {
    for (const page of CHECKOUT_PAGES) expect(parseCheckoutPage(page)).toBe(page)
    expect(parseCheckoutPage(null)).toBe('cart')
    expect(parseCheckoutPage('paiement')).toBe('cart')
  })

  it('redirects the removed transmission URL to addresses', () => {
    expect(parseCheckoutPage('transmission')).toBe('addresses')
  })
})
