/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  health: typeof routes['health']
  pages: {
    about: typeof routes['pages.about']
    codeOfConduct: typeof routes['pages.code_of_conduct']
  }
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
  articles: {
    index: typeof routes['articles.index']
    create: typeof routes['articles.create']
    store: typeof routes['articles.store']
    edit: typeof routes['articles.edit']
    update: typeof routes['articles.update']
    destroy: typeof routes['articles.destroy']
    like: typeof routes['articles.like']
    publish: typeof routes['articles.publish']
    unpublish: typeof routes['articles.unpublish']
    feature: typeof routes['articles.feature']
    comments: {
      store: typeof routes['articles.comments.store']
    }
    show: typeof routes['articles.show']
  }
  forum: {
    index: typeof routes['forum.index']
    create: typeof routes['forum.create']
    store: typeof routes['forum.store']
    edit: typeof routes['forum.edit']
    update: typeof routes['forum.update']
    destroy: typeof routes['forum.destroy']
    replies: {
      store: typeof routes['forum.replies.store']
    }
    solution: {
      store: typeof routes['forum.solution.store']
      destroy: typeof routes['forum.solution.destroy']
    }
    pin: typeof routes['forum.pin']
    lock: typeof routes['forum.lock']
    show: typeof routes['forum.show']
  }
  discussions: {
    index: typeof routes['discussions.index']
    create: typeof routes['discussions.create']
    store: typeof routes['discussions.store']
    edit: typeof routes['discussions.edit']
    update: typeof routes['discussions.update']
    destroy: typeof routes['discussions.destroy']
    replies: {
      store: typeof routes['discussions.replies.store']
    }
    pin: typeof routes['discussions.pin']
    lock: typeof routes['discussions.lock']
    show: typeof routes['discussions.show']
  }
  search: typeof routes['search']
  notifications: {
    index: typeof routes['notifications.index']
    readAll: typeof routes['notifications.read_all']
    read: typeof routes['notifications.read']
    show: typeof routes['notifications.show']
  }
  reports: {
    store: typeof routes['reports.store']
  }
  members: {
    index: typeof routes['members.index']
  }
  dashboard: typeof routes['dashboard']
  settings: {
    profile: typeof routes['settings.profile'] & {
      update: typeof routes['settings.profile.update']
    }
    password: typeof routes['settings.password'] & {
      update: typeof routes['settings.password.update']
    }
    account: typeof routes['settings.account'] & {
      destroy: typeof routes['settings.account.destroy']
    }
  }
  profile: {
    show: typeof routes['profile.show']
  }
  admin: {
    index: typeof routes['admin.index']
    reports: {
      index: typeof routes['admin.reports.index']
      resolve: typeof routes['admin.reports.resolve']
      dismiss: typeof routes['admin.reports.dismiss']
      destroy: typeof routes['admin.reports.destroy']
    }
    members: {
      index: typeof routes['admin.members.index']
      role: typeof routes['admin.members.role']
      ban: typeof routes['admin.members.ban']
      unban: typeof routes['admin.members.unban']
    }
    tags: {
      index: typeof routes['admin.tags.index']
      store: typeof routes['admin.tags.store']
      update: typeof routes['admin.tags.update']
      destroy: typeof routes['admin.tags.destroy']
    }
    channels: {
      index: typeof routes['admin.channels.index']
      store: typeof routes['admin.channels.store']
      update: typeof routes['admin.channels.update']
      destroy: typeof routes['admin.channels.destroy']
    }
  }
}
