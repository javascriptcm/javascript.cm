import { Head, Link } from '@inertiajs/react'
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useImageUrl } from '../../utils/image'

interface Article {
  title: string
  content: string
  excerpt: string
  coverImage: string | null
  tags: string[]
  publishedAt: string
  createdAt: string
  author: {
    name: string
    username: string
    avatar: string | null
  }
}

interface ArticleShowProps {
  article: Article
}

export default function ArticleShow({ article }: ArticleShowProps) {
  const displayImageUrl = useImageUrl(article.coverImage)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <>
      <Head title={`${article.title} - JavaScript Cameroun`} />
      <Navbar />

      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section with Cover Image */}
        {displayImageUrl && (
          <div className="w-full h-96 bg-gray-200 relative">
            <img
              src={displayImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}

        {/* Main Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Article Header */}
          <div className={`bg-white rounded-lg shadow-sm ${displayImageUrl ? '-mt-32 relative z-10' : 'mt-8'} p-8`}>
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {article.excerpt}
              </p>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
              <div className="flex items-center space-x-4">
                <Link href={`/@${article.author.username}`}>
                  {article.author.avatar ? (
                    <img
                      className="h-12 w-12 rounded-full ring-2 ring-white"
                      src={article.author.avatar}
                      alt={article.author.name}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white">
                      {article.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div>
                  <Link
                    href={`/@${article.author.username}`}
                    className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition"
                  >
                    {article.author.name}
                  </Link>
                  <p className="text-sm text-gray-500">@{article.author.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Publié le</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(article.publishedAt || article.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-sm mt-6 p-8 mb-8">
            <article className="prose prose-lg prose-indigo max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-gray-900 mt-5 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-gray-700 leading-relaxed mb-4" {...props} />
                  ),
                  a: ({ node, ...props }) => (
                    <a className="text-indigo-600 hover:text-indigo-800 underline" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-indigo-500 pl-4 italic my-4 text-gray-600"
                      {...props}
                    />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="bg-gray-100 text-indigo-600 px-2 py-1 rounded text-sm font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono my-4"
                        {...props}
                      />
                    ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </article>
          </div>

          {/* Author Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-start space-x-4">
              <Link href={`/@${article.author.username}`}>
                {article.author.avatar ? (
                  <img
                    className="h-16 w-16 rounded-full ring-2 ring-indigo-100"
                    src={article.author.avatar}
                    alt={article.author.name}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl ring-2 ring-indigo-100">
                    {article.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <Link
                  href={`/@${article.author.username}`}
                  className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition"
                >
                  {article.author.name}
                </Link>
                <p className="text-sm text-gray-500 mb-2">@{article.author.username}</p>
                <Link
                  href={`/@${article.author.username}`}
                  className="inline-flex items-center px-4 py-2 border border-indigo-600 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition"
                >
                  Voir le profil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
