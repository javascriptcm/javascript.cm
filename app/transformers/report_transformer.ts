import type Report from '#models/report'
import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'
import UserTransformer from '#transformers/user_transformer'
import type { ReportTarget } from '#validators/report_validator'

/**
 * The reported content, as the moderation queue shows it. Titles and
 * excerpts are plain text (never HTML). Once the content is deleted, the
 * row comes from the snapshot stored on the reports (no link, no excerpt).
 */
export type ReportQueueTarget = {
  type: ReportTarget
  id: number
  /** Title of the article / thread / discussion, or the reply's excerpt ('' once deleted). */
  title: string
  /** For replies: where the reply lives (type unknown once the reply is deleted). */
  parent: { type: 'article' | 'thread' | 'discussion' | null; title: string } | null
  /** Link to the content (replies point at their "#reponse-<id>" anchor); null once deleted. */
  href: string | null
  isDraft: boolean
  deleted: boolean
}

/**
 * Attached by AdminReportsController to the latest report of each row
 * (report.$extras.queue) before serializing the moderation queue.
 */
export type ReportQueueExtras = {
  target: ReportQueueTarget
  owner: User | null
  /** Every report of the row (same content, same status), newest first. */
  reports: Report[]
  /** Mirrors User.canManageContent; false once the content is deleted. */
  canDelete: boolean
}

export default class ReportTransformer extends BaseTransformer<Report> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'reason', 'details', 'status', 'createdAt', 'resolvedAt']),
      reporter: UserTransformer.transform(this.whenLoaded(this.resource.reporter)),
      resolvedBy: UserTransformer.transform(this.whenLoaded(this.resource.resolvedBy)),
    }
  }

  /**
   * One row of the moderation queue: a piece of content and all the
   * reports it received (several reports on the same content = one row).
   */
  forQueue() {
    const queue = this.resource.$extras.queue as ReportQueueExtras
    const reasons = [...new Set(queue.reports.map((report) => report.reason))]
    return {
      ...this.toObject(),
      key: `${queue.target.type}-${queue.target.id}`,
      target: queue.target,
      owner: UserTransformer.transform(queue.owner),
      reasons,
      reportsCount: queue.reports.length,
      firstReportedAt: queue.reports[queue.reports.length - 1]?.createdAt ?? null,
      canDelete: queue.canDelete,
      // Depth counts from the top: row → reports → reporter.
      reports: ReportTransformer.transform(queue.reports).depth(2),
    }
  }
}
