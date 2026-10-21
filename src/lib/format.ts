export const roundCurrency = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100

export const formatPrice = (n: number): string =>
  roundCurrency(n).toFixed(2).replace('.', ',')
