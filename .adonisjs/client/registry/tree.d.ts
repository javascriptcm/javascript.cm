/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  login: typeof routes['login'] & {
    store: typeof routes['login.store']
  }
  register: typeof routes['register'] & {
    store: typeof routes['register.store']
  }
  auth: {
    github: typeof routes['auth.github'] & {
      callback: typeof routes['auth.github.callback']
    }
  }
  logout: typeof routes['logout']
  markdown: {
    preview: typeof routes['markdown.preview']
  }
  replies: {
    update: typeof routes['replies.update']
    destroy: typeof routes['replies.destroy']
    like: typeof routes['replies.like']
  }
  seo: {
    robots: typeof routes['seo.robots']
    sitemap: typeof routes['seo.sitemap']
    feed: typeof routes['seo.feed']
  }
}
