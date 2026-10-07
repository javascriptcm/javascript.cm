import { Worker } from 'node:worker_threads'
import app from '@adonisjs/core/services/app'
import MarkdownTooComplexException from '#exceptions/markdown_too_complex_exception'

/**
 * Markdown is rendered in a dedicated worker thread with a time budget.
 * Some inputs make CommonMark parsers quadratic (e.g. thousands of "*_"):
 * here they cost one worker restart instead of freezing the whole server.
 */
const RENDER_TIMEOUT_MS = 5_000

type Job = {
  id: number
  source: string
  resolve: (html: string) => void
  reject: (error: Error) => void
  timer?: NodeJS.Timeout
}

// Pathname, not the raw URL: hot-hook appends a version query in development.
const isTypeScript = new URL(import.meta.url).pathname.endsWith('.ts')
const workerEntry = new URL(`./markdown_worker${isTypeScript ? '.ts' : '.js'}`, import.meta.url)

/**
 * In development the TypeScript loader hook lives in the main thread only,
 * so the worker registers it before importing its (TypeScript) entry.
 */
const BOOTSTRAP = `
const { workerData } = require('node:worker_threads')
;(async () => {
  if (workerData.typescript) await import('@poppinss/ts-exec')
  await import(workerData.entry)
})()
`

class MarkdownRenderer {
  #worker?: Worker
  #jobs = new Map<number, Job>()
  #nextId = 1

  render(source: string) {
    return new Promise<string>((resolve, reject) => {
      const job: Job = { id: this.#nextId++, source, resolve, reject }
      this.#jobs.set(job.id, job)
      this.#dispatch(job)
    })
  }

  #dispatch(job: Job) {
    job.timer = setTimeout(() => this.#timeout(job), RENDER_TIMEOUT_MS)
    this.#getWorker().postMessage({ id: job.id, source: job.source })
  }

  #getWorker() {
    if (!this.#worker) {
      const worker = new Worker(BOOTSTRAP, {
        eval: true,
        workerData: { entry: workerEntry.href, typescript: isTypeScript },
      })
      worker.unref()
      worker.on('message', ({ id, html, error }: { id: number; html?: string; error?: string }) => {
        const job = this.#jobs.get(id)
        if (!job) return
        clearTimeout(job.timer)
        this.#jobs.delete(id)
        if (error !== undefined) job.reject(new Error(error))
        else job.resolve(html!)
      })
      worker.on('error', (error: Error) => this.#restart(error))
      worker.on('exit', (code) => {
        if (this.#worker === worker && code !== 0)
          this.#restart(new Error(`Markdown worker exited (${code})`))
      })
      this.#worker = worker
    }
    return this.#worker
  }

  /**
   * The job that ran out of time is rejected; the others are replayed on
   * a fresh worker.
   */
  #timeout(job: Job) {
    this.#jobs.delete(job.id)
    job.reject(new MarkdownTooComplexException())
    this.#restart()
  }

  /**
   * Stop the worker (application shutdown).
   */
  async close() {
    const worker = this.#worker
    this.#worker = undefined
    for (const job of this.#jobs.values()) {
      clearTimeout(job.timer)
      job.reject(new Error('Markdown renderer closed'))
    }
    this.#jobs.clear()
    await worker?.terminate()
  }

  #restart(error?: Error) {
    const worker = this.#worker
    this.#worker = undefined
    worker?.terminate().catch(() => {})
    for (const pending of this.#jobs.values()) {
      clearTimeout(pending.timer)
      if (error) {
        this.#jobs.delete(pending.id)
        pending.reject(error)
      } else {
        this.#dispatch(pending)
      }
    }
  }
}

const renderer = new MarkdownRenderer()
app.terminating(() => renderer.close())

/**
 * Emphasis markers outside code are what make CommonMark parsing
 * quadratic. Real prose uses a few dozen; reject absurd counts up front.
 */
const MAX_EMPHASIS_MARKERS = 2_000

function emphasisMarkers(source: string) {
  const prose = withoutCodeBlocks(source).replace(/`[^`\n]*`/g, '')
  let count = 0
  for (const char of prose) {
    if (char === '*' || char === '_') count++
  }
  return count
}

/**
 * Render member-written markdown to safe HTML (with syntax highlighting).
 * Throws MarkdownTooComplexException when the time budget is exceeded.
 */
export async function renderMarkdown(source: string): Promise<string> {
  if (emphasisMarkers(source) > MAX_EMPHASIS_MARKERS) {
    throw new MarkdownTooComplexException()
  }
  return renderer.render(source)
}

/**
 * Remove fenced code blocks in one linear pass (no backtracking regex).
 */
function withoutCodeBlocks(source: string) {
  let inFence = false
  const lines: string[] = []
  for (const line of source.split('\n')) {
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (!inFence) lines.push(line)
  }
  return lines.join('\n')
}

/**
 * Estimated reading time in minutes (~220 words per minute).
 */
export function readingMinutes(source: string): number {
  const words = withoutCodeBlocks(source).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

/**
 * Plain-text excerpt from markdown, used for meta descriptions and
 * listings. Runs on every page view: the input is truncated first and the
 * patterns are bounded, so the cost stays linear whatever the body.
 */
export function plainExcerpt(source: string, length = 180): string {
  const text = withoutCodeBlocks(source.slice(0, length * 8))
    .replace(/^#{1,6}\s.*$/gm, ' ')
    .replace(/`([^`\n]{0,200})`/g, '$1')
    .replace(/!\[[^\]\n]{0,300}\]\([^)\n]{0,500}\)/g, ' ')
    .replace(/\[([^\]\n]{0,300})\]\([^)\n]{0,500}\)/g, '$1')
    .replace(/[*_~>#|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text
}
