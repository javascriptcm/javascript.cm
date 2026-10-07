const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' })
const numberFmt = new Intl.NumberFormat('fr-FR')

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['week', 60 * 60 * 24 * 7],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
]

/** "il y a 3 heures", "hier", "à l’instant" */
export function timeAgo(value: string | Date | null | undefined) {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  const seconds = (date.getTime() - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'à l’instant'
}

/** "7 octobre 2026" */
export function formatDate(value: string | Date | null | undefined) {
  if (!value) return ''
  return dateFmt.format(typeof value === 'string' ? new Date(value) : value)
}

/** "07 oct." */
export function formatShortDate(value: string | Date | null | undefined) {
  if (!value) return ''
  return shortFmt.format(typeof value === 'string' ? new Date(value) : value)
}

export function formatNumber(value: number) {
  return numberFmt.format(value)
}

/** "1 réponse" / "3 réponses" / "aucune réponse" */
export function plural(count: number, singular: string, pluralForm?: string, zero?: string) {
  if (count === 0 && zero) return zero
  return `${formatNumber(count)} ${count > 1 ? (pluralForm ?? `${singular}s`) : singular}`
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
