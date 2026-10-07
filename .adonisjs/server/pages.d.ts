import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/channels': ExtractProps<(typeof import('../../inertia/pages/admin/channels.tsx'))['default']>
    'admin/index': ExtractProps<(typeof import('../../inertia/pages/admin/index.tsx'))['default']>
    'admin/members': ExtractProps<(typeof import('../../inertia/pages/admin/members.tsx'))['default']>
    'admin/tags': ExtractProps<(typeof import('../../inertia/pages/admin/tags.tsx'))['default']>
    'articles/[slug]': ExtractProps<(typeof import('../../inertia/pages/articles/[slug].tsx'))['default']>
    'articles/create': ExtractProps<(typeof import('../../inertia/pages/articles/create.tsx'))['default']>
    'articles/edit': ExtractProps<(typeof import('../../inertia/pages/articles/edit.tsx'))['default']>
    'articles/index': ExtractProps<(typeof import('../../inertia/pages/articles/index.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/register': ExtractProps<(typeof import('../../inertia/pages/auth/register.tsx'))['default']>
    'dashboard/index': ExtractProps<(typeof import('../../inertia/pages/dashboard/index.tsx'))['default']>
    'discussions/create': ExtractProps<(typeof import('../../inertia/pages/discussions/create.tsx'))['default']>
    'discussions/edit': ExtractProps<(typeof import('../../inertia/pages/discussions/edit.tsx'))['default']>
    'discussions/index': ExtractProps<(typeof import('../../inertia/pages/discussions/index.tsx'))['default']>
    'discussions/show': ExtractProps<(typeof import('../../inertia/pages/discussions/show.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'forum/create': ExtractProps<(typeof import('../../inertia/pages/forum/create.tsx'))['default']>
    'forum/edit': ExtractProps<(typeof import('../../inertia/pages/forum/edit.tsx'))['default']>
    'forum/index': ExtractProps<(typeof import('../../inertia/pages/forum/index.tsx'))['default']>
    'forum/show': ExtractProps<(typeof import('../../inertia/pages/forum/show.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'members/index': ExtractProps<(typeof import('../../inertia/pages/members/index.tsx'))['default']>
    'pages/about': ExtractProps<(typeof import('../../inertia/pages/pages/about.tsx'))['default']>
    'pages/code_of_conduct': ExtractProps<(typeof import('../../inertia/pages/pages/code_of_conduct.tsx'))['default']>
    'profile/show': ExtractProps<(typeof import('../../inertia/pages/profile/show.tsx'))['default']>
    'settings/account': ExtractProps<(typeof import('../../inertia/pages/settings/account.tsx'))['default']>
    'settings/password': ExtractProps<(typeof import('../../inertia/pages/settings/password.tsx'))['default']>
    'settings/profile': ExtractProps<(typeof import('../../inertia/pages/settings/profile.tsx'))['default']>
  }
}
