import logger from '@adonisjs/core/services/logger'

/**
 * Transactional e-mail entry point used by every feature (password reset,
 * event reminders, job moderation, digests…).
 *
 * Placeholder until the mail integration lands: it only logs. The e-mail
 * implementation replaces the body of `sendMail` (keep the signature).
 */
export type MailMessage = {
  to: string
  subject: string
  /** Edge template under resources/views/emails/ (without extension) */
  template: string
  data?: Record<string, unknown>
}

export async function sendMail(message: MailMessage): Promise<void> {
  logger.info(
    { to: message.to, subject: message.subject, template: message.template },
    'mail (not sent: mailer not configured)'
  )
}
