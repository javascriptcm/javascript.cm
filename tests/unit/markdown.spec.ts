import { test } from '@japa/runner'
import { plainExcerpt, readingMinutes, renderMarkdown } from '#services/markdown'

test.group('Markdown rendering', () => {
  test('renders GFM (tables, task lists, strikethrough)', async ({ assert }) => {
    const html = await renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |\n\n- [x] fait\n\n~~barré~~')
    assert.include(html, '<table>')
    assert.include(html, 'type="checkbox"')
    assert.include(html, '<del>barré</del>')
  })

  test('never renders raw HTML or scripts', async ({ assert }) => {
    const html = await renderMarkdown(
      '<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n<iframe src="https://evil.test"></iframe>'
    )
    assert.notInclude(html, '<script')
    assert.notInclude(html, 'onerror')
    assert.notInclude(html, '<iframe')
  })

  test('strips javascript: URLs from links and images', async ({ assert }) => {
    const html = await renderMarkdown('[clic](javascript:alert(1)) ![x](javascript:alert(2))')
    assert.notInclude(html.toLowerCase(), 'javascript:')
  })

  test('external links are nofollow and open in a new tab', async ({ assert }) => {
    const html = await renderMarkdown('[site](https://example.com)')
    assert.include(html, 'target="_blank"')
    assert.include(html, 'rel="nofollow ugc noopener noreferrer"')
  })

  test('highlights fenced code with Shiki dual themes', async ({ assert }) => {
    const html = await renderMarkdown('```ts\nconst answer: number = 42\n```')
    assert.include(html, 'class="shiki')
    assert.include(html, '--shiki-dark')
  })

  test('unknown languages fall back to plain text', async ({ assert }) => {
    const html = await renderMarkdown('```brainfuck-2099\n+++\n```')
    assert.include(html, '<pre')
    assert.include(html, '+++')
  })

  test('reading time and excerpt', ({ assert }) => {
    assert.equal(readingMinutes('mot '.repeat(10)), 1)
    assert.equal(readingMinutes('mot '.repeat(1100)), 5)
    assert.equal(
      plainExcerpt('## Titre\n\nUn **texte** avec [un lien](https://x.y).'),
      'Un texte avec un lien.'
    )
    assert.isAtMost(plainExcerpt('a'.repeat(500), 100).length, 100)
  })
})
