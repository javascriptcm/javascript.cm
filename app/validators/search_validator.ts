import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { SEARCH_TYPES } from '#services/search'

/**
 * GET /recherche — query string. An empty "q" never reaches the validator
 * (it shows the landing state instead).
 */
export const searchValidator = vine.create({
  q: vine
    .string()
    .trim()
    .minLength(2)
    .maxLength(100)
    // French keyboards and autocorrect type « » or “ ”: same as "phrase".
    .transform((value) =>
      value
        .replace(/[«»“”„]/g, '"')
        .replace(/"\s*([^"]*?)\s*"/g, '"$1"')
        .replace(/\s+/g, ' ')
    ),
  type: vine.enum(SEARCH_TYPES).optional(),
  page: vine.number().withoutDecimals().min(1).max(1000).optional(),
})

export const searchMessages = new SimpleMessagesProvider({
  'q.minLength': 'Saisissez au moins 2 caractères.',
  'q.maxLength': 'Votre recherche dépasse 100 caractères : raccourcissez-la.',
  'q.string': 'Recherche invalide.',
})
