import vine from '@vinejs/vine'
import { withMessages } from '#validators/settings_validator'

/**
 * What members can report (reports.target_type).
 */
export const REPORT_TARGETS = ['article', 'thread', 'discussion', 'reply'] as const
export type ReportTarget = (typeof REPORT_TARGETS)[number]

export const REPORT_REASONS = ['spam', 'abuse', 'off_topic', 'other'] as const

/**
 * POST /signalements — details are optional, except for "other".
 */
export const reportValidator = withMessages(
  vine.create({
    target: vine.enum(REPORT_TARGETS),
    id: vine.number().withoutDecimals().positive(),
    reason: vine.enum(REPORT_REASONS),
    details: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(500)
      .optional()
      .requiredWhen('reason', '=', 'other'),
  }),
  {
    'reason.required': 'Choisissez un motif.',
    'reason.enum': 'Choisissez un motif.',
    'details.required': 'Précisez en quelques mots ce qui pose problème.',
    'details.minLength': 'Quelques mots de plus, s’il vous plaît.',
    'details.maxLength': '500 caractères au maximum.',
  }
)
