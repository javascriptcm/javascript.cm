import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { Exception } from '@adonisjs/core/exceptions'
import { DateTime } from 'luxon'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import {
  deleteCv,
  hasPdfSignature,
  readCv,
  sanitizeCvName,
  storeCv,
  storedCvSize,
} from '#services/cv_storage'
import { cvUploadValidator, cvVisibilityValidator } from '#validators/settings_validator'

/**
 * Hard cap on the multipart body of an upload (the file itself is limited
 * to 5 MB by the validator). Caddy allows 6 MB on this route only.
 */
const UPLOAD_LIMIT = '6mb'

export type CvAccess = 'allowed' | 'login' | 'hidden'

/**
 * Who may download the CV of "owner":
 * - the owner and the staff (moderators, admins), always;
 * - nobody else while the owner is banned;
 * - "public": everyone; "members": signed-in members (guests are invited
 *   to sign in); "private": nobody else.
 */
export function cvAccess(owner: User, viewer: User | undefined): CvAccess {
  if (!owner.cvPath) return 'hidden'
  if (viewer && (viewer.id === owner.id || viewer.isModerator)) return 'allowed'
  if (owner.isBanned) return 'hidden'
  if (owner.cvVisibility === 'public') return 'allowed'
  if (owner.cvVisibility === 'members') return viewer ? 'allowed' : 'login'
  return 'hidden'
}

export function cvUrl(username: string) {
  return `/@${username}/cv`
}

async function removeQuietly(path: string) {
  await unlink(path).catch(() => {})
}

/**
 * Rendered as the regular 404 page (status pages of the exception handler).
 */
function cvNotFound() {
  return new Exception('CV introuvable', { status: 404, code: 'E_CV_NOT_FOUND' })
}

/**
 * The member's CV: upload, replacement, deletion, visibility and download.
 */
export default class CvController {
  /**
   * GET /settings/cv
   */
  async show({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return inertia.render('settings/cv', {
      cv: UserTransformer.transform(user).useVariant('forCv'),
    })
  }

  /**
   * POST /settings/cv (multipart, field "cv").
   *
   * Multipart bodies are never processed automatically (config/bodyparser.ts):
   * this action streams the file to a temporary path itself, so nothing
   * touches the disk before the auth, CSRF and throttle middleware ran.
   */
  async store({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const temporaryFiles: string[] = []

    const reject = (message: string) => {
      session.flash('inputErrorsBag', { cv: [message] })
      return response.redirect().toPath('/settings/cv')
    }

    try {
      if (!request.is(['multipart/form-data']) || !request.multipart) {
        return reject('Choisissez un fichier PDF.')
      }

      request.multipart.onFile('cv', { deferValidations: true }, async (part, reportChunk) => {
        const tmpPath = join(tmpdir(), `jscm-cv-${randomUUID()}`)
        temporaryFiles.push(tmpPath)
        part.pause()
        part.on('data', reportChunk)
        await pipeline(part, createWriteStream(tmpPath, { mode: 0o600 }))
        return { tmpPath }
      })

      try {
        await request.multipart.process({ limit: UPLOAD_LIMIT })
      } catch (error) {
        const code = (error as { code?: string }).code
        if (code === 'E_REQUEST_ENTITY_TOO_LARGE') {
          return reject('Fichier trop volumineux : 5 Mo maximum.')
        }
        if (code === 'E_INVALID_MULTIPART_REQUEST') {
          return reject('Le fichier n’a pas pu être reçu. Réessayez.')
        }
        throw error
      }

      const { cv } = await request.validateUsing(cvUploadValidator)

      if (!cv.tmpPath || !(await hasPdfSignature(cv.tmpPath))) {
        return reject(
          'Ce fichier n’est pas un PDF valide. Exportez votre CV au format PDF puis réessayez.'
        )
      }

      const previousKey = user.cvPath
      const key = await storeCv(cv.tmpPath)
      user.merge({
        cvPath: key,
        cvOriginalName: sanitizeCvName(cv.clientName),
        cvSize: cv.size,
        cvUploadedAt: DateTime.now(),
      })
      try {
        await user.save()
      } catch (error) {
        await deleteCv(key)
        throw error
      }

      if (previousKey && previousKey !== key) {
        await deleteCv(previousKey).catch((error) => {
          logger.error({ err: error, userId: user.id }, 'could not delete a replaced CV')
        })
      }

      session.flash('success', previousKey ? 'CV remplacé.' : 'CV enregistré.')
      return response.redirect().toPath('/settings/cv')
    } finally {
      await Promise.all(temporaryFiles.map(removeQuietly))
    }
  }

  /**
   * DELETE /settings/cv
   */
  async destroy({ auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const key = user.cvPath
    if (key) {
      user.merge({ cvPath: null, cvOriginalName: null, cvSize: null, cvUploadedAt: null })
      await user.save()
      await deleteCv(key)
      session.flash('success', 'CV supprimé.')
    }
    return response.redirect().toPath('/settings/cv')
  }

  /**
   * PUT /settings/cv/visibility
   */
  async updateVisibility({ request, auth, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { visibility } = await request.validateUsing(cvVisibilityValidator)
    user.cvVisibility = visibility
    await user.save()

    const labels = {
      public: 'Votre CV est visible par tout le monde.',
      members: 'Votre CV est réservé aux membres connectés.',
      private: 'Votre CV est privé : vous seul·e y avez accès.',
    }
    session.flash('success', labels[visibility])
    return response.redirect().toPath('/settings/cv')
  }

  /**
   * GET /@:username/cv — streams the PDF when the viewer may read it.
   * Unknown members, missing CVs and refused accesses all answer 404 so
   * that a private CV cannot be detected.
   */
  async download({ params, auth, response }: HttpContext) {
    const viewer = auth.user
    const owner = await User.query()
      .whereRaw('lower(username) = ?', [String(params.username).toLowerCase()])
      .firstOrFail()

    const access = cvAccess(owner, viewer)
    if (access === 'login') {
      return response.redirect(`/login?redirect=${encodeURIComponent(cvUrl(owner.username))}`)
    }
    if (access !== 'allowed' || !owner.cvPath) throw cvNotFound()

    const size = await storedCvSize(owner.cvPath)
    if (size === null) {
      logger.warn({ userId: owner.id }, 'CV file missing from the storage')
      throw cvNotFound()
    }

    response.header('Content-Type', 'application/pdf')
    response.header('Content-Length', String(size))
    response.header('Content-Disposition', `inline; filename="CV-${owner.username}.pdf"`)
    response.header('X-Content-Type-Options', 'nosniff')
    response.header('Content-Security-Policy', 'sandbox')
    response.header('Cache-Control', 'private, no-store')
    response.header('X-Robots-Tag', 'noindex, nofollow')
    response.header('Referrer-Policy', 'no-referrer')
    return response.stream(readCv(owner.cvPath))
  }
}
