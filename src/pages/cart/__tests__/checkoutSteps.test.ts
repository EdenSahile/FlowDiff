import { describe, it, expect } from 'vitest'
import { CHECKOUT_STEPS, getNextStep, getPrevStep, isLastStep, getStepIndex, getStepLabel } from '../checkoutSteps'

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
