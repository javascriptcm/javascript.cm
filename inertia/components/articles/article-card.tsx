import { Link } from '@inertiajs/react'
import { useState } from 'react'

interface ArticleCardProps {
  article: {
    id: number
    title: string
    slug: string
    excerpt: string
    coverImage: string | null
    tags: string[]
    author: { name: string; avatar?: string }
    publishedAt: string
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false)
  const showFallback = imgError || !article.coverImage

  console.log('article.coverImage', article.coverImage)

  return (
    <div className="bg-white rounded-xl shadow flex flex-col h-full cursor-pointer overflow-hidden border-2 border-gray-200 transition-all duration-300 hover:border-indigo-600">
      <div
        className={`h-48 flex items-center justify-center overflow-hidden ${showFallback ? 'bg-gray-100' : ''}`}
        style={{ marginBottom: '0' }}
      >
        {!showFallback ? (
          <img
            src={article.coverImage!}
            alt={article.title}
            className="object-cover w-full h-full"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-2 mt-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={`/articles/${article.slug}`}
          className="font-bold text-lg mb-2 hover:text-indigo-600 transition"
        >
          {article.title}
        </Link>
        <p className="text-gray-600 text-sm flex-1">{article.excerpt}</p>
        <div className="flex items-center mt-4">
          {article.author.avatar ? (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-7 h-7 rounded-full mr-2"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-200 mr-2" />
          )}
          <span className="text-xs text-gray-500">{article.author.name}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-xs text-gray-400">{article.publishedAt}</span>
        </div>
      </div>
    </div>
  )
}
