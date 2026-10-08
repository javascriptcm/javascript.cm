import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Article from '#models/article'
import Thread from '#models/thread'
import Discussion from '#models/discussion'
import type User from '#models/user'
import { createUser, firstChannel, LONG_BODY } from '#tests/helpers'

let counter = 0
const nextSlug = (prefix: string) => `${prefix}-recherche-${++counter}`

async function createArticle(author: User, overrides: Partial<Article> = {}) {
  return Article.create({
    userId: author.id,
    title: 'Un article de test',
    slug: nextSlug('article'),
    excerpt: null,
    body: LONG_BODY,
    bodyHtml: '<p>…</p>',
    readingMinutes: 1,
    publishedAt: DateTime.now().minus({ hours: 1 }),
    ...overrides,
  })
}

async function createThread(author: User, overrides: Partial<Thread> = {}) {
  const channel = await firstChannel()
  return Thread.create({
    userId: author.id,
    channelId: channel.id,
    title: 'Une question de test sur le forum',
    slug: nextSlug('question'),
    body: LONG_BODY,
    bodyHtml: '<p>…</p>',
    lastActivityAt: DateTime.now(),
    ...overrides,
  })
}

async function createDiscussion(author: User, overrides: Partial<Discussion> = {}) {
  return Discussion.create({
    userId: author.id,
    title: 'Une discussion de test',
    slug: nextSlug('discussion'),
    body: LONG_BODY,
    bodyHtml: '<p>…</p>',
    lastActivityAt: DateTime.now(),
    ...overrides,
  })
}

async function search(client: any, query: Record<string, string | number>) {
  const params = new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)])
  )
  const response = await client.get(`/recherche?${params}`).withInertia()
  response.assertStatus(200)
  response.assertInertiaComponent('search/index')
  return response.inertiaProps as Record<string, any>
}

