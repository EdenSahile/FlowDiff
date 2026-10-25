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

/*
  L'etape du tunnel vit dans l'URL (`/panier?etape=...`) et non dans un state
  de composant : le bouton retour du navigateur et le bouton « Panier » de
  l'en-tete agissent sur l'URL, ils ne peuvent rien contre un state interne.
*/
export const CHECKOUT_PAGES = ['cart', ...CHECKOUT_STEPS, 'success'] as const

export type CheckoutPage = (typeof CHECKOUT_PAGES)[number]

export const STEP_QUERY_PARAM = 'etape'

export function parseCheckoutPage(raw: string | null): CheckoutPage {
  return CHECKOUT_PAGES.find(page => page === raw) ?? 'cart'
}
