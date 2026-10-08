import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Article from '#models/article'
import { createUser, LONG_BODY } from '#tests/helpers'

async function publish(client: any, user: any, overrides: Record<string, unknown> = {}) {
  return client
    .post('/articles')
    .json({
      title: 'Comprendre les closures en JavaScript',
      excerpt: '',
      body: LONG_BODY,
      publish: true,
      tags: [],
      ...overrides,
    })
    .withCsrfToken()
    .loginAs(user)
    .redirects(0)
}

test.group('Articles', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('guests are sent to the login page to write', async ({ client }) => {
    const response = await client.get('/articles/nouveau').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login?redirect=%2Farticles%2Fnouveau')
  })

  test('a member publishes an article with sanitized, highlighted HTML', async ({
    client,
    assert,
  }) => {
    const author = await createUser()
    const response = await publish(client, author, {
      body: `${LONG_BODY}\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))`,
    })
    response.assertStatus(302)

    const article = await Article.findByOrFail('user_id', author.id)
    assert.isNotNull(article.publishedAt)
    assert.notInclude(article.bodyHtml, '<script')
    assert.notInclude(article.bodyHtml, 'javascript:')
    assert.include(article.bodyHtml, 'class="shiki')
    assert.isAbove(article.excerpt?.length ?? 0, 20)

    const list = await client.get('/articles').withInertia()
    list.assertStatus(200)
    list.assertInertiaComponent('articles/index')
  })

  test('drafts are only visible to their author and moderators', async ({ client }) => {
    const author = await createUser()
    await publish(client, author, { publish: false })
    const article = await Article.findByOrFail('user_id', author.id)

    const stranger = await createUser()
    const moderator = await createUser({ role: 'moderator' })

    const url = `/articles/${article.slug}`
    const asGuest = await client.get(url)
    asGuest.assertStatus(404)
    const asStranger = await client.get(url).loginAs(stranger)
    asStranger.assertStatus(404)
    const asAuthor = await client.get(url).loginAs(author)
    asAuthor.assertStatus(200)
    const asModerator = await client.get(url).loginAs(moderator)
    asModerator.assertStatus(200)
  })

  test('only the author or a moderator can edit or delete', async ({ client, assert }) => {
    const author = await createUser()
    await publish(client, author)
    const article = await Article.findByOrFail('user_id', author.id)
    const stranger = await createUser()

    await client
      .put(`/articles/${article.slug}`)
      .json({ title: 'Titre détourné par un autre membre', body: LONG_BODY, publish: true })
      .withCsrfToken()
      .loginAs(stranger)
      .redirects(0)
    await client.delete(`/articles/${article.slug}`).withCsrfToken().loginAs(stranger).redirects(0)

    await article.refresh()
    assert.equal(article.title, 'Comprendre les closures en JavaScript')

    const moderator = await createUser({ role: 'moderator' })
    await client.delete(`/articles/${article.slug}`).withCsrfToken().loginAs(moderator).redirects(0)
    assert.isNull(await Article.find(article.id))
  })

  test('members cannot like their own article', async ({ client, assert }) => {
    const author = await createUser()
    await publish(client, author)
    const article = await Article.findByOrFail('user_id', author.id)

    await client.post(`/articles/${article.slug}/like`).withCsrfToken().loginAs(author).redirects(0)
    const fan = await createUser()
    await client.post(`/articles/${article.slug}/like`).withCsrfToken().loginAs(fan).redirects(0)

    await article.load('likes')
    assert.lengthOf(article.likes, 1)
    assert.equal(article.likes[0].userId, fan.id)
  })

  test('cover images must use https', async ({ client, assert }) => {
    const author = await createUser()
    const response = await publish(client, author, { coverUrl: 'http://example.com/image.png' })
    response.assertStatus(302)
    assert.property(response.flashMessages().inputErrorsBag ?? {}, 'coverUrl')
    assert.isNull(await Article.findBy('user_id', author.id))
  })
})
