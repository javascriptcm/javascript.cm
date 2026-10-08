import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Core pages', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('home page renders with live stats', async ({ client }) => {
    const response = await client.get('/').withInertia()
    response.assertStatus(200)
    response.assertInertiaComponent('home')
    response.assertInertiaPropsContains({ stats: { articles: 0, threads: 0 } })
  })

  test('home page is server-side rendered', async ({ client, assert }) => {
    const response = await client.get('/')
    response.assertStatus(200)
    assert.include(response.text(), 'JavaScript.')
    assert.include(response.text(), '<html lang="fr"')
  })

  test('health check reports the database is reachable', async ({ client }) => {
    const response = await client.get('/up')
    response.assertStatus(200)
    response.assertBodyContains({ status: 'ok' })
  })

  test('robots.txt blocks indexing outside of javascript.cm', async ({ client, assert }) => {
    const response = await client.get('/robots.txt')
    response.assertStatus(200)
    assert.include(response.text(), 'Disallow: /')
  })

  test('sitemap and RSS feed are valid XML documents', async ({ client, assert }) => {
    const sitemap = await client.get('/sitemap.xml')
    sitemap.assertStatus(200)
    assert.include(sitemap.text(), '<urlset')

    const feed = await client.get('/feed.xml')
    feed.assertStatus(200)
    assert.include(feed.text(), '<rss version="2.0"')
  })

  test('unknown pages return 404', async ({ client }) => {
    const response = await client.get('/cette-page-nexiste-pas/vraiment')
    response.assertStatus(404)
  })
})
