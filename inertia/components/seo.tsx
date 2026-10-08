import { Head, usePage } from '@inertiajs/react'

const DEFAULT_DESCRIPTION =
  'JavaScript Cameroun : la communauté des développeurs JavaScript du 237. Articles, forum d’entraide et discussions autour de JS, TypeScript, React, Node.js et tout l’écosystème.'

/**
 * Per-page <title>, description, canonical, Open Graph and Twitter tags.
 */
export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = 'website',
  noindex = false,
  publishedTime,
}: {
  title: string
  description?: string | null
  path?: string
  image?: string | null
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
  publishedTime?: string | null
}) {
  const page = usePage()
  const base = page.props.site?.url ?? ''
  const url = `${base}${path ?? page.url.split('?')[0]}`
  const desc = description || DEFAULT_DESCRIPTION
  const fullTitle = title ? `${title} — JavaScript Cameroun` : 'JavaScript Cameroun'

  return (
    <Head title={title}>
      <meta head-key="description" name="description" content={desc} />
      <link head-key="canonical" rel="canonical" href={url} />
      <meta head-key="og:site_name" property="og:site_name" content="JavaScript Cameroun" />
      <meta head-key="og:locale" property="og:locale" content="fr_CM" />
      <meta head-key="og:type" property="og:type" content={type} />
      <meta head-key="og:title" property="og:title" content={fullTitle} />
      <meta head-key="og:description" property="og:description" content={desc} />
      <meta head-key="og:url" property="og:url" content={url} />
      {image && <meta head-key="og:image" property="og:image" content={image} />}
      {publishedTime && (
        <meta
          head-key="article:published_time"
          property="article:published_time"
          content={publishedTime}
        />
      )}
      <meta
        head-key="twitter:card"
        name="twitter:card"
        content={image ? 'summary_large_image' : 'summary'}
      />
      <meta head-key="twitter:site" name="twitter:site" content="@javascriptcm" />
      {noindex && <meta head-key="robots" name="robots" content="noindex, nofollow" />}
    </Head>
  )
}
