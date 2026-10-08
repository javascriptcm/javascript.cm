import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Report from '#models/report'
import Thread from '#models/thread'
import Reply from '#models/reply'
import Article from '#models/article'
import type User from '#models/user'
import { createReply } from '#services/reply_service'
import { createUser, firstChannel, LONG_BODY } from '#tests/helpers'

let sequence = 0

async function createThread(author: User) {
  sequence++
  const channel = await firstChannel()
  return Thread.create({
    userId: author.id,
    channelId: channel.id,
    title: `Pourquoi mon build Vite échoue en CI ? (${sequence})`,
    slug: `build-vite-ci-${sequence}-${Date.now()}`,
    body: LONG_BODY,
    bodyHtml: '<p>Contenu</p>',
    lastActivityAt: DateTime.now(),
  })
}

async function createArticle(author: User, published: boolean) {
  sequence++
  return Article.create({
    userId: author.id,
    title: `Les closures expliquées simplement (${sequence})`,
    slug: `closures-${sequence}-${Date.now()}`,
    body: LONG_BODY,
    bodyHtml: '<p>Contenu</p>',
    publishedAt: published ? DateTime.now().minus({ minutes: 1 }) : null,
  })
}

function report(
  client: any,
  user: User,
  payload: { target: string; id: number; reason: string; details?: string }
) {
  return client
    .post('/signalements')
    .json(payload)
    .withCsrfToken()
    .loginAs(user)
    .header('referer', '/forum')
    .redirects(0)
}

function openReports(type: 'thread' | 'reply' | 'article' | 'discussion', id: number) {
  return Report.query().where('target_type', type).where('target_id', id).where('status', 'open')
}

