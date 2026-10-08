import { test } from '@japa/runner'
import { safeRedirectPath } from '#services/safe_redirect'

test.group('safeRedirectPath', () => {
  test('keeps same-site relative paths', ({ assert }) => {
    assert.equal(safeRedirectPath('/forum/ma-question?x=1#r'), '/forum/ma-question?x=1#r')
  })

  test('rejects absolute and protocol-relative URLs', ({ assert }) => {
    for (const value of [
      'https://evil.test',
      '//evil.test',
      '/\\evil.test',
      'javascript:alert(1)',
      '',
      null,
      42,
    ]) {
      assert.equal(safeRedirectPath(value), '/dashboard')
    }
  })
})