test.group('Search', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('finds a published article by a stemmed word, both ways', async ({ client, assert }) => {
    const author = await createUser()
    const article = await createArticle(author, {
      title: 'Comprendre les closures en JavaScript',
      body: `${LONG_BODY}\n\nUne closure capture les variables de son environnement.`,
    })

    const singular = await search(client, { q: 'closure' })
    assert.equal(singular.status, 'results')
    assert.equal(singular.mode, 'exact')
    assert.equal(singular.counts.articles, 1)
    assert.deepEqual(
      singular.articles.data.map((row: { id: number }) => row.id),
      [article.id]
    )
    assert.include(singular.highlights[`articles:${article.id}`].titleHtml, '<mark>closures</mark>')

    const plural = await search(client, { q: 'closures' })
    assert.equal(plural.counts.articles, 1)
    assert.include(plural.highlights[`articles:${article.id}`].snippetHtml, '<mark>closure</mark>')
  })

  test('ignores accents, both in the query and in the content', async ({ client, assert }) => {
    const author = await createUser()
    const article = await createArticle(author, {
      title: 'Les événements JavaScript à Yaoundé',
      body: `${LONG_BODY}\n\nUn réseau de développeurs très actif.`,
    })

    const unaccented = await search(client, { q: 'evenements yaounde' })
    assert.equal(unaccented.counts.articles, 1)
    assert.deepEqual(
      unaccented.articles.data.map((row: { id: number }) => row.id),
      [article.id]
    )
    assert.include(unaccented.highlights[`articles:${article.id}`].titleHtml, '<mark>')

    const accented = await search(client, { q: 'réseau' })
    assert.equal(accented.counts.articles, 1)
  })

  test('never returns drafts, scheduled articles or banned members’ content', async ({
    client,
    assert,
  }) => {
    const author = await createUser()
    await createArticle(author, { title: 'Brouillon zarbiquette secret', publishedAt: null })
    await createArticle(author, {
      title: 'Programmé zarbiquette demain',
      publishedAt: DateTime.now().plus({ days: 1 }),
    })
    const banned = await createUser({ bannedAt: DateTime.now() })
    await createThread(banned, { title: 'Question zarbiquette d’un membre banni' })
    await createDiscussion(banned, { title: 'Discussion zarbiquette d’un membre banni' })

    const exact = await search(client, { q: 'zarbiquette' })
    assert.equal(exact.status, 'empty')
    assert.deepEqual(exact.counts, { articles: 0, questions: 0, discussions: 0 })

    // The prefix fallback applies the same visibility rules.
    const prefix = await search(client, { q: 'zarbiq' })
    assert.equal(prefix.status, 'empty')
    assert.isNull(prefix.articles)
  })

  test('escapes HTML in titles and snippets, keeping only <mark>', async ({ client, assert }) => {
    const author = await createUser()
    const thread = await createThread(author, {
      title: 'Hydratation cassée par <b>gras</b> dans mon titre',
      body: [
        'Mon composant plante pendant l’hydratation <img src=x onerror=alert(1)> du serveur.',
        'Et aussi <script>alert(1)</script> après l’hydratation "quoted" & co.',
        LONG_BODY,
      ].join('\n\n'),
    })

    const props = await search(client, { q: 'hydratation', type: 'questions' })
    const { titleHtml, snippetHtml } = props.highlights[`questions:${thread.id}`]

    for (const html of [titleHtml, snippetHtml]) {
      assert.notMatch(html.replace(/<\/?mark>/g, ''), /[<>]/, 'only <mark> tags survive')
    }
    assert.notInclude(snippetHtml, '<script')
    assert.notInclude(snippetHtml, '<img')
    assert.include(snippetHtml, '&lt;img src=x onerror=alert(1)&gt;')
    assert.include(snippetHtml, '&quot;quoted&quot; &amp; co.')
    assert.include(snippetHtml, '<mark>hydratation</mark>')
    // ts_headline drops what it parses as tags: the exact title is shown escaped.
    assert.include(titleHtml, '&lt;b&gt;gras&lt;/b&gt;')
  })

  test('filters by type and paginates a tab', async ({ client, assert }) => {
    const author = await createUser()
    await createArticle(author, { title: 'Sécuriser un webhook de paiement' })
    await createDiscussion(author, { title: 'Vos outils pour déboguer un webhook ?' })
    for (let i = 1; i <= 16; i++) {
      await createThread(author, { title: `Mon webhook numéro ${i} ne répond pas` })
    }

    const all = await search(client, { q: 'webhook' })
    assert.deepEqual(all.counts, { articles: 1, questions: 16, discussions: 1 })
    assert.lengthOf(all.articles.data, 1)
    assert.lengthOf(all.questions.data, 4)
    assert.lengthOf(all.discussions.data, 1)

    const questions = await search(client, { q: 'webhook', type: 'questions' })
    assert.equal(questions.type, 'questions')
    assert.isNull(questions.articles)
    assert.isNull(questions.discussions)
    assert.lengthOf(questions.questions.data, 15)
    assert.equal(questions.questions.metadata.lastPage, 2)
    assert.deepEqual(questions.counts, { articles: 1, questions: 16, discussions: 1 })

    const second = await search(client, { q: 'webhook', type: 'questions', page: 2 })
    assert.lengthOf(second.questions.data, 1)
    assert.equal(second.questions.metadata.currentPage, 2)

    const unknownType = await search(client, { q: 'webhook', type: 'tutoriels' })
    assert.equal(unknownType.type, 'tout')
  })

  test('falls back to prefixes when nothing matches exactly', async ({ client, assert }) => {
    const author = await createUser()
    const thread = await createThread(author, { title: 'Les closures dans une boucle for' })

    const props = await search(client, { q: 'clos' })
    assert.equal(props.status, 'results')
    assert.equal(props.mode, 'prefix')
    assert.deepEqual(
      props.questions.data.map((row: { id: number }) => row.id),
      [thread.id]
    )
  })

  test('an empty query shows the landing state, a too short one an error', async ({
    client,
    assert,
  }) => {
    const landing = await search(client, {})
    assert.equal(landing.status, 'landing')
    assert.isNull(landing.counts)
    assert.isArray(landing.popularTags)
    assert.isArray(landing.channels)
    assert.isNotNull(landing.index)

    const blank = await search(client, { q: '   ' })
    assert.equal(blank.status, 'landing')
    assert.equal(blank.q, '')

    const short = await search(client, { q: 'a' })
    assert.equal(short.status, 'invalid')
    assert.equal(short.error, 'Saisissez au moins 2 caractères.')
  })

  test('the page is server-rendered and not indexed when searching', async ({ client, assert }) => {
    const response = await client.get('/recherche?q=closures')
    response.assertStatus(200)
    assert.include(response.text(), 'name="robots" content="noindex')
    assert.include(response.text(), 'type="search"')
  })
})
