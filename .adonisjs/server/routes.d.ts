import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'pages.about': { paramsTuple?: []; params?: {} }
    'pages.code_of_conduct': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'login.store': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'register.store': { paramsTuple?: []; params?: {} }
    'auth.github': { paramsTuple?: []; params?: {} }
    'auth.github.callback': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'markdown.preview': { paramsTuple?: []; params?: {} }
    'replies.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'replies.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'replies.like': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.feed': { paramsTuple?: []; params?: {} }
    'articles.index': { paramsTuple?: []; params?: {} }
    'articles.create': { paramsTuple?: []; params?: {} }
    'articles.store': { paramsTuple?: []; params?: {} }
    'articles.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.like': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.publish': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.unpublish': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.feature': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.comments.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.index': { paramsTuple?: []; params?: {} }
    'forum.create': { paramsTuple?: []; params?: {} }
    'forum.store': { paramsTuple?: []; params?: {} }
    'forum.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.replies.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.solution.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.solution.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.pin': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.lock': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.index': { paramsTuple?: []; params?: {} }
    'discussions.create': { paramsTuple?: []; params?: {} }
    'discussions.store': { paramsTuple?: []; params?: {} }
    'discussions.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.replies.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.pin': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.lock': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.read_all': { paramsTuple?: []; params?: {} }
    'notifications.read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.store': { paramsTuple?: []; params?: {} }
    'members.index': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'settings.profile': { paramsTuple?: []; params?: {} }
    'settings.profile.update': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.password.update': { paramsTuple?: []; params?: {} }
    'settings.account': { paramsTuple?: []; params?: {} }
    'settings.account.destroy': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'admin.index': { paramsTuple?: []; params?: {} }
    'admin.reports.index': { paramsTuple?: []; params?: {} }
    'admin.reports.resolve': { paramsTuple: [ParamValue,ParamValue]; params: {'target': ParamValue,'id': ParamValue} }
    'admin.reports.dismiss': { paramsTuple: [ParamValue,ParamValue]; params: {'target': ParamValue,'id': ParamValue} }
    'admin.reports.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'target': ParamValue,'id': ParamValue} }
    'admin.members.index': { paramsTuple?: []; params?: {} }
    'admin.members.role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.members.ban': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.members.unban': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.index': { paramsTuple?: []; params?: {} }
    'admin.tags.store': { paramsTuple?: []; params?: {} }
    'admin.tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.channels.index': { paramsTuple?: []; params?: {} }
    'admin.channels.store': { paramsTuple?: []; params?: {} }
    'admin.channels.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.channels.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'pages.about': { paramsTuple?: []; params?: {} }
    'pages.code_of_conduct': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'auth.github': { paramsTuple?: []; params?: {} }
    'auth.github.callback': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.feed': { paramsTuple?: []; params?: {} }
    'articles.index': { paramsTuple?: []; params?: {} }
    'articles.create': { paramsTuple?: []; params?: {} }
    'articles.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.index': { paramsTuple?: []; params?: {} }
    'forum.create': { paramsTuple?: []; params?: {} }
    'forum.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.index': { paramsTuple?: []; params?: {} }
    'discussions.create': { paramsTuple?: []; params?: {} }
    'discussions.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'members.index': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'settings.profile': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.account': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'admin.index': { paramsTuple?: []; params?: {} }
    'admin.reports.index': { paramsTuple?: []; params?: {} }
    'admin.members.index': { paramsTuple?: []; params?: {} }
    'admin.tags.index': { paramsTuple?: []; params?: {} }
    'admin.channels.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'pages.about': { paramsTuple?: []; params?: {} }
    'pages.code_of_conduct': { paramsTuple?: []; params?: {} }
    'login': { paramsTuple?: []; params?: {} }
    'register': { paramsTuple?: []; params?: {} }
    'auth.github': { paramsTuple?: []; params?: {} }
    'auth.github.callback': { paramsTuple?: []; params?: {} }
    'seo.robots': { paramsTuple?: []; params?: {} }
    'seo.sitemap': { paramsTuple?: []; params?: {} }
    'seo.feed': { paramsTuple?: []; params?: {} }
    'articles.index': { paramsTuple?: []; params?: {} }
    'articles.create': { paramsTuple?: []; params?: {} }
    'articles.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.index': { paramsTuple?: []; params?: {} }
    'forum.create': { paramsTuple?: []; params?: {} }
    'forum.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.index': { paramsTuple?: []; params?: {} }
    'discussions.create': { paramsTuple?: []; params?: {} }
    'discussions.edit': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'members.index': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'settings.profile': { paramsTuple?: []; params?: {} }
    'settings.password': { paramsTuple?: []; params?: {} }
    'settings.account': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'username': ParamValue} }
    'admin.index': { paramsTuple?: []; params?: {} }
    'admin.reports.index': { paramsTuple?: []; params?: {} }
    'admin.members.index': { paramsTuple?: []; params?: {} }
    'admin.tags.index': { paramsTuple?: []; params?: {} }
    'admin.channels.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'login.store': { paramsTuple?: []; params?: {} }
    'register.store': { paramsTuple?: []; params?: {} }
    'logout': { paramsTuple?: []; params?: {} }
    'markdown.preview': { paramsTuple?: []; params?: {} }
    'replies.like': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.store': { paramsTuple?: []; params?: {} }
    'articles.like': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.publish': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.unpublish': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.feature': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'articles.comments.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.store': { paramsTuple?: []; params?: {} }
    'forum.replies.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.solution.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.pin': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.lock': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.store': { paramsTuple?: []; params?: {} }
    'discussions.replies.store': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.pin': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.lock': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'notifications.read_all': { paramsTuple?: []; params?: {} }
    'notifications.read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reports.store': { paramsTuple?: []; params?: {} }
    'admin.reports.resolve': { paramsTuple: [ParamValue,ParamValue]; params: {'target': ParamValue,'id': ParamValue} }
    'admin.reports.dismiss': { paramsTuple: [ParamValue,ParamValue]; params: {'target': ParamValue,'id': ParamValue} }
    'admin.members.ban': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.store': { paramsTuple?: []; params?: {} }
    'admin.channels.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'replies.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.update': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'settings.profile.update': { paramsTuple?: []; params?: {} }
    'settings.password.update': { paramsTuple?: []; params?: {} }
    'admin.members.role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.channels.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'replies.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'articles.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'forum.solution.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'discussions.destroy': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'settings.account.destroy': { paramsTuple?: []; params?: {} }
    'admin.reports.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'target': ParamValue,'id': ParamValue} }
    'admin.members.unban': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.channels.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}