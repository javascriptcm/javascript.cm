import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Thread from '#models/thread'
import Reply from '#models/reply'
import { createUser, firstChannel, LONG_BODY } from '#tests/helpers'

async function ask(client: any, user: any) {
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

async function answer(client: any, thread: Thread, user: any) {
  await client
    .post(`/forum/${thread.slug}/replies`)
    .json({ body: 'Ajoutez les en-têtes CORS côté serveur.' })
    .withCsrfToken()
    .loginAs(user)
    .redirects(0)
  return Reply.query().where('thread_id', thread.id).where('user_id', user.id).firstOrFail()
}

test.group('Forum', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('asking and answering keeps counters in sync', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const helper = await createUser()
    await answer(client, thread, helper)

    await thread.refresh()
    assert.equal(thread.repliesCount, 1)

    const page = await client.get(`/forum/${thread.slug}`).withInertia()
    page.assertStatus(200)
    page.assertInertiaComponent('forum/show')
  })

  test('only the asker (or a moderator) can accept a solution', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const helper = await createUser()
    const reply = await answer(client, thread, helper)

    const intruder = await createUser()
    await client
      .post(`/forum/${thread.slug}/solution`)
      .json({ replyId: reply.id })
      .withCsrfToken()
      .loginAs(intruder)
      .redirects(0)
    await thread.refresh()
    assert.isNull(thread.solutionReplyId)

    await client
      .post(`/forum/${thread.slug}/solution`)
      .json({ replyId: reply.id })
      .withCsrfToken()
      .loginAs(asker)
      .redirects(0)
    await thread.refresh()
    assert.equal(thread.solutionReplyId, reply.id)
  })

  test('deleting the accepted reply clears the solution', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const helper = await createUser()
    const reply = await answer(client, thread, helper)
    await client
      .post(`/forum/${thread.slug}/solution`)
      .json({ replyId: reply.id })
      .withCsrfToken()
      .loginAs(asker)
      .redirects(0)

    await client.delete(`/replies/${reply.id}`).withCsrfToken().loginAs(helper).redirects(0)
    await thread.refresh()
    assert.isNull(thread.solutionReplyId)
    assert.equal(thread.repliesCount, 0)
  })

  test('locked threads reject replies from members', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    const moderator = await createUser({ role: 'moderator' })
    await client.post(`/forum/${thread.slug}/lock`).withCsrfToken().loginAs(moderator).redirects(0)
    await thread.refresh()
    assert.isNotNull(thread.lockedAt)

    const member = await createUser()
    await client
      .post(`/forum/${thread.slug}/replies`)
      .json({ body: 'Je réponds quand même.' })
      .withCsrfToken()
      .loginAs(member)
      .redirects(0)
    await thread.refresh()
    assert.equal(thread.repliesCount, 0)
  })

  test('members cannot pin threads', async ({ client, assert }) => {
    const asker = await createUser()
    const thread = await ask(client, asker)
    await client.post(`/forum/${thread.slug}/pin`).withCsrfToken().loginAs(asker).redirects(0)
    await thread.refresh()
    assert.isNull(thread.pinnedAt)
  })

  test('unknown questions return 404', async ({ client }) => {
    const response = await client.get('/forum/question-qui-nexiste-pas')
    response.assertStatus(404)
  })
})

test.group('Moderation ranks', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('moderators manage members’ content, never other staff’s', async ({ client, assert }) => {
    const moderator = await createUser({ role: 'moderator' })
    const member = await createUser()
    const admin = await createUser({ role: 'admin' })
    const memberThread = await ask(client, member)
    const adminThread = await ask(client, admin)

    await client
      .delete(`/forum/${adminThread.slug}`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)
    assert.isNotNull(await Thread.find(adminThread.id))

    await client
      .delete(`/forum/${memberThread.slug}`)
      .withCsrfToken()
      .loginAs(moderator)
      .redirects(0)
    assert.isNull(await Thread.find(memberThread.id))

    // Admins keep full rights.
    await client.delete(`/forum/${adminThread.slug}`).withCsrfToken().loginAs(admin).redirects(0)
    assert.isNull(await Thread.find(adminThread.id))
  })
})
