import type { BookType } from './mockBooks'

function toLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`)
}

export function getParisDate(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const values = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )

  return new Date(Number(values.year), Number(values.month) - 1, Number(values.day))
}

export function getCatalogueType(publicationDate: string, referenceDate = getParisDate()): BookType {
  const publication = toLocalDate(publicationDate)
  const reference = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())

  if (publication > reference) return 'a-paraitre'

  const fondsThreshold = new Date(publication)
  fondsThreshold.setMonth(fondsThreshold.getMonth() + 6)

  return reference > fondsThreshold ? 'fonds' : 'nouveaute'
}