test.group('Reports', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('a member reports a thread', async ({ client, assert }) => {
    const author = await createUser()
    const thread = await createThread(author)
    const member = await createUser()

    const response = await report(client, member, {
      target: 'thread',
      id: thread.id,
      reason: 'spam',
    })
    response.assertStatus(302)
    response.assertFlashMessage('success', 'Merci, l’équipe de modération va examiner ce contenu.')

    const reports = await openReports('thread', thread.id)
    assert.lengthOf(reports, 1)
    assert.equal(reports[0].reporterId, member.id)
    assert.equal(reports[0].reason, 'spam')
    assert.isNull(reports[0].details)
    // Identity + snapshot, so the history survives the content.
    assert.equal(reports[0].threadId, thread.id)
    assert.equal(reports[0].targetLabel, thread.title)
    assert.equal(reports[0].targetOwnerId, author.id)
  })

  test('"Autre" requires details', async ({ client, assert }) => {
    const thread = await createThread(await createUser())
    const member = await createUser()

    const response = await report(client, member, {
      target: 'thread',
      id: thread.id,
      reason: 'other',
    })
    response.assertStatus(302)
    response.assertFlashMessage('inputErrorsBag', {
      details: ['Précisez en quelques mots ce qui pose problème.'],
    })
    assert.lengthOf(await openReports('thread', thread.id), 0)

    await report(client, member, {
      target: 'thread',
      id: thread.id,
      reason: 'other',
      details: 'Copie conforme d’une question déjà posée.',
    })
    const [saved] = await openReports('thread', thread.id)
    assert.equal(saved.details, 'Copie conforme d’une question déjà posée.')
  })

  test('a member cannot report their own content', async ({ client, assert }) => {
    const member = await createUser()
    const thread = await createThread(member)
    const reply = await createReply({ type: 'thread', id: thread.id }, member, 'Ma propre réponse.')

    const response = await report(client, member, {
      target: 'thread',
      id: thread.id,
      reason: 'spam',
    })
    response.assertStatus(302)
    response.assertFlashMessage('error', 'Vous ne pouvez pas signaler votre propre contenu.')
    await report(client, member, { target: 'reply', id: reply.id, reason: 'spam' })

    assert.lengthOf(await Report.query().where('reporter_id', member.id), 0)
  })

  test('someone else’s draft cannot be reported (404)', async ({ client, assert }) => {
    const author = await createUser()
    const draft = await createArticle(author, false)
    const member = await createUser()

    const response = await report(client, member, {
      target: 'article',
      id: draft.id,
      reason: 'off_topic',
    })
    response.assertStatus(404)

    const missing = await report(client, member, { target: 'thread', id: 999_999, reason: 'spam' })
    missing.assertStatus(404)

    assert.lengthOf(await Report.query().where('reporter_id', member.id), 0)

    // Once published, it can.
    const published = await createArticle(author, true)
    await report(client, member, { target: 'article', id: published.id, reason: 'off_topic' })
    assert.lengthOf(await openReports('article', published.id), 1)
  })

  test('a duplicate open report is refused kindly', async ({ client, assert }) => {
    const thread = await createThread(await createUser())
    const member = await createUser()

    await report(client, member, { target: 'thread', id: thread.id, reason: 'spam' })
    const again = await report(client, member, { target: 'thread', id: thread.id, reason: 'abuse' })
    again.assertStatus(302)
    again.assertFlashMessage(
      'success',
      'Vous avez déjà signalé ce contenu : l’équipe de modération l’a bien dans sa file.'
    )
    assert.lengthOf(await openReports('thread', thread.id), 1)

    // Another member can still report it.
    await report(client, await createUser(), { target: 'thread', id: thread.id, reason: 'abuse' })
    assert.lengthOf(await openReports('thread', thread.id), 2)
  })

  test('the database refuses a second open report (race)', async ({ assert }) => {
    const author = await createUser()
    const thread = await createThread(author)
    const member = await createUser()
    const row = {
      reporterId: member.id,
      targetType: 'thread' as const,
      targetId: thread.id,
      threadId: thread.id,
      targetLabel: thread.title,
      targetOwnerId: author.id,
      reason: 'spam' as const,
      status: 'open' as const,
    }
    // Two inserts that both passed any application-level check.
    const insert = () => db.transaction((trx) => Report.create(row, { client: trx }))

    await insert()
    const error = await insert().then(
      () => null,
      (reason) => reason as { code?: string; constraint?: string }
    )
    assert.equal(error?.code, '23505')
    assert.equal(error?.constraint, 'reports_open_unique')
    assert.lengthOf(await openReports('thread', thread.id), 1)

    // Closed reports do not count: once dismissed, the member may report again.
    await Report.query().where('thread_id', thread.id).update({ status: 'dismissed' })
    await insert()
    assert.lengthOf(await openReports('thread', thread.id), 1)
  })

  test('members are kept out of the moderation queue', async ({ client, assert }) => {
    const thread = await createThread(await createUser())
    const member = await createUser()
    await report(client, member, { target: 'thread', id: thread.id, reason: 'spam' })

    const page = await client.get('/admin/signalements').loginAs(member).redirects(0)
    page.assertStatus(302)
    page.assertHeader('location', '/dashboard')

    const guest = await client.get('/admin/signalements').redirects(0)
    guest.assertStatus(302)

    const dismiss = await client
      .post(`/admin/signalements/thread/${thread.id}/ignorer`)
      .withCsrfToken()
      .loginAs(member)
      .redirects(0)
    dismiss.assertStatus(302)
    const remove = await client
      .delete(`/admin/signalements/thread/${thread.id}/contenu`)
      .withCsrfToken()
      .loginAs(member)
      .redirects(0)
    remove.assertStatus(302)

    assert.lengthOf(await openReports('thread', thread.id), 1)
    assert.isNotNull(await Thread.find(thread.id))
  })

  test('a moderator sees the queue grouped by content and dismisses', async ({
    client,
    assert,
  }) => {
    const thread = await createThread(await createUser())
    await report(client, await createUser(), { target: 'thread', id: thread.id, reason: 'spam' })
    await report(client, await createUser(), {
      target: 'thread',
      id: thread.id,
      reason: 'other',
      details: 'Lien vers un site de paris en ligne.',
    })
    const moderator = await createUser({ role: 'moderator' })

    const page = await client.get('/admin/signalements').loginAs(moderator).withInertia()
    page.assertStatus(200)
    page.assertInertiaComponent('admin/reports')
    const [row] = page.inertiaProps.rows.data
    assert.lengthOf(page.inertiaProps.rows.data, 1)
    assert.equal(row.target.type, 'thread')
    assert.equal(row.target.href, `/forum/${thread.slug}`)
    assert.equal(row.reportsCount, 2)
    assert.sameMembers(row.reasons, ['spam', 'other'])
    assert.lengthOf(row.reports, 2)
    assert.exists(row.reports[0].reporter.username)
    assert.isTrue(row.canDelete)
    assert.deepEqual(page.inertiaProps.counts, { ouverts: 1, traites: 0, ignores: 0 })

    const response = await client
      .post(`/admin/signalements/thread/${thread.id}/ignorer`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)
    response.assertStatus(302)

    const reports = await Report.query().where('thread_id', thread.id)
    assert.lengthOf(reports, 2)
    for (const item of reports) {
      assert.equal(item.status, 'dismissed')
      assert.equal(item.resolvedById, moderator.id)
      assert.isNotNull(item.resolvedAt)
    }
    assert.isNotNull(await Thread.find(thread.id))

    const dismissed = await client
      .get('/admin/signalements?statut=ignores')
      .loginAs(moderator)
      .withInertia()
    assert.lengthOf(dismissed.inertiaProps.rows.data, 1)
    assert.equal(dismissed.inertiaProps.rows.data[0].resolvedBy.id, moderator.id)
  })

  test('a moderator marks a report as handled', async ({ client, assert }) => {
    const thread = await createThread(await createUser())
    await report(client, await createUser(), { target: 'thread', id: thread.id, reason: 'abuse' })
    const moderator = await createUser({ role: 'moderator' })

    await client
      .post(`/admin/signalements/thread/${thread.id}/traiter`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)

    const [saved] = await Report.query().where('thread_id', thread.id)
    assert.equal(saved.status, 'resolved')
    assert.equal(saved.resolvedById, moderator.id)
  })

  test('a moderator deletes a member’s reply from the queue', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await createThread(asker)
    const spammer = await createUser()
    const reply = await createReply(
      { type: 'thread', id: thread.id },
      spammer,
      'Achetez des abonnés pas chers sur mon site !'
    )
    await createReply({ type: 'thread', id: thread.id }, asker, 'Merci, mais non merci.')
    await thread.refresh()
    assert.equal(thread.repliesCount, 2)

    await report(client, asker, { target: 'reply', id: reply.id, reason: 'spam' })
    await report(client, await createUser(), { target: 'reply', id: reply.id, reason: 'spam' })
    const moderator = await createUser({ role: 'moderator' })

    const page = await client.get('/admin/signalements').loginAs(moderator).withInertia()
    const [row] = page.inertiaProps.rows.data
    assert.equal(row.target.type, 'reply')
    assert.equal(row.target.href, `/forum/${thread.slug}#reponse-${reply.id}`)
    assert.equal(row.target.parent.title, thread.title)
    assert.include(row.target.title, 'Achetez des abonnés')

    const response = await client
      .delete(`/admin/signalements/reply/${reply.id}/contenu`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)
    response.assertStatus(302)
    response.assertFlashMessage('success', 'Contenu supprimé, 2 signalements clos.')

    assert.isNull(await Reply.find(reply.id))
    await thread.refresh()
    assert.equal(thread.repliesCount, 1)

    // The reports stay, resolved by the moderator, pointing at nothing.
    const kept = await Report.query().where('target_type', 'reply').where('target_id', reply.id)
    assert.lengthOf(kept, 2)
    for (const item of kept) {
      assert.equal(item.status, 'resolved')
      assert.equal(item.resolvedById, moderator.id)
      assert.isNotNull(item.resolvedAt)
      assert.isNull(item.replyId)
    }

    const after = await client.get('/admin/signalements').loginAs(moderator).withInertia()
    assert.lengthOf(after.inertiaProps.rows.data, 0)
    assert.deepEqual(after.inertiaProps.counts, { ouverts: 0, traites: 1, ignores: 0 })

    const handled = await client
      .get('/admin/signalements?statut=traites')
      .loginAs(moderator)
      .withInertia()
    const [history] = handled.inertiaProps.rows.data
    assert.lengthOf(handled.inertiaProps.rows.data, 1)
    assert.isTrue(history.target.deleted)
    assert.isNull(history.target.href)
    assert.equal(history.target.parent.title, thread.title)
    assert.equal(history.owner.id, spammer.id)
    assert.equal(history.reportsCount, 2)
    assert.equal(history.resolvedBy.id, moderator.id)
    assert.isFalse(history.canDelete)
  })

  test('deleting a thread from the queue also closes its replies’ reports', async ({
    client,
    assert,
  }) => {
    const asker = await createUser()
    const thread = await createThread(asker)
    const helper = await createUser()
    const reply = await createReply({ type: 'thread', id: thread.id }, helper, 'Une réponse.')
    const reporter = await createUser()
    await report(client, reporter, { target: 'thread', id: thread.id, reason: 'spam' })
    await report(client, reporter, { target: 'reply', id: reply.id, reason: 'off_topic' })
    const moderator = await createUser({ role: 'moderator' })

    const response = await client
      .delete(`/admin/signalements/thread/${thread.id}/contenu`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)
    response.assertFlashMessage('success', 'Contenu supprimé, 2 signalements clos.')

    assert.isNull(await Thread.find(thread.id))
    const kept = await Report.query().where('reporter_id', reporter.id)
    assert.lengthOf(kept, 2)
    assert.deepEqual(
      kept.map((item) => item.status),
      ['resolved', 'resolved']
    )

    // A content deleted elsewhere stays in the queue until someone closes it.
    const other = await createThread(asker)
    await report(client, reporter, { target: 'thread', id: other.id, reason: 'spam' })
    await other.delete()
    const page = await client.get('/admin/signalements').loginAs(moderator).withInertia()
    const [row] = page.inertiaProps.rows.data
    assert.isTrue(row.target.deleted)
    assert.equal(row.target.title, other.title)
    assert.equal(row.owner.id, asker.id)
    assert.isFalse(row.canDelete)
    await client
      .post(`/admin/signalements/thread/${other.id}/traiter`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)
    assert.lengthOf(await openReports('thread', other.id), 0)
  })

  test('a moderator cannot delete an admin’s content, an admin can', async ({ client, assert }) => {
    const admin = await createUser({ role: 'admin' })
    const thread = await createThread(admin)
    await report(client, await createUser(), { target: 'thread', id: thread.id, reason: 'abuse' })
    const moderator = await createUser({ role: 'moderator' })

    const page = await client.get('/admin/signalements').loginAs(moderator).withInertia()
    assert.isFalse(page.inertiaProps.rows.data[0].canDelete)

    const refused = await client
      .delete(`/admin/signalements/thread/${thread.id}/contenu`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)
    refused.assertStatus(302)
    refused.assertFlashMessage(
      'error',
      'Seul un administrateur peut supprimer le contenu d’un membre de l’équipe.'
    )
    assert.isNotNull(await Thread.find(thread.id))
    assert.lengthOf(await openReports('thread', thread.id), 1)

    const otherAdmin = await createUser({ role: 'admin' })
    await client
      .delete(`/admin/signalements/thread/${thread.id}/contenu`)
      .withCsrfToken()
      .loginAs(otherAdmin)
      .redirects(0)
    assert.isNull(await Thread.find(thread.id))
  })

  test('the overview counts the open queue', async ({ client }) => {
    const thread = await createThread(await createUser())
    await report(client, await createUser(), { target: 'thread', id: thread.id, reason: 'spam' })
    await report(client, await createUser(), { target: 'thread', id: thread.id, reason: 'spam' })
    const moderator = await createUser({ role: 'moderator' })

    const page = await client.get('/admin').loginAs(moderator).withInertia()
    page.assertStatus(200)
    page.assertInertiaPropsContains({
      stats: { reports_open: 2, reports_queue: 1 },
      reportQueueCount: 1,
    })
  })
})
