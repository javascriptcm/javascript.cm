/**
 * Markdown → HTML pipeline (GFM, sanitized, Shiki dual theme).
 * Imported by the worker thread only: keep it free of app imports.
 */
import { unified, type Processor } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeShiki from '@shikijs/rehype'
import rehypeStringify from 'rehype-stringify'
import type { Root, Element, ElementContent, RootContent } from 'hast'

/**
 * Sanitization schema: GitHub-like defaults (raw HTML is never rendered,
 * since remark-rehype runs without "allowDangerousHtml"), plus the
 * "language-*" class on code blocks so Shiki can pick the grammar.
 */
const schema: typeof defaultSchema = {
  ...defaultSchema,
  clobberPrefix: 'md-',
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-[\w-]+$/]],
  },
}

/**
 * Links written by members open in a new tab and never pass SEO juice.
 */
function rehypeExternalLinks() {
  const walk = (nodes: (RootContent | ElementContent)[]) => {
    for (const node of nodes) {
      if (node.type !== 'element') continue
      const el = node as Element
      if (el.tagName === 'a' && typeof el.properties.href === 'string') {
        const href = el.properties.href
        if (/^https?:\/\//i.test(href)) {
          el.properties.target = '_blank'
          el.properties.rel = ['nofollow', 'ugc', 'noopener', 'noreferrer']
        }
      }
      if (el.tagName === 'img') {
        el.properties.loading = 'lazy'
        el.properties.decoding = 'async'
      }
      walk(el.children)
    }
  }
  return (tree: Root) => walk(tree.children)
}

let processor: Processor<any, any, any, any, string> | undefined

function getProcessor() {
  if (!processor) {
    processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize, schema)
      .use(rehypeExternalLinks)
      .use(rehypeShiki, {
        themes: { light: 'github-light', dark: 'vitesse-dark' },
        defaultColor: false,
        lazy: true,
        fallbackLanguage: 'text',
        langs: ['javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'html', 'css'],
        langAlias: { js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash' },
      })
      .use(rehypeStringify) as any
  }
  return processor!
}

/**
 * Render member-written markdown to safe HTML (with syntax highlighting).
 * Runs inside the markdown worker (see markdown.ts): parsing pathological
 * input can be slow, and must never block the HTTP server's thread.
 */
export async function renderMarkdownInProcess(source: string): Promise<string> {
  const file = await getProcessor().process(source)
  return String(file)
}
