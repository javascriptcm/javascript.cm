import { useState } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { ArrowUpRight, Heart, Link2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { Data } from '@generated/data'
import { Avatar } from '~/components/ui/avatar'
import { cn, formatNumber, plural } from '~/lib/format'

type Article = Data.Article.Variants['forDetail']

/**
 * Like toggle (optimistic). Guests are sent to the login page; authors
 * cannot like their own article; drafts cannot be liked.
 */
export function LikeButton({ article, likedByMe }: { article: Article; likedByMe: boolean }) {
  const page = usePage()
  const { user } = page.props
  const [pending, setPending] = useState(false)
  const isMine = Boolean(user && article.author && user.id === article.author.id)
  const isDraft = !article.isPublished

  const classes = cn(
    'group flex h-14 w-full items-center justify-between gap-4 rounded-sm border px-4 transition-[background-color,color,border-color,box-shadow,translate] duration-200 ease-out-expo active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55',
    likedByMe
      ? 'border-ink bg-js text-js-ink shadow-[3px_3px_0_var(--ink)]'
      : 'border-ink text-ink enabled:hover:bg-ink enabled:hover:text-paper'
  )
  const content = (
    <>
      <span className="inline-flex items-center gap-2.5 text-[16px] font-semibold tracking-[-0.01em]">
        <Heart
          size={18}
          strokeWidth={1.75}
          fill={likedByMe ? 'currentColor' : 'none'}
          className="transition-transform duration-300 ease-out-expo group-active:scale-90"
          aria-hidden="true"
        />
        J’aime
      </span>
      <span className="font-mono text-[15px] font-medium tabular-nums">
        {formatNumber(article.likesCount)}
        <span className="sr-only"> {article.likesCount > 1 ? 'mentions' : 'mention'} J’aime</span>
      </span>
    </>
  )

  if (!user) {
    return (
      <Link href={`/login?redirect=${encodeURIComponent(page.url)}`} className={classes}>
        {content}
      </Link>
    )
  }

  function toggle() {
    router.post(
      `/articles/${article.slug}/like`,
      {},
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => setPending(true),
        onFinish: () => setPending(false),
        optimistic: (props) => {
          const current = props as unknown as { article: Article; likedByMe: boolean }
          return {
            likedByMe: !current.likedByMe,
            article: {
              ...current.article,
              likesCount: Math.max(0, current.article.likesCount + (current.likedByMe ? -1 : 1)),
            },
          } as Partial<typeof props>
        },
      }
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={isMine || isDraft || pending}
        aria-pressed={likedByMe}
        aria-describedby={isMine || isDraft ? 'like-note' : undefined}
        className={classes}
      >
        {content}
      </button>
      {(isMine || isDraft) && (
        <p id="like-note" className="mt-2 text-[13.5px] text-muted">
          {isDraft
            ? 'Les « J’aime » s’ouvriront à la publication.'
            : 'Vous ne pouvez pas aimer votre propre article.'}
        </p>
      )}
    </div>
  )
}

/**
 * Share: copy link, WhatsApp (the most used here), X, LinkedIn.
 */
export function ShareLinks({ title, url }: { title: string; url: string }) {
  const encodedUrl = encodeURIComponent(url)
  const networks = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}` },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Lien copié dans le presse-papiers.')
    } catch {
      toast.error('Copie impossible : sélectionnez l’adresse dans la barre du navigateur.')
    }
  }

  const row =
    'group flex w-full items-center justify-between gap-3 border-t border-line py-3 text-left text-[15px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink focus-visible:text-ink'

  return (
    <section aria-labelledby="share-title">
      <h2 id="share-title" className="label text-ink">
        Partager
      </h2>
      <ul className="mt-3 border-b border-line">
        <li>
          <button type="button" onClick={copy} className={row}>
            <span className="link-draw">Copier le lien</span>
            <Link2
              size={15}
              strokeWidth={1.75}
              aria-hidden="true"
              className="text-muted group-hover:text-ink"
            />
          </button>
        </li>
        {networks.map((network) => (
          <li key={network.label}>
            <a href={network.href} target="_blank" rel="noopener noreferrer" className={row}>
              <span className="link-draw">
                {network.label}
                <span className="sr-only"> (nouvel onglet)</span>
              </span>
              <ArrowUpRight
                size={15}
                strokeWidth={1.75}
                aria-hidden="true"
                className="text-muted transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * The author, with bio and a link to the profile.
 */
export function AuthorCard({
  author,
  articlesCount,
}: {
  author: Data.User.Variants['forProfile']
  articlesCount: number
}) {
  return (
    <section aria-labelledby="author-title" className="border-t border-ink pt-5">
      <h2 id="author-title" className="label text-ink">
        <span className="mr-2 text-muted">[@]</span>L’auteur
      </h2>
      <Link href={`/@${author.username}`} className="group mt-5 flex items-center gap-4">
        <Avatar user={author} size="lg" />
        <span className="min-w-0">
          <span className="block truncate text-[19px] leading-tight font-semibold tracking-[-0.015em] decoration-js decoration-2 underline-offset-4 group-hover:underline">
            {author.displayName}
          </span>
          <span className="mt-1 block truncate font-mono text-[13px] text-muted">
            @{author.username}
          </span>
        </span>
      </Link>
      {author.bio && <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{author.bio}</p>}
      <p className="label mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          {plural(articlesCount, 'article publié', 'articles publiés', 'Aucun article publié')}
        </span>
        {author.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} strokeWidth={1.75} aria-hidden="true" />
            {author.location}
          </span>
        )}
      </p>
      <Link
        href={`/@${author.username}`}
        className="group mt-5 inline-flex items-center gap-2 font-mono text-[13px] font-medium tracking-[0.06em] text-ink uppercase"
      >
        <span className="link-draw">Voir le profil</span>
        <span
          aria-hidden="true"
          className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
        >
          →
        </span>
      </Link>
    </section>
  )
}
