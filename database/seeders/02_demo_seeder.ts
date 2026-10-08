import { BaseSeeder } from '@adonisjs/lucid/seeders'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import env from '#start/env'
import User from '#models/user'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Reply from '#models/reply'
import Tag from '#models/tag'
import Channel from '#models/channel'
import { readingMinutes, renderMarkdown } from '#services/markdown'
import { uniqueSlug } from '#services/slug'
import { members } from '#database/demo/members'
import { articlesPart1 } from '#database/demo/articles_1'
import { articlesPart2 } from '#database/demo/articles_2'
import { threads } from '#database/demo/threads'
import { discussions } from '#database/demo/discussions'
import type { DemoMember, DemoReply } from '#database/demo/types'

/**
 * Fictional demo content: members, articles (+ comments), forum threads,
 * discussions and likes, spread over the last months so every page of the
 * site looks alive.
 *
 * - Always runs in development; in production only with SEED_DEMO=true.
 * - Idempotent: skipped when the demo members already exist.
 * - Demo accounts get a random 40-character password nobody knows.
 * - Everything is inserted in one transaction, with explicit timestamps.
 *
 * Run alone: node ace db:seed --files database/seeders/02_demo_seeder.ts
 */

const ZONE = 'Africa/Douala'

/** Small deterministic PRNG (mulberry32): same content on every fresh seed. */
function prng(seed: number) {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    shuffle: <T>(items: T[]) => {
      const copy = [...items]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    },
  }
}

type ParentKey = 'threadId' | 'discussionId' | 'articleId'

interface PlannedReply {
  key: string
  author: string
  createdAt: DateTime
  body: string
  solution: boolean
}

export default class DemoSeeder extends BaseSeeder {
  static environment = ['development', 'production']

  private now = DateTime.now().setZone(ZONE)
  private random = prng(237)
  private joined = new Map<string, DateTime>()
  private html = new Map<string, string>()

