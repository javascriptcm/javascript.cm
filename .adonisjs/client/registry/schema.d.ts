/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
    }
  }
  'health': {
    methods: ["GET","HEAD"]
    pattern: '/up'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'pages.about': {
    methods: ["GET","HEAD"]
    pattern: '/a-propos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'pages.code_of_conduct': {
    methods: ["GET","HEAD"]
    pattern: '/code-de-conduite'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['show']>>>
    }
  }
  'login.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/login_validator').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/login_validator').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'register': {
    methods: ["GET","HEAD"]
    pattern: '/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['show']>>>
    }
  }
  'register.store': {
    methods: ["POST"]
    pattern: '/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/register_validator').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/register_validator').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.github': {
    methods: ["GET","HEAD"]
    pattern: '/auth/github'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/github_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/github_controller').default['redirect']>>>
    }
  }
  'auth.github.callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/github/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/github_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/github_controller').default['callback']>>>
    }
  }
  'logout': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['destroy']>>>
    }
  }
  'markdown.preview': {
    methods: ["POST"]
    pattern: '/markdown/preview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/markdown_controller').default['preview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/markdown_controller').default['preview']>>>
    }
  }
  'replies.update': {
    methods: ["PUT"]
    pattern: '/replies/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/replies_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/replies_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'replies.destroy': {
    methods: ["DELETE"]
    pattern: '/replies/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/replies_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/replies_controller').default['destroy']>>>
    }
  }
  'replies.like': {
    methods: ["POST"]
    pattern: '/replies/:id/like'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/replies_controller').default['like']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/replies_controller').default['like']>>>
    }
  }
  'seo.robots': {
    methods: ["GET","HEAD"]
    pattern: '/robots.txt'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['robots']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['robots']>>>
    }
  }
  'seo.sitemap': {
    methods: ["GET","HEAD"]
    pattern: '/sitemap.xml'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['sitemap']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['sitemap']>>>
    }
  }
  'seo.feed': {
    methods: ["GET","HEAD"]
    pattern: '/feed.xml'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['feed']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/seo_controller').default['feed']>>>
    }
  }
  'articles.index': {
    methods: ["GET","HEAD"]
    pattern: '/articles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['index']>>>
    }
  }
  'articles.create': {
    methods: ["GET","HEAD"]
    pattern: '/articles/nouveau'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['create']>>>
    }
  }
  'articles.store': {
    methods: ["POST"]
    pattern: '/articles'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/article_validator').articleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/article_validator').articleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'articles.edit': {
    methods: ["GET","HEAD"]
    pattern: '/articles/:slug/modifier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['edit']>>>
    }
  }
  'articles.update': {
    methods: ["PUT"]
    pattern: '/articles/:slug'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/article_validator').articleValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/article_validator').articleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'articles.destroy': {
    methods: ["DELETE"]
    pattern: '/articles/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['destroy']>>>
    }
  }
  'articles.like': {
    methods: ["POST"]
    pattern: '/articles/:slug/like'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['like']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['like']>>>
    }
  }
  'articles.publish': {
    methods: ["POST"]
    pattern: '/articles/:slug/publish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['publish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['publish']>>>
    }
  }
  'articles.unpublish': {
    methods: ["POST"]
    pattern: '/articles/:slug/unpublish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['unpublish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['unpublish']>>>
    }
  }
  'articles.feature': {
    methods: ["POST"]
    pattern: '/articles/:slug/feature'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['feature']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/article_actions_controller').default['feature']>>>
    }
  }
  'articles.comments.store': {
    methods: ["POST"]
    pattern: '/articles/:slug/comments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/article_comments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/article_comments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'articles.show': {
    methods: ["GET","HEAD"]
    pattern: '/articles/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/articles_controller').default['show']>>>
    }
  }
  'forum.index': {
    methods: ["GET","HEAD"]
    pattern: '/forum'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['index']>>>
    }
  }
  'forum.create': {
    methods: ["GET","HEAD"]
    pattern: '/forum/nouveau'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['create']>>>
    }
  }
  'forum.store': {
    methods: ["POST"]
    pattern: '/forum'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/thread_validator').threadValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/thread_validator').threadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'forum.edit': {
    methods: ["GET","HEAD"]
    pattern: '/forum/:slug/modifier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['edit']>>>
    }
  }
  'forum.update': {
    methods: ["PUT"]
    pattern: '/forum/:slug'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/thread_validator').threadValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/thread_validator').threadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'forum.destroy': {
    methods: ["DELETE"]
    pattern: '/forum/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['destroy']>>>
    }
  }
  'forum.replies.store': {
    methods: ["POST"]
    pattern: '/forum/:slug/replies'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['reply']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['reply']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'forum.solution.store': {
    methods: ["POST"]
    pattern: '/forum/:slug/solution'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/thread_validator').solutionValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/thread_validator').solutionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['markSolution']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['markSolution']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'forum.solution.destroy': {
    methods: ["DELETE"]
    pattern: '/forum/:slug/solution'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['unmarkSolution']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['unmarkSolution']>>>
    }
  }
  'forum.pin': {
    methods: ["POST"]
    pattern: '/forum/:slug/pin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['togglePin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['togglePin']>>>
    }
  }
  'forum.lock': {
    methods: ["POST"]
    pattern: '/forum/:slug/lock'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['toggleLock']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/thread_actions_controller').default['toggleLock']>>>
    }
  }
  'forum.show': {
    methods: ["GET","HEAD"]
    pattern: '/forum/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/threads_controller').default['show']>>>
    }
  }
  'discussions.index': {
    methods: ["GET","HEAD"]
    pattern: '/discussions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['index']>>>
    }
  }
  'discussions.create': {
    methods: ["GET","HEAD"]
    pattern: '/discussions/nouvelle'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['create']>>>
    }
  }
  'discussions.store': {
    methods: ["POST"]
    pattern: '/discussions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/discussion_validator').discussionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/discussion_validator').discussionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'discussions.edit': {
    methods: ["GET","HEAD"]
    pattern: '/discussions/:slug/modifier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['edit']>>>
    }
  }
  'discussions.update': {
    methods: ["PUT"]
    pattern: '/discussions/:slug'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/discussion_validator').discussionValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/discussion_validator').discussionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'discussions.destroy': {
    methods: ["DELETE"]
    pattern: '/discussions/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['destroy']>>>
    }
  }
  'discussions.replies.store': {
    methods: ["POST"]
    pattern: '/discussions/:slug/replies'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/reply_validator').replyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussion_actions_controller').default['reply']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussion_actions_controller').default['reply']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'discussions.pin': {
    methods: ["POST"]
    pattern: '/discussions/:slug/pin'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussion_actions_controller').default['togglePin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussion_actions_controller').default['togglePin']>>>
    }
  }
  'discussions.lock': {
    methods: ["POST"]
    pattern: '/discussions/:slug/lock'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussion_actions_controller').default['toggleLock']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussion_actions_controller').default['toggleLock']>>>
    }
  }
  'discussions.show': {
    methods: ["GET","HEAD"]
    pattern: '/discussions/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/discussions_controller').default['show']>>>
    }
  }
  'members.index': {
    methods: ["GET","HEAD"]
    pattern: '/membres'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/members_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/members_controller').default['index']>>>
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'settings.profile': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['profile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['profile']>>>
    }
  }
  'settings.profile.update': {
    methods: ["PUT"]
    pattern: '/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings_validator').profileSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings_validator').profileSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateProfile']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.password': {
    methods: ["GET","HEAD"]
    pattern: '/settings/password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['password']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['password']>>>
    }
  }
  'settings.password.update': {
    methods: ["PUT"]
    pattern: '/settings/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings_validator').passwordSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings_validator').passwordSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updatePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.account': {
    methods: ["GET","HEAD"]
    pattern: '/settings/account'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['account']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['account']>>>
    }
  }
  'settings.account.destroy': {
    methods: ["DELETE"]
    pattern: '/settings/account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings_validator').deleteAccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings_validator').deleteAccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['destroyAccount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['destroyAccount']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/:username'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { username: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'admin.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/overview_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/overview_controller').default['index']>>>
    }
  }
  'admin.members.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/membres'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['index']>>>
    }
  }
  'admin.members.role': {
    methods: ["PUT"]
    pattern: '/admin/membres/:id/role'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_validator').roleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_validator').roleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['updateRole']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['updateRole']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.members.ban': {
    methods: ["POST"]
    pattern: '/admin/membres/:id/ban'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['ban']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['ban']>>>
    }
  }
  'admin.members.unban': {
    methods: ["DELETE"]
    pattern: '/admin/membres/:id/ban'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['unban']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/members_controller').default['unban']>>>
    }
  }
  'admin.tags.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/tags'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['index']>>>
    }
  }
  'admin.tags.store': {
    methods: ["POST"]
    pattern: '/admin/tags'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_validator').tagValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_validator').tagValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.tags.update': {
    methods: ["PUT"]
    pattern: '/admin/tags/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_validator').tagValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_validator').tagValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.tags.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/tags/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/tags_controller').default['destroy']>>>
    }
  }
  'admin.channels.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/canaux'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['index']>>>
    }
  }
  'admin.channels.store': {
    methods: ["POST"]
    pattern: '/admin/canaux'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_validator').channelValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_validator').channelValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.channels.update': {
    methods: ["PUT"]
    pattern: '/admin/canaux/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_validator').channelValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_validator').channelValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.channels.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/canaux/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/channels_controller').default['destroy']>>>
    }
  }
}
