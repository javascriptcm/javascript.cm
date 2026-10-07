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