  async run() {
    if (app.inProduction && env.get('SEED_DEMO') !== true) {
      logger.info('[demo] SEED_DEMO is not "true": demo content skipped')
      return
    }

    const usernames = members.map((member) => member.username)
    if (await User.query().whereIn('username', usernames).first()) {
      logger.info('[demo] demo members already exist: nothing to do')
      return
    }

    const articles = [...articlesPart1, ...articlesPart2]
    const allTags = await Tag.all()
    const allChannels = await Channel.all()
    const tags = new Map(allTags.map((tag) => [tag.slug, tag.id]))
    const channels = new Map(allChannels.map((channel) => [channel.slug, channel.id]))
    if (!tags.size || !channels.size) {
      throw new Error(
        '[demo] channels and tags are missing: run database/seeders/01_base_seeder first'
      )
    }

    /*
    | Plan every date up front and validate the whole timeline before
    | touching the database.
    */
    for (const member of members) {
      this.joined.set(member.username, this.joinDate(member))
    }

    const plannedArticles = articles.map((article, index) => {
      const publishedAt =
        article.publishedDaysAgo === null
          ? null
          : this.at(article.publishedDaysAgo, this.random.int(7, 11), this.random.int(0, 59))
      const createdAt = publishedAt
        ? publishedAt.minus({ hours: this.random.int(20, 70) })
        : this.at(article.createdDaysAgo ?? 2, 21, this.random.int(0, 59))
      this.check(article.author, createdAt, `article "${article.title}"`)
      this.assertLength(article.title, 160, 'article title')
      this.assertLength(article.excerpt, 300, 'article excerpt')
      this.assertTags(article.tags, tags)
      return {
        source: article,
        key: `article:${index}`,
        publishedAt,
        createdAt,
        comments: publishedAt
          ? this.planReplies(`article:${index}`, publishedAt, article.comments ?? [])
          : [],
      }
    })

    const plannedThreads = threads.map((thread, index) => {
      const createdAt = this.at(thread.daysAgo, thread.hour, this.random.int(0, 59))
      this.check(thread.author, createdAt, `thread "${thread.title}"`)
      this.assertLength(thread.title, 160, 'thread title')
      if (!channels.has(thread.channel))
        throw new Error(`[demo] unknown channel "${thread.channel}"`)
      if (thread.replies.filter((reply) => reply.solution).length > 1) {
        throw new Error(`[demo] thread "${thread.title}" has several solutions`)
      }
      return {
        source: thread,
        key: `thread:${index}`,
        createdAt,
        replies: this.planReplies(`thread:${index}`, createdAt, thread.replies),
      }
    })

    const plannedDiscussions = discussions.map((discussion, index) => {
      const createdAt = this.at(discussion.daysAgo, discussion.hour, this.random.int(0, 59))
      this.check(discussion.author, createdAt, `discussion "${discussion.title}"`)
      this.assertLength(discussion.title, 160, 'discussion title')
      this.assertTags(discussion.tags, tags)
      return {
        source: discussion,
        key: `discussion:${index}`,
        createdAt,
        replies: this.planReplies(`discussion:${index}`, createdAt, discussion.replies),
      }
    })

    for (const member of members) this.assertLength(member.bio, 280, `bio of ${member.username}`)

    /*
    | Render markdown and reserve slugs outside the transaction (Shiki is
    | slow-ish, and uniqueSlug reads through the default connection).
    */
    const render = async (key: string, body: string) =>
      this.html.set(key, await renderMarkdown(body))
    for (const article of plannedArticles) {
      await render(article.key, article.source.body)
      for (const comment of article.comments) await render(comment.key, comment.body)
    }
    for (const item of [...plannedThreads, ...plannedDiscussions]) {
      await render(item.key, item.source.body)
      for (const reply of item.replies) await render(reply.key, reply.body)
    }

    const slugs = new Map<string, string>()
    const reserveSlug = async (table: string, key: string, title: string) => {
      const taken = new Set([...slugs.values()])
      let slug = await uniqueSlug(table, title)
      while (taken.has(slug)) slug = await uniqueSlug(table, `${title} ${string.random(4)}`)
      slugs.set(key, slug)
    }
    for (const article of plannedArticles)
      await reserveSlug('articles', article.key, article.source.title)
    for (const thread of plannedThreads)
      await reserveSlug('threads', thread.key, thread.source.title)
    for (const discussion of plannedDiscussions) {
      await reserveSlug('discussions', discussion.key, discussion.source.title)
    }

    /*
    | Insert everything in one transaction.
    */
    const counts = await db.transaction(async (trx) => {
      const users = new Map<string, User>()
      for (const member of members) {
        const joinedAt = this.joined.get(member.username)!
        const user = await User.create(
          {
            username: member.username,
            name: member.name,
            email: `${member.username}@example.com`,
            password: string.random(40),
            role: member.role ?? 'member',
            bio: member.bio,
            location: member.location,
            avatarUrl: null,
            websiteUrl: null,
            githubUsername: null,
            twitterUsername: null,
            linkedinUsername: null,
            emailVerifiedAt: joinedAt,
            createdAt: joinedAt,
            updatedAt: joinedAt,
          },
          { client: trx }
        )
        users.set(member.username, user)
      }
      const userId = (username: string) => users.get(username)!.id

      const likeTargets: {
        kind: 'article' | 'reply'
        id: number
        ownerId: number
        date: DateTime
        weight: number
      }[] = []
      let repliesCount = 0

      const insertReplies = async (
        column: ParentKey,
        parentId: number,
        planned: PlannedReply[]
      ) => {
        const created: { reply: Reply; solution: boolean }[] = []
        for (const item of planned) {
          const reply = await Reply.create(
            {
              userId: userId(item.author),
              threadId: column === 'threadId' ? parentId : null,
              discussionId: column === 'discussionId' ? parentId : null,
              articleId: column === 'articleId' ? parentId : null,
              body: item.body,
              bodyHtml: this.html.get(item.key)!,
              createdAt: item.createdAt,
              updatedAt: item.createdAt,
            },
            { client: trx }
          )
          created.push({ reply, solution: item.solution })
          likeTargets.push({
            kind: 'reply',
            id: reply.id,
            ownerId: reply.userId,
            date: item.createdAt,
            weight: item.solution ? 3 : 1,
          })
          repliesCount++
        }
        return created
      }

      // Articles, their tags and comments
      for (const article of plannedArticles) {
        const { source, publishedAt, createdAt } = article
        const row = await Article.create(
          {
            userId: userId(source.author),
            title: source.title,
            slug: slugs.get(article.key)!,
            excerpt: source.excerpt,
            body: source.body,
            bodyHtml: this.html.get(article.key)!,
            coverUrl: null,
            readingMinutes: readingMinutes(source.body),
            viewsCount: source.views,
            publishedAt,
            featuredAt: source.featured && publishedAt ? publishedAt.plus({ hours: 6 }) : null,
            createdAt,
            updatedAt: publishedAt ?? createdAt,
          },
          { client: trx }
        )
        await this.attachTags(trx, 'article_tag', 'article_id', row.id, source.tags, tags)
        await insertReplies('articleId', row.id, article.comments)
        if (publishedAt) {
          likeTargets.push({
            kind: 'article',
            id: row.id,
            ownerId: row.userId,
            date: publishedAt,
            weight: source.views,
          })
        }
      }

      // Forum threads, replies and accepted answers
      for (const thread of plannedThreads) {
        const { source, createdAt, replies } = thread
        const lastActivityAt = replies.at(-1)?.createdAt ?? createdAt
        const lockedAt = source.locked ? lastActivityAt.plus({ minutes: 2 }) : null
        const row = await Thread.create(
          {
            userId: userId(source.author),
            channelId: channels.get(source.channel)!,
            title: source.title,
            slug: slugs.get(thread.key)!,
            body: source.body,
            bodyHtml: this.html.get(thread.key)!,
            viewsCount: source.views,
            repliesCount: replies.length,
            pinnedAt: source.pinned ? createdAt.plus({ minutes: 5 }) : null,
            lockedAt,
            lastActivityAt,
            solutionReplyId: null,
            createdAt,
            updatedAt: lockedAt ?? createdAt,
          },
          { client: trx }
        )
        const created = await insertReplies('threadId', row.id, replies)
        const solution = created.find((item) => item.solution)
        if (solution) {
          // Query builder on purpose: a model save would stamp updated_at with "now".
          await trx
            .from('threads')
            .where('id', row.id)
            .update({ solution_reply_id: solution.reply.id })
        }
      }

      // Discussions, their tags and replies
      for (const discussion of plannedDiscussions) {
        const { source, createdAt, replies } = discussion
        const row = await Discussion.create(
          {
            userId: userId(source.author),
            title: source.title,
            slug: slugs.get(discussion.key)!,
            body: source.body,
            bodyHtml: this.html.get(discussion.key)!,
            viewsCount: source.views,
            repliesCount: replies.length,
            pinnedAt: source.pinned ? createdAt.plus({ minutes: 5 }) : null,
            lockedAt: null,
            lastActivityAt: replies.at(-1)?.createdAt ?? createdAt,
            createdAt,
            updatedAt: createdAt,
          },
          { client: trx }
        )
        await this.attachTags(trx, 'discussion_tag', 'discussion_id', row.id, source.tags, tags)
        await insertReplies('discussionId', row.id, replies)
      }

      // Likes: never on one's own content, only from members who already
      // joined, dated between the content and now.
      const likes: {
        user_id: number
        article_id: number | null
        reply_id: number | null
        created_at: Date
      }[] = []
      for (const target of likeTargets) {
        const wanted =
          target.kind === 'article'
            ? Math.min(10, Math.max(2, Math.round(target.weight / 300) + this.random.int(0, 2)))
            : this.replyLikes(target.weight)
        const candidates = this.random
          .shuffle(members)
          .map((member) => users.get(member.username)!)
          .filter((user) => user.id !== target.ownerId && user.createdAt < target.date)
          .slice(0, wanted)

        for (const user of candidates) {
          likes.push({
            user_id: user.id,
            article_id: target.kind === 'article' ? target.id : null,
            reply_id: target.kind === 'reply' ? target.id : null,
            created_at: this.likeDate(target.date).toJSDate(),
          })
        }
      }
      if (likes.length) await trx.table('likes').multiInsert(likes)

      return {
        members: users.size,
        articles: plannedArticles.length,
        threads: plannedThreads.length,
        discussions: plannedDiscussions.length,
        replies: repliesCount,
        likes: likes.length,
      }
    })

    logger.info(
      `[demo] seeded ${counts.members} members, ${counts.articles} articles, ${counts.threads} threads, ` +
        `${counts.discussions} discussions, ${counts.replies} replies, ${counts.likes} likes`
    )
  }

