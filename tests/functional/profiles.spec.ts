import { test } from '@japa/runner'
import { existsSync } from 'node:fs'
import { readdir, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import { cvDirectory, cvPath } from '#services/cv_storage'
import { createUser } from '#tests/helpers'

/**
 * A real (tiny) PDF document.
 */
const PDF = Buffer.from(
  [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >> endobj',
    'trailer << /Root 1 0 R >>',
    '%%EOF',
    '',
  ].join('\n')
)

/** A PDF of `bytes` bytes (valid signature, padded with a comment). */
function pdfOfSize(bytes: number) {
  return Buffer.concat([PDF, Buffer.alloc(bytes - PDF.length, 0x20)])
}

const PROFILE_BASE = {
  name: 'Ngono Ateba',
  email: 'ngono@example.test',
  bio: null,
  location: 'Douala',
  websiteUrl: null,
  avatarUrl: null,
  githubUsername: null,
  twitterUsername: null,
  linkedinUsername: null,
}

/**
 * Validation errors flashed by the last request, per field.
 */
function inputErrors(response: { flashMessage(key: string): unknown }) {
  return (response.flashMessage('inputErrorsBag') ?? {}) as Record<string, string[]>
}

async function listDir(dir: string) {
  try {
    return await readdir(dir)
  } catch {
    return []
  }
}

/**
 * Temporary files an upload could leave behind: our own ("jscm-cv-…") and
 * the bodyparser's default UUID names.
 */
async function uploadTmpFiles() {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  const names = await listDir(tmpdir())
  return names.filter((name) => name.startsWith('jscm-cv-') || uuid.test(name))
}

async function uploadCv(
  client: any,
  user: User,
  file: Buffer = PDF,
  filename = 'Mon CV — Ngono.pdf'
) {
  return client
    .post('/settings/cv')
    .file('cv', file, { filename, contentType: 'application/pdf' })
    .withCsrfToken()
    .loginAs(user)
    .redirects(0)
}

test.group('Professional profile fields', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('saves headline, availability, normalized skills and links', async ({ client, assert }) => {
    const user = await createUser({ username: 'ngono', email: 'ngono@example.test' })
    const response = await client
      .put('/settings')
      .json({
        ...PROFILE_BASE,
        username: 'ngono',
        headline: '  Développeuse full-stack React / Node · Douala ',
        availability: 'open_to_work',
        skills: [' React ', 'react', '#TypeScript', 'Node.js', 'node.JS', 'C#', ''],
        portfolioUrl: 'https://ngono.dev',
        links: [
          { label: 'YouTube', url: 'https://youtube.com/@ngono' },
          { label: '', url: '' },
          { label: ' Dev.to ', url: 'https://dev.to/ngono' },
        ],
      })
      .withCsrfToken()
      .loginAs(user)
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/settings')
    await user.refresh()
    assert.equal(user.headline, 'Développeuse full-stack React / Node · Douala')
    assert.equal(user.availability, 'open_to_work')
    assert.deepEqual(user.skills, ['React', 'TypeScript', 'Node.js', 'C#'])
    assert.equal(user.portfolioUrl, 'https://ngono.dev')
    assert.deepEqual(user.links, [
      { label: 'YouTube', url: 'https://youtube.com/@ngono' },
      { label: 'Dev.to', url: 'https://dev.to/ngono' },
    ])
  })

  test('keeps the professional fields an older client does not send', async ({
    client,
    assert,
  }) => {
    const user = await createUser({
      username: 'ngono',
      email: 'ngono@example.test',
      headline: 'Lead dev',
      skills: ['React'],
      links: [{ label: 'Blog', url: 'https://blog.example.test' }],
    })
    await client
      .put('/settings')
      .json({ ...PROFILE_BASE, username: 'ngono' })
      .withCsrfToken()
      .loginAs(user)
      .redirects(0)
    await user.refresh()
    assert.equal(user.headline, 'Lead dev')
    assert.deepEqual(user.skills, ['React'])
    assert.deepEqual(user.links, [{ label: 'Blog', url: 'https://blog.example.test' }])
  })

  test('rejects non-https links, too many skills or links, bad values', async ({
    client,
    assert,
  }) => {
    const user = await createUser({ username: 'ngono', email: 'ngono@example.test' })
    const response = await client
      .put('/settings')
      .json({
        ...PROFILE_BASE,
        username: 'ngono',
        headline: 'x'.repeat(121),
        availability: 'retired',
        skills: Array.from({ length: 13 }, (_, i) => `Skill ${i}`),
        portfolioUrl: 'http://ngono.dev',
        websiteUrl: 'javascript:alert(1)',
        links: Array.from({ length: 5 }, (_, i) => ({
          label: `Lien ${i}`,
          url: `https://example.test/${i}`,
        })),
      })
      .withCsrfToken()
      .loginAs(user)
      .redirects(0)

    response.assertStatus(302)
    const errors = inputErrors(response)
    assert.properties(errors, [
      'headline',
      'availability',
      'skills',
      'portfolioUrl',
      'websiteUrl',
      'links',
    ])
    assert.include(errors.skills[0], '12 compétences')
    assert.include(errors.links[0], '4 liens')
    assert.include(errors.portfolioUrl[0], 'https://')

    await user.refresh()
    assert.isNull(user.headline)
    assert.deepEqual(user.skills, [])
  })

  test('validates each skill and each link', async ({ client, assert }) => {
    const user = await createUser({ username: 'ngono', email: 'ngono@example.test' })
    const response = await client
      .put('/settings')
      .json({
        ...PROFILE_BASE,
        username: 'ngono',
        skills: ['React', 'x', 'y'.repeat(31), '<script>'],
        links: [
          { label: 'Blog', url: 'http://blog.example.test' },
          { label: '', url: 'https://example.test' },
        ],
      })
      .withCsrfToken()
      .loginAs(user)
      .redirects(0)

    const errors = inputErrors(response)
    assert.properties(errors, ['skills.1', 'skills.2', 'skills.3', 'links.0.url', 'links.1.label'])
    assert.notProperty(errors, 'skills.0')
    assert.include(errors['links.1.label'][0], 'nom')
  })

  test('public profile exposes the new fields but never the CV path', async ({
    client,
    assert,
  }) => {
    await createUser({
      username: 'ngono',
      headline: 'Développeuse React',
      availability: 'freelance',
      skills: ['React', 'Node.js'],
      portfolioUrl: 'https://ngono.dev',
      links: [{ label: 'YouTube', url: 'https://youtube.com/@ngono' }],
      cvPath: 'cvs/0123456789abcdef0123456789abcdef.pdf',
      cvVisibility: 'private',
    })
    const response = await client.get('/@ngono').withInertia()
    response.assertStatus(200)
    response.assertInertiaPropsContains({
      profile: {
        headline: 'Développeuse React',
        availability: 'freelance',
        skills: ['React', 'Node.js'],
        portfolioUrl: 'https://ngono.dev',
      },
      cv: { available: false, loginRequired: false, url: null },
    })
    assert.notInclude(JSON.stringify(response.body()), '0123456789abcdef')
    assert.notInclude(JSON.stringify(response.body()), 'cvPath')
  })

  test('members directory filters by skill, availability and city', async ({ client, assert }) => {
    await createUser({
      username: 'ngono',
      location: 'Yaoundé',
      skills: ['React', 'Node.js'],
      availability: 'open_to_work',
    })
    await createUser({
      username: 'ekane',
      location: 'Douala',
      skills: ['react', 'Vue.js'],
      availability: 'hiring',
    })
    await createUser({ username: 'tabi', location: 'Yaoundé', skills: ['Angular'] })
    await createUser({
      username: 'banni',
      skills: ['React'],
      bannedAt: DateTime.now(),
    })

    const usernames = async (query: string) => {
      const response = await client.get(`/membres${query}`).withInertia()
      response.assertStatus(200)
      const props = response.inertiaProps as { members: { data: { username: string }[] } }
      return props.members.data.map((member) => member.username).sort()
    }

    assert.deepEqual(await usernames('?competence=REACT'), ['ekane', 'ngono'])
    assert.deepEqual(await usernames('?competence=react&disponibilite=hiring'), ['ekane'])
    assert.deepEqual(await usernames('?ville=yaounde'), ['ngono', 'tabi'])
    assert.deepEqual(await usernames('?ville=Yaoundé&competence=Node.js'), ['ngono'])
    assert.deepEqual(await usernames('?disponibilite=nimporte'), ['ekane', 'ngono', 'tabi'])
    assert.deepEqual(await usernames('?competence=100%25'), [])
  })
})

