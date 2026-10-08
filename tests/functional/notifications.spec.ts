import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import Article from '#models/article'
import Reply from '#models/reply'
import Notification from '#models/notification'
import type User from '#models/user'
import { pruneReadNotifications } from '#services/notifications'
import { createUser, firstChannel, LONG_BODY } from '#tests/helpers'

async function ask(client: any, user: User) {
  const channel = await firstChannel()
  await client
    .post('/forum')
    .json({
      title: 'Pourquoi mon fetch renvoie une erreur CORS ?',
      channelId: channel.id,
      body: LONG_BODY,
    })
    .withCsrfToken()
    .loginAs(user)
    .redirects(0)
  return Thread.findByOrFail('user_id', user.id)
}

async function answer(client: any, thread: Thread, user: User) {
  await client
    .post(`/forum/${thread.slug}/replies`)
    .json({ body: 'Ajoutez les en-têtes CORS côté serveur.' })
    .withCsrfToken()
    .loginAs(user)
    .redirects(0)
  return Reply.query()
    .where('thread_id', thread.id)
    .where('user_id', user.id)
    .orderBy('id', 'desc')
    .firstOrFail()
}

async function notificationsOf(user: User) {
  return Notification.query().where('user_id', user.id).orderBy('id', 'asc')
}

test.group('Notifications', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a reply notifies the author and previous participants, never the actor', async ({
    client,
    assert,
  }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const first = await createUser()
    const second = await createUser()

    const firstReply = await answer(client, thread, first)
    const [toAsker] = await notificationsOf(asker)
    assert.equal(toAsker.type, 'thread_reply')
    assert.equal(toAsker.threadId, thread.id)
    assert.equal(toAsker.actorId, first.id)
    assert.equal(toAsker.replyId, firstReply.id)
    assert.lengthOf(await notificationsOf(first), 0)

    const secondReply = await answer(client, thread, second)
    const toFirst = await notificationsOf(first)
    assert.lengthOf(toFirst, 1)
    assert.equal(toFirst[0].type, 'thread_reply')
    assert.equal(toFirst[0].replyId, secondReply.id)
    assert.lengthOf(await notificationsOf(second), 0)

    // The asker answering in their own thread notifies the participants only.
    await answer(client, thread, asker)
    const askerRows = await notificationsOf(asker)
    assert.lengthOf(askerRows, 1)
    assert.isNull(askerRows[0].readAt)
    assert.lengthOf(await notificationsOf(second), 1)
  })

  test('unread notifications on the same subject are coalesced', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const [first, second, third] = [await createUser(), await createUser(), await createUser()]

    await answer(client, thread, first)
    await answer(client, thread, second)
    const latest = await answer(client, thread, second)

    const rows = await notificationsOf(asker)
    assert.lengthOf(rows, 1)
    assert.equal(rows[0].actorId, second.id)
    assert.equal(rows[0].replyId, latest.id)

    const page = await client.get('/notifications').withInertia().loginAs(asker)
    page.assertStatus(200)
    page.assertInertiaComponent('notifications/index')
    const [row] = page.inertiaProps.notifications.data
    assert.equal(row.newReplies, 3)
    assert.equal(row.actorsCount, 2)
    assert.isTrue(row.subject.isMine)
    assert.deepEqual(page.inertiaProps.counts, { toutes: 1, nonLues: 1 })

    // Once read, the next reply starts a fresh notification.
    await client
      .post(`/notifications/${rows[0].id}/read`)
      .withCsrfToken()
      .loginAs(asker)
      .redirects(0)
    await answer(client, thread, third)
    const after = await notificationsOf(asker)
    assert.lengthOf(after, 2)
    assert.isNotNull(after[0].readAt)
    assert.isNull(after[1].readAt)
    assert.equal(after[1].actorId, third.id)

    const unread = await client.get('/notifications?filtre=non-lues').withInertia().loginAs(asker)
    const data = unread.inertiaProps.notifications.data
    assert.lengthOf(data, 1)
    assert.equal(data[0].newReplies, 1)
    assert.equal(data[0].actorsCount, 1)
  })

  test('accepting an answer notifies its author once', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const helper = await createUser()
    const reply = await answer(client, thread, helper)

    const accept = () =>
      client
        .post(`/forum/${thread.slug}/solution`)
        .json({ replyId: reply.id })
        .withCsrfToken()
        .loginAs(asker)
        .redirects(0)

    await accept()
    let rows = await Notification.query()
      .where('user_id', helper.id)
      .where('type', 'solution_accepted')
    assert.lengthOf(rows, 1)
    assert.equal(rows[0].threadId, thread.id)
    assert.equal(rows[0].replyId, reply.id)
    assert.equal(rows[0].actorId, asker.id)

    await client
      .delete(`/forum/${thread.slug}/solution`)
      .withCsrfToken()
      .loginAs(asker)
      .redirects(0)
    await accept()
    rows = await Notification.query().where('user_id', helper.id).where('type', 'solution_accepted')
    assert.lengthOf(rows, 1)
  })

  test('discussions and article comments notify their author and participants', async ({
    client,
    assert,
  }) => {
    const author = await createUser()
    const [first, second] = [await createUser(), await createUser()]

    await client
      .post('/discussions')
      .json({ title: 'Freelance depuis le Cameroun : vos retours ?', body: LONG_BODY })
      .withCsrfToken()
      .loginAs(author)
      .redirects(0)
    const discussion = await Discussion.findByOrFail('user_id', author.id)
    await client
      .post(`/discussions/${discussion.slug}/replies`)
      .json({ body: 'Payoneer de mon côté, sans souci.' })
      .withCsrfToken()
      .loginAs(first)
      .redirects(0)
    const [discussionRow] = await notificationsOf(author)
    assert.equal(discussionRow.type, 'discussion_reply')
    assert.equal(discussionRow.discussionId, discussion.id)

    await client
      .post('/articles')
      .json({
        title: 'Comprendre les closures en JavaScript',
        excerpt: '',
        body: LONG_BODY,
        publish: true,
        tags: [],
      })
      .withCsrfToken()
      .loginAs(author)
      .redirects(0)
    const article = await Article.findByOrFail('user_id', author.id)
    for (const commenter of [first, second]) {
      await client
        .post(`/articles/${article.slug}/comments`)
        .json({ body: 'Merci, l’exemple du compteur est très clair.' })
        .withCsrfToken()
        .loginAs(commenter)
        .redirects(0)
    }

    const articleRows = await Notification.query()
      .where('user_id', author.id)
      .where('type', 'article_comment')
    assert.lengthOf(articleRows, 1)
    assert.equal(articleRows[0].articleId, article.id)
    assert.equal(articleRows[0].actorId, second.id)

    const toFirst = await Notification.query()
      .where('user_id', first.id)
      .where('type', 'article_comment')
    assert.lengthOf(toFirst, 1)
    assert.lengthOf(await notificationsOf(second), 0)
  })

  test('banned members are not notified', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const participant = await createUser()
    await answer(client, thread, participant)
    await Notification.query().where('user_id', asker.id).delete()

    asker.bannedAt = DateTime.now()
    await asker.save()
    participant.bannedAt = DateTime.now()
    await participant.save()

    await answer(client, thread, await createUser())
    assert.lengthOf(await notificationsOf(asker), 0)
    assert.lengthOf(await notificationsOf(participant), 0)
  })

  test('only the owner can open or mark a notification', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const helper = await createUser()
    const reply = await answer(client, thread, helper)
    const [notification] = await notificationsOf(asker)

    const intruder = await createUser()
    const peek = await client
      .get(`/notifications/${notification.id}`)
      .loginAs(intruder)
      .redirects(0)
    peek.assertStatus(404)
    const mark = await client
      .post(`/notifications/${notification.id}/read`)
      .withCsrfToken()
      .loginAs(intruder)
      .redirects(0)
    mark.assertStatus(404)
    await notification.refresh()
    assert.isNull(notification.readAt)

    // The owner: marked as read, sent to the exact reply.
    const open = await client.get(`/notifications/${notification.id}`).loginAs(asker).redirects(0)
    open.assertStatus(302)
    open.assertHeader('location', `/forum/${thread.slug}#reponse-${reply.id}`)
    await notification.refresh()
    assert.isNotNull(notification.readAt)

    // From an Inertia visit, the client is told to visit the target itself
    // (keeps the #fragment).
    const visit = await client
      .get(`/notifications/${notification.id}`)
      .header('X-Inertia', 'true')
      .loginAs(asker)
      .redirects(0)
    visit.assertStatus(409)
    visit.assertHeader('x-inertia-redirect', `/forum/${thread.slug}#reponse-${reply.id}`)

    const guest = await client.get('/notifications').redirects(0)
    guest.assertStatus(302)
  })

  test('mark all as read only touches my notifications', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const other = await createUser()
    const otherThread = await ask(client, other)
    const helper = await createUser()
    await answer(client, thread, helper)
    await answer(client, otherThread, helper)

    const response = await client
      .post('/notifications/read-all')
      .withCsrfToken()
      .loginAs(asker)
      .redirects(0)
    response.assertStatus(302)

    const mine = await notificationsOf(asker)
    assert.isTrue(mine.length > 0 && mine.every((n) => n.readAt !== null))
    const theirs = await notificationsOf(other)
    assert.lengthOf(theirs, 1)
    assert.isNull(theirs[0].readAt)

    const page = await client.get('/notifications').withInertia().loginAs(asker)
    page.assertInertiaPropsContains({ counts: { nonLues: 0 } })
  })

  test('pruning deletes old read notifications only', async ({ assert }) => {
    const user = await createUser()
    const old = DateTime.now().minus({ days: 120 }).toJSDate()
    const recent = DateTime.now().minus({ days: 10 }).toJSDate()
    await db.table('notifications').multiInsert([
      { user_id: user.id, type: 'thread_reply', read_at: old, created_at: old },
      { user_id: user.id, type: 'thread_reply', read_at: null, created_at: old },
      { user_id: user.id, type: 'thread_reply', read_at: recent, created_at: recent },
    ])

    const deleted = await pruneReadNotifications(90)
    assert.equal(deleted, 1)
    const left = await notificationsOf(user)
    assert.lengthOf(left, 2)
    assert.isTrue(left.every((n) => n.readAt === null || n.createdAt > DateTime.fromJSDate(old)))
  })
})

test.group('Notifications / reading the content', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('opening the thread marks its notifications as read', async ({ client, assert }) => {
    const asker = await createUser()
    const helper = await createUser()
    const thread = await ask(client, asker)
    await answer(client, thread, helper)

    let [notification] = await notificationsOf(asker)
    assert.isNull(notification.readAt)

    const page = await client.get(`/forum/${thread.slug}`).loginAs(asker)
    page.assertStatus(200)
    ;[notification] = await notificationsOf(asker)
    assert.isNotNull(notification.readAt)
  })
})
