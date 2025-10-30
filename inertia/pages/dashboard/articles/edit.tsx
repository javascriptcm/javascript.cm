import { Head, Link, router, useForm } from '@inertiajs/react'
import DashboardLayout from '../../../layouts/dashboard'
import { FormEvent, useState, useRef } from 'react'
import { ARTICLE_STATUS_LIST, ArticleStatus } from '../../../../enums/article_status'
import axios from 'axios'
import { useImageUrl } from '../../../utils/image'

interface Article {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  status: ArticleStatus
  coverImage: string | null
  canonicalUrl: string | null
  tags: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  banReason: string | null
}

interface EditArticleProps {
  article: Article
}

const statusOptions = [
  {
    value: ArticleStatus.DRAFT,
    label: 'Brouillon',
    description: 'L\'article est en cours de rédaction',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  {
    value: ArticleStatus.PUBLISHED,
    label: 'Publié',
    description: 'L\'article est visible par tous',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
]

export default function EditArticle({ article }: EditArticleProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { data, setData, put, processing, errors } = useForm({
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    tags: article.tags || [],
    status: article.status,
    coverImage: article.coverImage || '',
    canonicalUrl: article.canonicalUrl || '',
  })

  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convertir la clé MinIO en URL affichable
  const displayImageUrl = useImageUrl(data.coverImage)

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)

      // 1. Demander une URL presignée
      const presignRes = await axios.post('/api/upload/presign', {
        fileName: file.name,
        mimeType: file.type,
      })

      const { url, key } = presignRes.data

      // 2. Uploader le fichier sur l'URL presignée
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
      })

      // 3. Stocker uniquement la clé (pas l'URL complète)
      // L'URL sera générée à la demande côté serveur
      setData('coverImage', key)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image')
        return
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB')
        return
      }

      handleImageUpload(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    put(`/dashboard/articles/${article.slug}`, {
      onSuccess: () => {
        setIsSaving(false)
      },
      onError: () => {
        setIsSaving(false)
      },
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      setData('tags', [...data.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setData(
      'tags',
      data.tags.filter((tag) => tag !== tagToRemove)
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const getStatusOption = (status: ArticleStatus) => {
    return statusOptions.find((opt) => opt.value === status)
  }

  const currentStatus = getStatusOption(data.status)

  return (
    <DashboardLayout>
      <Head title={`Éditer: ${article.title} - Dashboard`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/articles"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à mes articles
            </Link>
            <div className="h-4 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Éditer l'article</h1>
          </div>
          <Link
            href={`/articles/${article.slug}`}
            target="_blank"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Prévisualiser
          </Link>
        </div>

        {/* Ban Warning */}
        {article.status === ArticleStatus.BANNED && article.banReason && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Article banni</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{article.banReason}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Cover Image Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Image de couverture</h3>
            <div className="space-y-4">
              {data.coverImage ? (
                <div className="relative group">
                  <div className="h-64 w-full rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={displayImageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://via.placeholder.com/1200x630?text=Image+non+disponible'
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Changer
                    </button>
                    <button
                      type="button"
                      onClick={() => setData('coverImage', '')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="h-64 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-8 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin h-16 w-16 text-blue-500 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <p className="text-sm text-blue-600 font-medium">Upload en cours...</p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-16 w-16 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        Cliquez pour sélectionner une image
                      </p>
                      <p className="text-xs text-gray-500">ou ajoutez une URL ci-dessous</p>
                    </>
                  )}
                </button>
              )}

              <div>
                <label
                  htmlFor="coverImage"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  URL de l'image (optionnel)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    id="coverImage"
                    value={data.coverImage}
                    onChange={(e) => setData('coverImage', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 border transition-colors"
                    placeholder="https://exemple.com/image.jpg ou collez une clé MinIO"
                  />
                  {data.coverImage && (
                    <button
                      type="button"
                      onClick={() => setData('coverImage', '')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Recommandé: 1200x630px (ratio 1.91:1) - Format JPG, PNG ou WebP
                </p>
                {errors.coverImage && (
                  <p className="mt-2 text-sm text-red-600">{errors.coverImage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Statut de l'article</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setData('status', option.value)}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer hover:shadow-md transition-all text-left ${
                    data.status === option.value
                      ? `${option.color} border-current`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                    </div>
                    {data.status === option.value && (
                      <svg
                        className="h-5 w-5 text-current flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.status && <p className="mt-2 text-sm text-red-600">{errors.status}</p>}
          </div>

          {/* Main Content */}
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Contenu principal</h3>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'article <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 border transition-colors"
                placeholder="Donnez un titre accrocheur à votre article..."
              />
              {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Résumé <span className="text-red-500">*</span>
              </label>
              <textarea
                id="excerpt"
                rows={3}
                value={data.excerpt}
                onChange={(e) => setData('excerpt', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 border transition-colors"
                placeholder="Un court résumé qui incitera vos lecteurs à lire l'article..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {data.excerpt.length} caractères
              </p>
              {errors.excerpt && <p className="mt-2 text-sm text-red-600">{errors.excerpt}</p>}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de l'article <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                rows={20}
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 border font-mono text-sm transition-colors"
                placeholder="Rédigez votre article ici... (Markdown supporté)"
              />
              <p className="mt-1 text-xs text-gray-500">
                {data.content.length} caractères · Markdown supporté
              </p>
              {errors.content && <p className="mt-2 text-sm text-red-600">{errors.content}</p>}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Métadonnées</h3>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border transition-colors"
                  placeholder="Ajouter un tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              {data.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.tags && <p className="mt-2 text-sm text-red-600">{errors.tags}</p>}
            </div>

            {/* Canonical URL */}
            <div>
              <label
                htmlFor="canonicalUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                URL canonique
              </label>
              <input
                type="url"
                id="canonicalUrl"
                value={data.canonicalUrl}
                onChange={(e) => setData('canonicalUrl', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3 border transition-colors"
                placeholder="https://example.com/original-article"
              />
              <p className="mt-1 text-xs text-gray-500">
                Si cet article est une republication, indiquez l'URL originale
              </p>
              {errors.canonicalUrl && (
                <p className="mt-2 text-sm text-red-600">{errors.canonicalUrl}</p>
              )}
            </div>
          </div>

          {/* Article Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Dernière modification:</span>{' '}
                  {new Date(article.updatedAt).toLocaleString('fr-FR', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                {article.publishedAt && (
                  <p className="text-sm text-blue-700 mt-1">
                    <span className="font-medium">Publié le:</span>{' '}
                    {new Date(article.publishedAt).toLocaleString('fr-FR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center bg-white shadow rounded-lg p-6">
            <Link
              href="/dashboard/articles"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Annuler
            </Link>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={processing || isSaving}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing || isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
