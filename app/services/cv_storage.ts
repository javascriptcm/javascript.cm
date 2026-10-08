import { randomBytes } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { copyFile, mkdir, open, rename, stat, unlink } from 'node:fs/promises'
import { basename, join } from 'node:path'
import app from '@adonisjs/core/services/app'

/**
 * Members' CVs (PDF), stored on the local disk OUTSIDE public/: they are
 * only ever served by CvController, which enforces the visibility rules.
 *
 * In production "storage/" is the Docker volume "uploads" mounted on
 * /app/storage (see docker-compose.yml and deploy/backup.sh).
 *
 * The database keeps a storage key ("cvs/<32 hex>.pdf"), never a path or
 * a URL: keys are generated here and validated before touching the disk.
 */

export const CV_MAX_BYTES = 5 * 1024 * 1024
const KEY_PATTERN = /^cvs\/[a-f0-9]{32}\.pdf$/
const PDF_MAGIC = Buffer.from('%PDF-')

export function storageRoot() {
  return app.makePath('storage')
}

export function cvDirectory() {
  return join(storageRoot(), 'cvs')
}

/**
 * Absolute path of a stored CV, or null when the key is not one of ours.
 */
export function cvPath(key: string | null | undefined): string | null {
  if (!key || !KEY_PATTERN.test(key)) return null
  return join(storageRoot(), key)
}

/**
 * True when the file starts with the PDF signature "%PDF-". The extension
 * and the Content-Type sent by the browser are not trusted.
 */
export async function hasPdfSignature(filePath: string) {
  const handle = await open(filePath, 'r')
  try {
    const buffer = Buffer.alloc(PDF_MAGIC.length)
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
    return bytesRead === PDF_MAGIC.length && buffer.equals(PDF_MAGIC)
  } finally {
    await handle.close()
  }
}

/**
 * Move an uploaded temporary file into storage/cvs under a fresh random
 * name. Returns the storage key.
 */
export async function storeCv(tmpPath: string) {
  await mkdir(cvDirectory(), { recursive: true, mode: 0o750 })
  const key = `cvs/${randomBytes(16).toString('hex')}.pdf`
  const destination = join(storageRoot(), key)
  try {
    await rename(tmpPath, destination)
  } catch (error) {
    // The temporary directory and the volume are on different devices.
    if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error
    await copyFile(tmpPath, destination)
    await unlink(tmpPath)
  }
  return key
}

/**
 * Delete a stored CV. Missing files are ignored (already gone).
 */
export async function deleteCv(key: string | null | undefined) {
  const path = cvPath(key)
  if (!path) return
  await unlink(path).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error
  })
}

/**
 * Size of the stored file, or null when it is missing from the disk.
 */
export async function storedCvSize(key: string | null | undefined) {
  const path = cvPath(key)
  if (!path) return null
  try {
    const stats = await stat(path)
    return stats.size
  } catch {
    return null
  }
}

export function readCv(key: string) {
  const path = cvPath(key)
  if (!path) throw new Error('Invalid CV storage key')
  return createReadStream(path)
}

/**
 * The client file name is only ever displayed: keep the base name, drop
 * control and formatting characters, collapse spaces, max 150 characters,
 * always ending with ".pdf".
 */
export function sanitizeCvName(clientName: string | null | undefined) {
  let name = basename(String(clientName ?? '').replace(/\\/g, '/'))
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}"<>|*?:]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
  name = name.replace(/\.pdf$/i, '').trim()
  if (!name) name = 'CV'
  return `${name.slice(0, 146)}.pdf`
}
