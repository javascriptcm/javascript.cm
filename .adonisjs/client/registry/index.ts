/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'health': {
    methods: ["GET","HEAD"],
    pattern: '/up',
    tokens: [{"old":"/up","type":0,"val":"up","end":""}],
    types: placeholder as Registry['health']['types'],
  },
  'pages.about': {
    methods: ["GET","HEAD"],
    pattern: '/a-propos',
    tokens: [{"old":"/a-propos","type":0,"val":"a-propos","end":""}],
    types: placeholder as Registry['pages.about']['types'],
  },
  'pages.code_of_conduct': {
    methods: ["GET","HEAD"],
    pattern: '/code-de-conduite',
    tokens: [{"old":"/code-de-conduite","type":0,"val":"code-de-conduite","end":""}],
    types: placeholder as Registry['pages.code_of_conduct']['types'],
  },
  'login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['login']['types'],
  },
  'login.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['login.store']['types'],
  },
  'register': {
    methods: ["GET","HEAD"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['register']['types'],
  },
  'register.store': {
    methods: ["POST"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['register.store']['types'],
  },
  'auth.github': {
    methods: ["GET","HEAD"],
    pattern: '/auth/github',
    tokens: [{"old":"/auth/github","type":0,"val":"auth","end":""},{"old":"/auth/github","type":0,"val":"github","end":""}],
    types: placeholder as Registry['auth.github']['types'],
  },
  'auth.github.callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/github/callback',
    tokens: [{"old":"/auth/github/callback","type":0,"val":"auth","end":""},{"old":"/auth/github/callback","type":0,"val":"github","end":""},{"old":"/auth/github/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.github.callback']['types'],
  },
  'logout': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['logout']['types'],
  },
  'markdown.preview': {
    methods: ["POST"],
    pattern: '/markdown/preview',
    tokens: [{"old":"/markdown/preview","type":0,"val":"markdown","end":""},{"old":"/markdown/preview","type":0,"val":"preview","end":""}],
    types: placeholder as Registry['markdown.preview']['types'],
  },
  'replies.update': {
    methods: ["PUT"],
    pattern: '/replies/:id',
    tokens: [{"old":"/replies/:id","type":0,"val":"replies","end":""},{"old":"/replies/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['replies.update']['types'],
  },
  'replies.destroy': {
    methods: ["DELETE"],
    pattern: '/replies/:id',
    tokens: [{"old":"/replies/:id","type":0,"val":"replies","end":""},{"old":"/replies/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['replies.destroy']['types'],
  },
  'replies.like': {
    methods: ["POST"],
    pattern: '/replies/:id/like',
    tokens: [{"old":"/replies/:id/like","type":0,"val":"replies","end":""},{"old":"/replies/:id/like","type":1,"val":"id","end":""},{"old":"/replies/:id/like","type":0,"val":"like","end":""}],
    types: placeholder as Registry['replies.like']['types'],
  },
  'seo.robots': {
    methods: ["GET","HEAD"],
    pattern: '/robots.txt',
    tokens: [{"old":"/robots.txt","type":0,"val":"robots.txt","end":""}],
    types: placeholder as Registry['seo.robots']['types'],
  },
  'seo.sitemap': {
    methods: ["GET","HEAD"],
    pattern: '/sitemap.xml',
    tokens: [{"old":"/sitemap.xml","type":0,"val":"sitemap.xml","end":""}],
    types: placeholder as Registry['seo.sitemap']['types'],
  },
  'seo.feed': {
    methods: ["GET","HEAD"],
    pattern: '/feed.xml',
    tokens: [{"old":"/feed.xml","type":0,"val":"feed.xml","end":""}],
    types: placeholder as Registry['seo.feed']['types'],
  },
  'articles.index': {
    methods: ["GET","HEAD"],
    pattern: '/articles',
    tokens: [{"old":"/articles","type":0,"val":"articles","end":""}],
    types: placeholder as Registry['articles.index']['types'],
  },
  'articles.create': {
    methods: ["GET","HEAD"],
    pattern: '/articles/nouveau',
    tokens: [{"old":"/articles/nouveau","type":0,"val":"articles","end":""},{"old":"/articles/nouveau","type":0,"val":"nouveau","end":""}],
    types: placeholder as Registry['articles.create']['types'],
  },
  'articles.store': {
    methods: ["POST"],
    pattern: '/articles',
    tokens: [{"old":"/articles","type":0,"val":"articles","end":""}],
    types: placeholder as Registry['articles.store']['types'],
  },
  'articles.edit': {
    methods: ["GET","HEAD"],
    pattern: '/articles/:slug/modifier',
    tokens: [{"old":"/articles/:slug/modifier","type":0,"val":"articles","end":""},{"old":"/articles/:slug/modifier","type":1,"val":"slug","end":""},{"old":"/articles/:slug/modifier","type":0,"val":"modifier","end":""}],
    types: placeholder as Registry['articles.edit']['types'],
  },
  'articles.update': {
    methods: ["PUT"],
    pattern: '/articles/:slug',
    tokens: [{"old":"/articles/:slug","type":0,"val":"articles","end":""},{"old":"/articles/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['articles.update']['types'],
  },
  'articles.destroy': {
    methods: ["DELETE"],
    pattern: '/articles/:slug',
    tokens: [{"old":"/articles/:slug","type":0,"val":"articles","end":""},{"old":"/articles/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['articles.destroy']['types'],
  },
  'articles.like': {
    methods: ["POST"],
    pattern: '/articles/:slug/like',
    tokens: [{"old":"/articles/:slug/like","type":0,"val":"articles","end":""},{"old":"/articles/:slug/like","type":1,"val":"slug","end":""},{"old":"/articles/:slug/like","type":0,"val":"like","end":""}],
    types: placeholder as Registry['articles.like']['types'],
  },
  'articles.publish': {
    methods: ["POST"],
    pattern: '/articles/:slug/publish',
    tokens: [{"old":"/articles/:slug/publish","type":0,"val":"articles","end":""},{"old":"/articles/:slug/publish","type":1,"val":"slug","end":""},{"old":"/articles/:slug/publish","type":0,"val":"publish","end":""}],
    types: placeholder as Registry['articles.publish']['types'],
  },
  'articles.unpublish': {
    methods: ["POST"],
    pattern: '/articles/:slug/unpublish',
    tokens: [{"old":"/articles/:slug/unpublish","type":0,"val":"articles","end":""},{"old":"/articles/:slug/unpublish","type":1,"val":"slug","end":""},{"old":"/articles/:slug/unpublish","type":0,"val":"unpublish","end":""}],
    types: placeholder as Registry['articles.unpublish']['types'],
  },
  'articles.feature': {
    methods: ["POST"],
    pattern: '/articles/:slug/feature',
    tokens: [{"old":"/articles/:slug/feature","type":0,"val":"articles","end":""},{"old":"/articles/:slug/feature","type":1,"val":"slug","end":""},{"old":"/articles/:slug/feature","type":0,"val":"feature","end":""}],
    types: placeholder as Registry['articles.feature']['types'],
  },
  'articles.comments.store': {
    methods: ["POST"],
    pattern: '/articles/:slug/comments',
    tokens: [{"old":"/articles/:slug/comments","type":0,"val":"articles","end":""},{"old":"/articles/:slug/comments","type":1,"val":"slug","end":""},{"old":"/articles/:slug/comments","type":0,"val":"comments","end":""}],
    types: placeholder as Registry['articles.comments.store']['types'],
  },
  'articles.show': {
    methods: ["GET","HEAD"],
    pattern: '/articles/:slug',
    tokens: [{"old":"/articles/:slug","type":0,"val":"articles","end":""},{"old":"/articles/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['articles.show']['types'],
  },
  'forum.index': {
    methods: ["GET","HEAD"],
    pattern: '/forum',
    tokens: [{"old":"/forum","type":0,"val":"forum","end":""}],
    types: placeholder as Registry['forum.index']['types'],
  },
  'forum.create': {
    methods: ["GET","HEAD"],
    pattern: '/forum/nouveau',
    tokens: [{"old":"/forum/nouveau","type":0,"val":"forum","end":""},{"old":"/forum/nouveau","type":0,"val":"nouveau","end":""}],
    types: placeholder as Registry['forum.create']['types'],
  },
  'forum.store': {
    methods: ["POST"],
    pattern: '/forum',
    tokens: [{"old":"/forum","type":0,"val":"forum","end":""}],
    types: placeholder as Registry['forum.store']['types'],
  },
  'forum.edit': {
    methods: ["GET","HEAD"],
    pattern: '/forum/:slug/modifier',
    tokens: [{"old":"/forum/:slug/modifier","type":0,"val":"forum","end":""},{"old":"/forum/:slug/modifier","type":1,"val":"slug","end":""},{"old":"/forum/:slug/modifier","type":0,"val":"modifier","end":""}],
    types: placeholder as Registry['forum.edit']['types'],
  },
  'forum.update': {
    methods: ["PUT"],
    pattern: '/forum/:slug',
    tokens: [{"old":"/forum/:slug","type":0,"val":"forum","end":""},{"old":"/forum/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['forum.update']['types'],
  },
  'forum.destroy': {
    methods: ["DELETE"],
    pattern: '/forum/:slug',
    tokens: [{"old":"/forum/:slug","type":0,"val":"forum","end":""},{"old":"/forum/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['forum.destroy']['types'],
  },
  'forum.replies.store': {
    methods: ["POST"],
    pattern: '/forum/:slug/replies',
    tokens: [{"old":"/forum/:slug/replies","type":0,"val":"forum","end":""},{"old":"/forum/:slug/replies","type":1,"val":"slug","end":""},{"old":"/forum/:slug/replies","type":0,"val":"replies","end":""}],
    types: placeholder as Registry['forum.replies.store']['types'],
  },
  'forum.solution.store': {
    methods: ["POST"],
    pattern: '/forum/:slug/solution',
    tokens: [{"old":"/forum/:slug/solution","type":0,"val":"forum","end":""},{"old":"/forum/:slug/solution","type":1,"val":"slug","end":""},{"old":"/forum/:slug/solution","type":0,"val":"solution","end":""}],
    types: placeholder as Registry['forum.solution.store']['types'],
  },
  'forum.solution.destroy': {
    methods: ["DELETE"],
    pattern: '/forum/:slug/solution',
    tokens: [{"old":"/forum/:slug/solution","type":0,"val":"forum","end":""},{"old":"/forum/:slug/solution","type":1,"val":"slug","end":""},{"old":"/forum/:slug/solution","type":0,"val":"solution","end":""}],
    types: placeholder as Registry['forum.solution.destroy']['types'],
  },
  'forum.pin': {
    methods: ["POST"],
    pattern: '/forum/:slug/pin',
    tokens: [{"old":"/forum/:slug/pin","type":0,"val":"forum","end":""},{"old":"/forum/:slug/pin","type":1,"val":"slug","end":""},{"old":"/forum/:slug/pin","type":0,"val":"pin","end":""}],
    types: placeholder as Registry['forum.pin']['types'],
  },
  'forum.lock': {
    methods: ["POST"],
    pattern: '/forum/:slug/lock',
    tokens: [{"old":"/forum/:slug/lock","type":0,"val":"forum","end":""},{"old":"/forum/:slug/lock","type":1,"val":"slug","end":""},{"old":"/forum/:slug/lock","type":0,"val":"lock","end":""}],
    types: placeholder as Registry['forum.lock']['types'],
  },
  'forum.show': {
    methods: ["GET","HEAD"],
    pattern: '/forum/:slug',
    tokens: [{"old":"/forum/:slug","type":0,"val":"forum","end":""},{"old":"/forum/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['forum.show']['types'],
  },
  'discussions.index': {
    methods: ["GET","HEAD"],
    pattern: '/discussions',
    tokens: [{"old":"/discussions","type":0,"val":"discussions","end":""}],
    types: placeholder as Registry['discussions.index']['types'],
  },
  'discussions.create': {
    methods: ["GET","HEAD"],
    pattern: '/discussions/nouvelle',
    tokens: [{"old":"/discussions/nouvelle","type":0,"val":"discussions","end":""},{"old":"/discussions/nouvelle","type":0,"val":"nouvelle","end":""}],
    types: placeholder as Registry['discussions.create']['types'],
  },
  'discussions.store': {
    methods: ["POST"],
    pattern: '/discussions',
    tokens: [{"old":"/discussions","type":0,"val":"discussions","end":""}],
    types: placeholder as Registry['discussions.store']['types'],
  },
  'discussions.edit': {
    methods: ["GET","HEAD"],
    pattern: '/discussions/:slug/modifier',
    tokens: [{"old":"/discussions/:slug/modifier","type":0,"val":"discussions","end":""},{"old":"/discussions/:slug/modifier","type":1,"val":"slug","end":""},{"old":"/discussions/:slug/modifier","type":0,"val":"modifier","end":""}],
    types: placeholder as Registry['discussions.edit']['types'],
  },
  'discussions.update': {
    methods: ["PUT"],
    pattern: '/discussions/:slug',
    tokens: [{"old":"/discussions/:slug","type":0,"val":"discussions","end":""},{"old":"/discussions/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['discussions.update']['types'],
  },
  'discussions.destroy': {
    methods: ["DELETE"],
    pattern: '/discussions/:slug',
    tokens: [{"old":"/discussions/:slug","type":0,"val":"discussions","end":""},{"old":"/discussions/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['discussions.destroy']['types'],
  },
  'discussions.replies.store': {
    methods: ["POST"],
    pattern: '/discussions/:slug/replies',
    tokens: [{"old":"/discussions/:slug/replies","type":0,"val":"discussions","end":""},{"old":"/discussions/:slug/replies","type":1,"val":"slug","end":""},{"old":"/discussions/:slug/replies","type":0,"val":"replies","end":""}],
    types: placeholder as Registry['discussions.replies.store']['types'],
  },
  'discussions.pin': {
    methods: ["POST"],
    pattern: '/discussions/:slug/pin',
    tokens: [{"old":"/discussions/:slug/pin","type":0,"val":"discussions","end":""},{"old":"/discussions/:slug/pin","type":1,"val":"slug","end":""},{"old":"/discussions/:slug/pin","type":0,"val":"pin","end":""}],
    types: placeholder as Registry['discussions.pin']['types'],
  },
  'discussions.lock': {
    methods: ["POST"],
    pattern: '/discussions/:slug/lock',
    tokens: [{"old":"/discussions/:slug/lock","type":0,"val":"discussions","end":""},{"old":"/discussions/:slug/lock","type":1,"val":"slug","end":""},{"old":"/discussions/:slug/lock","type":0,"val":"lock","end":""}],
    types: placeholder as Registry['discussions.lock']['types'],
  },
  'discussions.show': {
    methods: ["GET","HEAD"],
    pattern: '/discussions/:slug',
    tokens: [{"old":"/discussions/:slug","type":0,"val":"discussions","end":""},{"old":"/discussions/:slug","type":1,"val":"slug","end":""}],
    types: placeholder as Registry['discussions.show']['types'],
  },
  'members.index': {
    methods: ["GET","HEAD"],
    pattern: '/membres',
    tokens: [{"old":"/membres","type":0,"val":"membres","end":""}],
    types: placeholder as Registry['members.index']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'settings.profile': {
    methods: ["GET","HEAD"],
    pattern: '/settings',
    tokens: [{"old":"/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['settings.profile']['types'],
  },
  'settings.profile.update': {
    methods: ["PUT"],
    pattern: '/settings',
    tokens: [{"old":"/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['settings.profile.update']['types'],
  },
  'settings.password': {
    methods: ["GET","HEAD"],
    pattern: '/settings/password',
    tokens: [{"old":"/settings/password","type":0,"val":"settings","end":""},{"old":"/settings/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['settings.password']['types'],
  },
  'settings.password.update': {
    methods: ["PUT"],
    pattern: '/settings/password',
    tokens: [{"old":"/settings/password","type":0,"val":"settings","end":""},{"old":"/settings/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['settings.password.update']['types'],
  },
  'settings.account': {
    methods: ["GET","HEAD"],
    pattern: '/settings/account',
    tokens: [{"old":"/settings/account","type":0,"val":"settings","end":""},{"old":"/settings/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['settings.account']['types'],
  },
  'settings.account.destroy': {
    methods: ["DELETE"],
    pattern: '/settings/account',
    tokens: [{"old":"/settings/account","type":0,"val":"settings","end":""},{"old":"/settings/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['settings.account.destroy']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/:username',
    tokens: [{"old":"/:username","type":1,"val":"username","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'admin.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [{"old":"/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['admin.index']['types'],
  },
  'admin.members.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/membres',
    tokens: [{"old":"/admin/membres","type":0,"val":"admin","end":""},{"old":"/admin/membres","type":0,"val":"membres","end":""}],
    types: placeholder as Registry['admin.members.index']['types'],
  },
  'admin.members.role': {
    methods: ["PUT"],
    pattern: '/admin/membres/:id/role',
    tokens: [{"old":"/admin/membres/:id/role","type":0,"val":"admin","end":""},{"old":"/admin/membres/:id/role","type":0,"val":"membres","end":""},{"old":"/admin/membres/:id/role","type":1,"val":"id","end":""},{"old":"/admin/membres/:id/role","type":0,"val":"role","end":""}],
    types: placeholder as Registry['admin.members.role']['types'],
  },
  'admin.members.ban': {
    methods: ["POST"],
    pattern: '/admin/membres/:id/ban',
    tokens: [{"old":"/admin/membres/:id/ban","type":0,"val":"admin","end":""},{"old":"/admin/membres/:id/ban","type":0,"val":"membres","end":""},{"old":"/admin/membres/:id/ban","type":1,"val":"id","end":""},{"old":"/admin/membres/:id/ban","type":0,"val":"ban","end":""}],
    types: placeholder as Registry['admin.members.ban']['types'],
  },
  'admin.members.unban': {
    methods: ["DELETE"],
    pattern: '/admin/membres/:id/ban',
    tokens: [{"old":"/admin/membres/:id/ban","type":0,"val":"admin","end":""},{"old":"/admin/membres/:id/ban","type":0,"val":"membres","end":""},{"old":"/admin/membres/:id/ban","type":1,"val":"id","end":""},{"old":"/admin/membres/:id/ban","type":0,"val":"ban","end":""}],
    types: placeholder as Registry['admin.members.unban']['types'],
  },
  'admin.tags.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/tags',
    tokens: [{"old":"/admin/tags","type":0,"val":"admin","end":""},{"old":"/admin/tags","type":0,"val":"tags","end":""}],
    types: placeholder as Registry['admin.tags.index']['types'],
  },
  'admin.tags.store': {
    methods: ["POST"],
    pattern: '/admin/tags',
    tokens: [{"old":"/admin/tags","type":0,"val":"admin","end":""},{"old":"/admin/tags","type":0,"val":"tags","end":""}],
    types: placeholder as Registry['admin.tags.store']['types'],
  },
  'admin.tags.update': {
    methods: ["PUT"],
    pattern: '/admin/tags/:id',
    tokens: [{"old":"/admin/tags/:id","type":0,"val":"admin","end":""},{"old":"/admin/tags/:id","type":0,"val":"tags","end":""},{"old":"/admin/tags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.tags.update']['types'],
  },
  'admin.tags.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/tags/:id',
    tokens: [{"old":"/admin/tags/:id","type":0,"val":"admin","end":""},{"old":"/admin/tags/:id","type":0,"val":"tags","end":""},{"old":"/admin/tags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.tags.destroy']['types'],
  },
  'admin.channels.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/canaux',
    tokens: [{"old":"/admin/canaux","type":0,"val":"admin","end":""},{"old":"/admin/canaux","type":0,"val":"canaux","end":""}],
    types: placeholder as Registry['admin.channels.index']['types'],
  },
  'admin.channels.store': {
    methods: ["POST"],
    pattern: '/admin/canaux',
    tokens: [{"old":"/admin/canaux","type":0,"val":"admin","end":""},{"old":"/admin/canaux","type":0,"val":"canaux","end":""}],
    types: placeholder as Registry['admin.channels.store']['types'],
  },
  'admin.channels.update': {
    methods: ["PUT"],
    pattern: '/admin/canaux/:id',
    tokens: [{"old":"/admin/canaux/:id","type":0,"val":"admin","end":""},{"old":"/admin/canaux/:id","type":0,"val":"canaux","end":""},{"old":"/admin/canaux/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.channels.update']['types'],
  },
  'admin.channels.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/canaux/:id',
    tokens: [{"old":"/admin/canaux/:id","type":0,"val":"admin","end":""},{"old":"/admin/canaux/:id","type":0,"val":"canaux","end":""},{"old":"/admin/canaux/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.channels.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
