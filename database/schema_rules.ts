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
        target_type: {
          tsType: `'article' | 'thread' | 'discussion' | 'reply'`,
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
        availability: {
          tsType: `'open_to_work' | 'freelance' | 'hiring'`,
          decorators: [{ name: '@column' }],
        },
        cv_visibility: {
          tsType: `'public' | 'members' | 'private'`,
          decorators: [{ name: '@column' }],
        },
        // Storage key of the CV (storage/cvs/<hex>.pdf): never serialized.
        cv_path: {
          tsType: `string`,
          decorators: [{ name: '@column', args: { serializeAs: null } }],
        },
        // jsonb arrays (see database/json_column.ts for prepare/consume).
        skills: {
          tsType: `string[]`,
          decorators: [{ name: '@jsonArrayColumn' }],
          imports: [{ source: '#database/json_column', namedImports: ['jsonArrayColumn'] }],
        },
        links: {
          tsType: `ProfileLink[]`,
          decorators: [{ name: '@jsonArrayColumn' }],
          imports: [
            {
              source: '#database/json_column',
              namedImports: ['jsonArrayColumn'],
              typeImports: ['ProfileLink'],
            },
          ],
        },
      },
    },
  },
} satisfies SchemaRules
