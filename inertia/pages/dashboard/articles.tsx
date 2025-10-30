import { Head, Link, router } from '@inertiajs/react'
import DashboardLayout from '../../layouts/dashboard'
import { useState } from 'react'
import { useImageUrl } from '../../utils/image'

interface Article {
  id: number
  title: string
  slug: string
  status: string
  excerpt: string
  coverImage: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: {
    id: number
    name: string
    username: string
  }
}

interface ArticlesProps {
  articles: {
    data: Article[]
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
  currentStatus: string | null
  isAdmin: boolean
}

const statusConfig = {
  published: {
    label: 'Publié',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  draft: {
    label: 'Brouillon',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  banned: {
    label: 'Banni',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
}

// Composant pour afficher une ligne d'article avec l'image
function ArticleRow({ article, getStatusBadge, formatDate, isAdmin, onUnpublish, onBan, onUnban }: {
  article: Article
  getStatusBadge: (status: string) => JSX.Element | null
  formatDate: (date: string | null) => string
  isAdmin: boolean
  onUnpublish: (slug: string) => void
  onBan: (slug: string) => void
  onUnban: (slug: string) => void
}) {
  const displayImageUrl = useImageUrl(article.coverImage)

  return (
    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          {displayImageUrl && (
            <div className="flex-shrink-0 h-16 w-24 mr-4">
              <img
                className="h-16 w-24 rounded object-cover"
                src={displayImageUrl}
                alt={article.title}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link
              href={`/articles/${article.slug}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {article.title}
            </Link>
            {article.excerpt && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </td>
      {isAdmin && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          <div>
            <div className="font-medium">{article.author.name}</div>
            <div className="text-xs text-gray-500">@{article.author.username}</div>
          </div>
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(article.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>
          <div className="font-medium">
            {article.status === 'published'
              ? formatDate(article.publishedAt)
              : formatDate(article.createdAt)}
          </div>
          <div className="text-xs text-gray-400">
            {article.status === 'published' ? 'Publié' : 'Créé'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Link
            href={`/dashboard/articles/${article.slug}/edit`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Éditer
          </Link>
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Voir
          </Link>
          {isAdmin && article.status === 'published' && (
            <>
              <button
                onClick={() => onUnpublish(article.slug)}
                className="inline-flex items-center px-3 py-1.5 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 transition-colors"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Dépublier
              </button>
              <button
                onClick={() => onBan(article.slug)}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                Bannir
              </button>
            </>
          )}
          {isAdmin && article.status === 'banned' && (
            <button
              onClick={() => onUnban(article.slug)}
              className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50 transition-colors"
            >
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Débannir
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function DashboardArticles({ articles, currentStatus, isAdmin }: ArticlesProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleFilterChange = (status: string | null) => {
    if (status) {
      router.get('/dashboard/articles', { status }, { preserveState: true })
    } else {
      router.get('/dashboard/articles', {}, { preserveState: true })
    }
  }

  const handleUnpublish = (slug: string) => {
    if (confirm('Voulez-vous vraiment dépublier cet article ?')) {
      router.post(`/admin/articles/${slug}/unpublish`, {}, {
        preserveState: true,
        preserveScroll: true,
      })
    }
  }

  const handleBan = (slug: string) => {
    const banReason = prompt('Raison du bannissement (optionnel):')
    if (banReason !== null) {
      router.post(`/admin/articles/${slug}/ban`, { ban_reason: banReason }, {
        preserveState: true,
        preserveScroll: true,
      })
    }
  }

  const handleUnban = (slug: string) => {
    if (confirm('Voulez-vous vraiment débannir cet article ?')) {
      router.post(`/admin/articles/${slug}/unban`, {}, {
        preserveState: true,
        preserveScroll: true,
      })
    }
  }

  const filteredArticles = articles.data.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    )
  }

  return (
    <DashboardLayout>
      <Head title="Mes Articles - Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Gestion des Articles' : 'Mes Articles'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin
                ? 'Tous les articles publiés + vos brouillons personnels'
                : 'Gérez tous vos articles depuis un seul endroit'}
            </p>
          </div>
          <Link
            href="/articles/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvel Article
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par statut
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !currentStatus
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => handleFilterChange('published')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentStatus === 'published'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {isAdmin ? 'Publiés (tous)' : 'Publiés'}
                </button>
                <button
                  onClick={() => handleFilterChange('draft')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentStatus === 'draft'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  {isAdmin ? 'Mes brouillons' : 'Brouillons'}
                </button>
                <button
                  onClick={() => handleFilterChange('banned')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentStatus === 'banned'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {isAdmin ? 'Bannis (tous)' : 'Bannis'}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un article..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
              />
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun article</h3>
              <p className="mt-1 text-sm text-gray-500">
                {currentStatus
                  ? `Vous n'avez aucun article avec le statut sélectionné.`
                  : 'Commencez par créer votre premier article.'}
              </p>
              <div className="mt-6">
                <Link
                  href="/articles/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Nouvel Article
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Article
                    </th>
                    {isAdmin && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Auteur
                      </th>
                    )}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <ArticleRow
                      key={article.id}
                      article={article}
                      getStatusBadge={getStatusBadge}
                      formatDate={formatDate}
                      isAdmin={isAdmin}
                      onUnpublish={handleUnpublish}
                      onBan={handleBan}
                      onUnban={handleUnban}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {articles.meta.last_page > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  router.get(
                    '/dashboard/articles',
                    { page: articles.meta.current_page - 1, status: currentStatus },
                    { preserveState: true }
                  )
                }
                disabled={articles.meta.current_page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() =>
                  router.get(
                    '/dashboard/articles',
                    { page: articles.meta.current_page + 1, status: currentStatus },
                    { preserveState: true }
                  )
                }
                disabled={articles.meta.current_page === articles.meta.last_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de{' '}
                  <span className="font-medium">
                    {(articles.meta.current_page - 1) * articles.meta.per_page + 1}
                  </span>{' '}
                  à{' '}
                  <span className="font-medium">
                    {Math.min(
                      articles.meta.current_page * articles.meta.per_page,
                      articles.meta.total
                    )}
                  </span>{' '}
                  sur <span className="font-medium">{articles.meta.total}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      router.get(
                        '/dashboard/articles',
                        { page: articles.meta.current_page - 1, status: currentStatus },
                        { preserveState: true }
                      )
                    }
                    disabled={articles.meta.current_page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Précédent</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      router.get(
                        '/dashboard/articles',
                        { page: articles.meta.current_page + 1, status: currentStatus },
                        { preserveState: true }
                      )
                    }
                    disabled={articles.meta.current_page === articles.meta.last_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Suivant</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
