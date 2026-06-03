export const CHECKOUT_STEPS = ['recap', 'addresses', 'transmission'] as const

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number]

const STEP_LABELS: Record<CheckoutStep, string> = {
  'recap':        'Récapitulatif',
  'addresses':    'Adresses',
  'transmission': 'Mode de transmission',
}

export function getStepIndex(step: CheckoutStep): number {
  return CHECKOUT_STEPS.indexOf(step)
}

export function getNextStep(step: CheckoutStep): CheckoutStep | null {
  const idx = getStepIndex(step)
  return idx < CHECKOUT_STEPS.length - 1 ? CHECKOUT_STEPS[idx + 1] : null
}

export function getPrevStep(step: CheckoutStep): CheckoutStep | null {
  const idx = getStepIndex(step)
  return idx > 0 ? CHECKOUT_STEPS[idx - 1] : null
}

export function isLastStep(step: CheckoutStep): boolean {
  return step === CHECKOUT_STEPS[CHECKOUT_STEPS.length - 1]
}

export function getStepLabel(step: CheckoutStep): string {
  return STEP_LABELS[step]
}