test.group('CV upload and download', (group) => {
  let before: string[] = []

  group.setup(async () => {
    before = await listDir(cvDirectory())
  })
  // Remove the files written by these tests (and only them).
  group.teardown(async () => {
    const after = await listDir(cvDirectory())
    await Promise.all(
      after
        .filter((name) => !before.includes(name))
        .map((name) => unlink(join(cvDirectory(), name)))
    )
  })
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('stores a real PDF outside public/ under a random name', async ({ client, assert }) => {
    const user = await createUser()
    const response = await uploadCv(client, user)
    response.assertStatus(302)
    response.assertHeader('location', '/settings/cv')

    await user.refresh()
    assert.match(user.cvPath!, /^cvs\/[0-9a-f]{32}\.pdf$/)
    assert.equal(user.cvOriginalName, 'Mon CV — Ngono.pdf')
    assert.equal(user.cvSize, PDF.length)
    assert.isNotNull(user.cvUploadedAt)
    assert.equal(user.cvVisibility, 'members')
    assert.isTrue(existsSync(cvPath(user.cvPath)!))
    assert.notInclude(cvPath(user.cvPath)!, '/public/')
  })

  test('rejects a ".pdf" that is not a PDF (small or large)', async ({ client, assert }) => {
    const user = await createUser()

    // Too short for content sniffing: refused by the extension rule.
    const small = await uploadCv(client, user, Buffer.from('Bonjour, ceci est un CV.'))
    small.assertStatus(302)
    const smallErrors = inputErrors(small)
    assert.property(smallErrors, 'cv')

    // Large enough to fall back on the file name: refused by the signature check.
    const large = await uploadCv(client, user, Buffer.alloc(8000, 'A'))
    large.assertStatus(302)
    assert.deepEqual(large.flashMessage('inputErrorsBag'), {
      cv: ['Ce fichier n’est pas un PDF valide. Exportez votre CV au format PDF puis réessayez.'],
    })

    await user.refresh()
    assert.isNull(user.cvPath)
  })

  test('rejects files over 5 MB', async ({ client, assert }) => {
    const user = await createUser()

    const over = await uploadCv(client, user, pdfOfSize(5 * 1024 * 1024 + 10))
    over.assertStatus(302)
    const overErrors = inputErrors(over)
    assert.deepEqual(overErrors.cv, ['Fichier trop volumineux : 5 Mo maximum.'])

    // Beyond the 6 MB request limit the stream is cut short.
    const huge = await uploadCv(client, user, pdfOfSize(7 * 1024 * 1024))
    huge.assertStatus(302)
    assert.deepEqual(huge.flashMessage('inputErrorsBag'), {
      cv: ['Fichier trop volumineux : 5 Mo maximum.'],
    })

    await user.refresh()
    assert.isNull(user.cvPath)
  })

  test('re-uploading replaces the file and deletes the previous one', async ({
    client,
    assert,
  }) => {
    const user = await createUser()
    await uploadCv(client, user)
    await user.refresh()
    const first = cvPath(user.cvPath)!

    await uploadCv(client, user, pdfOfSize(2048), 'cv-2026.pdf')
    await user.refresh()
    const second = cvPath(user.cvPath)!

    assert.notEqual(first, second)
    assert.isFalse(existsSync(first))
    assert.isTrue(existsSync(second))
    assert.equal(user.cvOriginalName, 'cv-2026.pdf')
    assert.equal(user.cvSize, 2048)
  })

  test('sanitizes the client file name (display only)', async ({ client, assert }) => {
    const user = await createUser()
    await uploadCv(client, user, PDF, '../../etc/<passwd>"‮.PDF')
    await user.refresh()
    assert.equal(user.cvOriginalName, 'passwd.pdf')
    assert.match(user.cvPath!, /^cvs\/[0-9a-f]{32}\.pdf$/)
  })

  test('deleting the CV removes the file', async ({ client, assert }) => {
    const user = await createUser()
    await uploadCv(client, user)
    await user.refresh()
    const file = cvPath(user.cvPath)!

    const response = await client.delete('/settings/cv').withCsrfToken().loginAs(user).redirects(0)
    response.assertStatus(302)
    await user.refresh()
    assert.isNull(user.cvPath)
    assert.isNull(user.cvOriginalName)
    assert.isFalse(existsSync(file))
  })

  test('account deletion removes the CV file', async ({ client, assert }) => {
    const user = await createUser()
    await uploadCv(client, user)
    await user.refresh()
    const file = cvPath(user.cvPath)!
    assert.isTrue(existsSync(file))

    const response = await client
      .delete('/settings/account')
      .json({ confirmation: user.username })
      .withCsrfToken()
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/')
    assert.isNull(await User.find(user.id))
    assert.isFalse(existsSync(file))
  })

  test('visibility rules for the download', async ({ client, assert }) => {
    const owner = await createUser({ username: 'ngono' })
    const member = await createUser()
    const moderator = await createUser({ role: 'moderator' })
    await uploadCv(client, owner)

    const setVisibility = async (visibility: string) => {
      const response = await client
        .put('/settings/cv/visibility')
        .json({ visibility })
        .withCsrfToken()
        .loginAs(owner)
        .redirects(0)
      response.assertStatus(302)
    }
    const status = async (viewer?: User) => {
      const request = client.get('/@ngono/cv').redirects(0)
      if (viewer) request.loginAs(viewer)
      const response = await request
      return response.status()
    }

    // Public: anyone, with safe headers.
    await setVisibility('public')
    const download = await client.get('/@ngono/cv')
    download.assertStatus(200)
    download.assertHeader('content-type', 'application/pdf')
    download.assertHeader('content-disposition', 'inline; filename="CV-ngono.pdf"')
    download.assertHeader('x-content-type-options', 'nosniff')
    download.assertHeader('content-security-policy', 'sandbox')
    download.assertHeader('cache-control', 'private, no-store')
    download.assertHeader('content-length', String(PDF.length))
    assert.deepEqual(Buffer.from(download.body()), PDF)
    assert.equal(await status(member), 200)

    // Members: signed-in users; guests are sent to the login page.
    await setVisibility('members')
    const guest = await client.get('/@ngono/cv').redirects(0)
    guest.assertStatus(302)
    guest.assertHeader('location', `/login?redirect=${encodeURIComponent('/@ngono/cv')}`)
    assert.equal(await status(member), 200)
    assert.equal(await status(owner), 200)

    // Private: owner and staff only, a 404 for everyone else.
    await setVisibility('private')
    assert.equal(await status(), 404)
    assert.equal(await status(member), 404)
    assert.equal(await status(owner), 200)
    assert.equal(await status(moderator), 200)

    // Banned owner: hidden from everyone but the staff, whatever the visibility.
    await setVisibility('public')
    owner.bannedAt = DateTime.now()
    await owner.save()
    assert.equal(await status(), 404)
    assert.equal(await status(member), 404)
    assert.equal(await status(moderator), 200)

    // The profile page only offers the link to allowed viewers.
    owner.bannedAt = null
    await owner.save()
    await setVisibility('members')
    const guestProfile = await client.get('/@ngono').withInertia()
    guestProfile.assertInertiaPropsContains({
      cv: { available: false, loginRequired: true, url: '/@ngono/cv' },
    })
    const memberProfile = await client.get('/@ngono').withInertia().loginAs(member)
    memberProfile.assertInertiaPropsContains({ cv: { available: true, loginRequired: false } })
  })

  test('unknown members, missing CVs and bad visibilities', async ({ client }) => {
    const user = await createUser({ username: 'sanscv' })
    const unknown = await client.get('/@personne/cv')
    unknown.assertStatus(404)
    const missing = await client.get('/@sanscv/cv').loginAs(user)
    missing.assertStatus(404)

    const response = await client
      .put('/settings/cv/visibility')
      .json({ visibility: 'everyone' })
      .withCsrfToken()
      .loginAs(user)
      .redirects(0)
    response.assertStatus(302)
    response.assertFlashMessage('inputErrorsBag', {
      visibility: ['Choisissez qui peut consulter votre CV.'],
    })
  })

  test('uploads require a session and a CSRF token, and leave no temporary file', async ({
    client,
    assert,
  }) => {
    const user = await createUser()
    const tmpBefore = await uploadTmpFiles()

    const anonymous = await client
      .post('/settings/cv')
      .file('cv', PDF, { filename: 'cv.pdf' })
      .withCsrfToken()
      .redirects(0)
    anonymous.assertStatus(302)
    assert.match(anonymous.header('location') ?? '', /^\/login/)

    await client
      .post('/settings/cv')
      .file('cv', PDF, { filename: 'cv.pdf' })
      .loginAs(user)
      .redirects(0)
    await user.refresh()
    assert.isNull(user.cvPath)

    await uploadCv(client, user)
    await uploadCv(client, user, Buffer.alloc(8000, 'A'))

    assert.sameMembers(await uploadTmpFiles(), tmpBefore)
  })

  test('multipart bodies are still ignored on every other route', async ({ client, assert }) => {
    await createUser({ username: 'ngono', password: 'motdepasse-solide' })
    const tmpBefore = await uploadTmpFiles()

    const response = await client
      .post('/login')
      .fields({ login: 'ngono', password: 'motdepasse-solide' })
      .file('cv', PDF, { filename: 'cv.pdf' })
      .withCsrfToken()
      .redirects(0)

    // Valid credentials, but the fields were not parsed: the login fails.
    response.assertStatus(302)
    assert.notEqual(response.header('location'), '/dashboard')
    assert.sameMembers(await uploadTmpFiles(), tmpBefore)
  })
})
