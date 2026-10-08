import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    notifications: {
      columns: {
        type: {
          tsType: `'thread_reply' | 'discussion_reply' | 'article_comment' | 'solution_accepted'`,
          decorators: [{ name: '@column' }],
        },
      },
    },
    reports: {
      columns: {
        reason: {
          tsType: `'spam' | 'abuse' | 'off_topic' | 'other'`,
          decorators: [{ name: '@column' }],
        },
        status: {
          tsType: `'open' | 'resolved' | 'dismissed'`,
          decorators: [{ name: '@column' }],
        },
      },
    },
    users: {
      columns: {
        role: {
          tsType: `'member' | 'moderator' | 'admin'`,
          decorators: [{ name: '@column' }],
        },
      },
    },
  },
} satisfies SchemaRules