  /**
   * A moment "daysAgo" days before now, at a given local time (Douala).
   */
  private at(daysAgo: number, hour: number, minute = 0) {
    return this.now.minus({ days: daysAgo }).set({ hour, minute, second: 0, millisecond: 0 })
  }

  private joinDate(member: DemoMember) {
    return this.at(member.joinedDaysAgo, this.random.int(7, 22), this.random.int(0, 59))
  }

  /**
   * Turn relative replies into dated ones, checking the timeline.
   */
  private planReplies(
    parentKey: string,
    parentDate: DateTime,
    replies: DemoReply[]
  ): PlannedReply[] {
    let previous = parentDate
    return replies.map((reply, index) => {
      const createdAt = parentDate.plus({
        minutes: Math.round(reply.after * 60) + this.random.int(0, 6),
      })
      if (createdAt <= previous) {
        throw new Error(`[demo] reply ${index} of ${parentKey} is not after the previous message`)
      }
      this.check(reply.author, createdAt, `reply ${index} of ${parentKey}`)
      previous = createdAt
      return {
        key: `${parentKey}:reply:${index}`,
        author: reply.author,
        createdAt,
        body: reply.body,
        solution: reply.solution ?? false,
      }
    })
  }

  /**
   * Content must be written by a known member, after they joined, and
   * in the past.
   */
  private check(username: string, date: DateTime, what: string) {
    const joinedAt = this.joined.get(username)
    if (!joinedAt) throw new Error(`[demo] unknown member "${username}" (${what})`)
    if (date <= joinedAt.plus({ hours: 1 })) {
      throw new Error(`[demo] ${what} is dated before ${username} joined`)
    }
    if (date >= this.now.minus({ minutes: 10 }))
      throw new Error(`[demo] ${what} is dated in the future`)
  }

