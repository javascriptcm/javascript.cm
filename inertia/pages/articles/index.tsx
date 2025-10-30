import { Head } from '@inertiajs/react'
import ArticleCard from '../../components/articles/article-card'
import Footer from '../../components/footer'
import Navbar from '../../components/navbar'

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  coverImage?: string | null
  tags?: string[]
  author: {
    name: string
    username: string
    avatar?: string
  }
  publishedAt: string
}

export interface ArticlesIndexProps {
  articles: {
    data: Article[]
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
}

export default function ArticlesIndex({ articles }: ArticlesIndexProps) {
  return (
    <>
      <Head title="Articles - JavaScript Cameroun" />
      <Navbar />

      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Articles
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {articles.data.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{
                    ...article,
                    coverImage: article.coverImage || null,
                    tags: article.tags || [],
                    author: {
                      name: article.author.name,
                      avatar: article.author.avatar || undefined,
                    },
                    publishedAt: new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  }}
                />
              ))}
            </div>
            {/* Pagination à réintégrer ici si besoin */}
          </div>
        </main>
      </div>

      <Footer />
    </>
  )
}
