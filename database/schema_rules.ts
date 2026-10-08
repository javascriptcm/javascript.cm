import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    jobs: {
      columns: {
        remote: { tsType: `'onsite' | 'hybrid' | 'remote'`, decorators: [{ name: '@column' }] },
        contract: {
          tsType: `'cdi' | 'cdd' | 'freelance' | 'stage' | 'alternance'`,
          decorators: [{ name: '@column' }],
        },
        salary_period: {
          tsType: `'month' | 'year' | 'day' | 'project'`,
          decorators: [{ name: '@column' }],
        },
        status: {
          tsType: `'pending' | 'published' | 'rejected' | 'expired' | 'closed'`,
          decorators: [{ name: '@column' }],
        },
        skills: {
          tsType: `string[]`,
          decorators: [{ name: '@jsonArrayColumn' }],
          imports: [{ source: '#database/json_column', namedImports: ['jsonArrayColumn'] }],
        },
      },
    },
    events: {
      columns: {
        format: { tsType: `'in_person' | 'online' | 'hybrid'`, decorators: [{ name: '@column' }] },
        status: {
          tsType: `'draft' | 'published' | 'cancelled'`,
          decorators: [{ name: '@column' }],
        },
      },
    },
    event_registrations: {
      columns: {
        status: { tsType: `'going' | 'waitlist' | 'cancelled'`, decorators: [{ name: '@column' }] },
      },
    },
    learning_paths: {
      columns: {
        level: {
          tsType: `'debutant' | 'intermediaire' | 'avance'`,
          decorators: [{ name: '@column' }],
        },
      },
    },
    user_tokens: {
      columns: {
        type: {
          tsType: `'password_reset' | 'email_verification'`,
          decorators: [{ name: '@column' }],
        },
        token_hash: {
          tsType: `string`,
          decorators: [{ name: '@column', args: { serializeAs: null } }],
        },
      },
    },
    sponsors: {
      columns: {
        tier: {
          tsType: `'platinum' | 'gold' | 'silver' | 'community'`,
          decorators: [{ name: '@column' }],
        },
      },
    },
    notifications: {
      columns: {
        type: {
          tsType: `'thread_reply' | 'discussion_reply' | 'article_comment' | 'solution_accepted' | 'job_approved' | 'job_rejected' | 'event_reminder' | 'event_promoted' | 'event_cancelled'`,
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
        locale: {
          tsType: `'fr' | 'en'`,
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
