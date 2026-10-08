import { BaseSchema } from '@adonisjs/lucid/schema'

const TARGETS = [
  { column: 'article_id', table: 'articles' },
  { column: 'thread_id', table: 'threads' },
  { column: 'discussion_id', table: 'discussions' },
  { column: 'reply_id', table: 'replies' },
] as const

/**
 * Moderation history survives content deletion: every report keeps the
 * identity of its target (target_type + target_id, no foreign key) and a
 * snapshot of it (label, owner). The foreign keys to the content become
 * ON DELETE SET NULL, so a deleted target leaves its reports in place.
 * At most one OPEN report per member and target (partial unique index).
 */
export default class extends BaseSchema {
  protected tableName = 'reports'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('target_type', 20).nullable()
      table.integer('target_id').nullable()
      table.string('target_label', 200).nullable()
      table
        .integer('target_owner_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
    })

    // Backfill the identity and the snapshot from the live content.
    this.schema.raw(`
      UPDATE reports SET
        target_type = CASE
          WHEN article_id IS NOT NULL THEN 'article'
          WHEN thread_id IS NOT NULL THEN 'thread'
          WHEN discussion_id IS NOT NULL THEN 'discussion'
          ELSE 'reply'
        END,
        target_id = coalesce(article_id, thread_id, discussion_id, reply_id)
    `)
    this.schema.raw(`
      UPDATE reports SET target_label = left(articles.title, 200), target_owner_id = articles.user_id
      FROM articles WHERE reports.article_id = articles.id
    `)
    this.schema.raw(`
      UPDATE reports SET target_label = left(threads.title, 200), target_owner_id = threads.user_id
      FROM threads WHERE reports.thread_id = threads.id
    `)
    this.schema.raw(`
      UPDATE reports SET target_label = left(discussions.title, 200), target_owner_id = discussions.user_id
      FROM discussions WHERE reports.discussion_id = discussions.id
    `)
    this.schema.raw(`
      UPDATE reports SET
        target_label = left(coalesce(threads.title, discussions.title, articles.title), 200),
        target_owner_id = replies.user_id
      FROM replies
      LEFT JOIN threads ON threads.id = replies.thread_id
      LEFT JOIN discussions ON discussions.id = replies.discussion_id
      LEFT JOIN articles ON articles.id = replies.article_id
      WHERE reports.reply_id = replies.id
    `)

    this.schema.alterTable(this.tableName, (table) => {
      table.string('target_type', 20).notNullable().alter()
      table.integer('target_id').notNullable().alter()

      for (const target of TARGETS) {
        table.dropForeign([target.column])
        table.foreign(target.column).references('id').inTable(target.table).onDelete('SET NULL')
      }

      table.index(['target_type', 'target_id'])
    })

    this.schema.raw('ALTER TABLE reports DROP CONSTRAINT reports_single_target')
    this.schema.raw(
      'ALTER TABLE reports ADD CONSTRAINT reports_single_target CHECK (num_nonnulls(article_id, thread_id, discussion_id, reply_id) <= 1)'
    )
    this.schema.raw(
      `ALTER TABLE reports ADD CONSTRAINT reports_target_type_check CHECK (target_type IN ('article', 'thread', 'discussion', 'reply'))`
    )
    this.schema.raw(
      `CREATE UNIQUE INDEX reports_open_unique ON reports (reporter_id, target_type, target_id) WHERE status = 'open'`
    )
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS reports_open_unique')
    this.schema.raw('ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_target_type_check')
    this.schema.raw('ALTER TABLE reports DROP CONSTRAINT reports_single_target')

    // Reports whose content is gone cannot point at anything any more.
    this.schema.raw(
      'DELETE FROM reports WHERE num_nonnulls(article_id, thread_id, discussion_id, reply_id) = 0'
    )
    this.schema.raw(
      'ALTER TABLE reports ADD CONSTRAINT reports_single_target CHECK (num_nonnulls(article_id, thread_id, discussion_id, reply_id) = 1)'
    )

    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['target_type', 'target_id'])

      for (const target of TARGETS) {
        table.dropForeign([target.column])
        table.foreign(target.column).references('id').inTable(target.table).onDelete('CASCADE')
      }

      table.dropForeign(['target_owner_id'])
      table.dropColumn('target_owner_id')
      table.dropColumn('target_label')
      table.dropColumn('target_id')
      table.dropColumn('target_type')
    })
  }
}