  private assertLength(value: string, max: number, what: string) {
    if (value.length > max)
      throw new Error(`[demo] ${what} is longer than ${max} characters: "${value}"`)
  }

  private assertTags(slugs: string[], tags: Map<string, number>) {
    for (const slug of slugs) {
      if (!tags.has(slug)) throw new Error(`[demo] unknown tag "${slug}"`)
    }
  }

  private async attachTags(
    trx: TransactionClientContract,
    table: 'article_tag' | 'discussion_tag',
    column: 'article_id' | 'discussion_id',
    id: number,
    slugs: string[],
    tags: Map<string, number>
  ) {
    if (!slugs.length) return
    await trx
      .table(table)
      .multiInsert(slugs.map((slug) => ({ [column]: id, tag_id: tags.get(slug)! })))
  }

  /**
   * 0 to 3 likes on a regular reply, 2 to 5 on an accepted answer.
   */
  private replyLikes(weight: number) {
    if (weight > 1) return this.random.int(2, 5)
    const roll = this.random.next()
    return roll < 0.45 ? 0 : roll < 0.75 ? 1 : roll < 0.92 ? 2 : 3
  }

  /**
   * Most likes arrive within a few days of the content.
   */
  private likeDate(contentDate: DateTime) {
    const latest = this.now.minus({ minutes: 15 })
    const window = Math.min(latest.diff(contentDate, 'minutes').minutes, 6 * 24 * 60)
    const date = contentDate.plus({
      minutes: 5 + Math.round(this.random.next() * Math.max(0, window - 5)),
    })
    return date < latest ? date : latest
  }
}
