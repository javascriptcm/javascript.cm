import { parentPort } from 'node:worker_threads'
import { renderMarkdownInProcess } from './markdown_core.js'

/**
 * Worker thread: renders markdown jobs sent by app/services/markdown.ts.
 */
parentPort!.on('message', async ({ id, source }: { id: number; source: string }) => {
  try {
    parentPort!.postMessage({ id, html: await renderMarkdownInProcess(source) })
  } catch (error) {
    parentPort!.postMessage({ id, error: error instanceof Error ? error.message : String(error) })
  }
})
