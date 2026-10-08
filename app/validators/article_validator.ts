import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import type { FieldContext, MessagesProviderContact } from '@vinejs/vine/types'

/**
 * Treat blank strings as "not provided" (optional fields sent by forms).
 */
const blankToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value

export const ARTICLE_LIMITS = {
  titleMin: 10,
  titleMax: 160,
  excerptMax: 300,
  bodyMin: 100,
  bodyMax: 100_000,
  tagsMax: 4,
} as const

/**
 * Create / update an article. `publish` is the submit intent:
 * true = published (first publication sets the date), false = draft.
 */
export const articleValidator = vine.create({
  title: vine.string().trim().minLength(ARTICLE_LIMITS.titleMin).maxLength(ARTICLE_LIMITS.titleMax),
  excerpt: vine
    .string()
    .parse(blankToNull)
    .trim()
    .maxLength(ARTICLE_LIMITS.excerptMax)
    .nullable()
    .optional(),
  coverUrl: vine
    .string()
    .parse(blankToNull)
    .trim()
    .url({ protocols: ['https'], require_protocol: true, require_valid_protocol: true })
    .maxLength(500)
    .nullable()
    .optional(),
  tags: vine
    .array(vine.number().withoutDecimals().positive())
    .maxLength(ARTICLE_LIMITS.tagsMax)
    .optional(),
  body: vine.string().trim().minLength(ARTICLE_LIMITS.bodyMin).maxLength(ARTICLE_LIMITS.bodyMax),
  publish: vine.boolean(),
})

/**
 * Field-specific French messages, falling back to the global provider
 * (start/validator.ts) for everything else.
 */
const ARTICLE_MESSAGES: Record<string, string> = {
  'title.required': 'Donnez un titre à votre article.',
  'title.minLength': 'Un titre explicite fait au moins {{ min }} caractères.',
  'title.maxLength': 'Le titre ne doit pas dépasser {{ max }} caractères.',
  'excerpt.maxLength': 'Le chapô ne doit pas dépasser {{ max }} caractères.',
  'coverUrl.url': 'L’image de couverture doit être une adresse https://… valide.',
  'coverUrl.maxLength': 'Cette adresse d’image est trop longue (500 caractères au plus).',
  'tags.array.maxLength': 'Choisissez au plus {{ max }} tags.',
  'tags.*.number': 'Tag inconnu.',
  'tags.*.withoutDecimals': 'Tag inconnu.',
  'tags.*.positive': 'Tag inconnu.',
  'body.required': 'L’article est vide.',
  'body.minLength': 'Développez encore un peu : au moins {{ min }} caractères.',
  'body.maxLength': 'L’article est trop long ({{ max }} caractères au plus).',
}

const articleMessages = new SimpleMessagesProvider(ARTICLE_MESSAGES)

class ArticleMessagesProvider implements MessagesProviderContact {
  getMessage(rawMessage: string, rule: string, field: FieldContext, args?: Record<string, any>) {
    const hasSpecific =
      `${field.getFieldPath()}.${rule}` in ARTICLE_MESSAGES ||
      `${field.wildCardPath}.${rule}` in ARTICLE_MESSAGES
    return (hasSpecific ? articleMessages : vine.messagesProvider).getMessage(
      rawMessage,
      rule,
      field,
      args
    )
  }
}

articleValidator.messagesProvider = new ArticleMessagesProvider()
