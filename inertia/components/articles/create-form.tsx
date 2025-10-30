import { FormEvent, Suspense, lazy } from 'react'
import { Switch } from '@headlessui/react'
import SlideOver from '../slide-over'
import TagInput from './tag-input'
import { useCreateArticleForm } from '../../hooks/useCreateArticleForm'
import { ArticleStatus } from '#enums/article_status'

const MDEditor = lazy(() => import('@uiw/react-md-editor'))

interface CreateArticleFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateArticleForm({ isOpen, onClose }: CreateArticleFormProps) {
  const {
    data,
    setData,
    processing,
    errors,
    isDraft,
    fileInputRef,
    coverPreview,
    handleCoverChange,
    handleSwitchChange,
    handleSubmit,
  } = useCreateArticleForm(onClose)

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Rédiger un article">
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Soumettez votre article au site JavaScript.cm. Nous recherchons des articles de
                haute qualité autour de JavaScript, Node.js, React, Next.js, Nest.js, AdonisJS,
                Angular, Vue, CSS et autres sujets connexes. Les articles ne peuvent pas être de
                nature promotionnelle et doivent être éducatifs et informatifs.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            {coverPreview ? (
              <img src={coverPreview} alt="cover" className="h-40 object-cover rounded mb-2" />
            ) : (
              <>
                <svg
                  className="h-16 w-16 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1z"
                  />
                </svg>
                <span className="text-gray-600 text-lg">Ajouter une photo de couverture</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleCoverChange}
            />
          </div>

          <div className="flex gap-6">
            <div className="grow flex flex-col justify-between">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="flex flex-col justify-between">
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Langue<span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setData('language', 'en')}
                  className={`px-3 py-2 rounded-md ${
                    data.language === 'en'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  En
                </button>
                <button
                  type="button"
                  onClick={() => setData('language', 'fr')}
                  className={`px-3 py-2 rounded-md ${
                    data.language === 'fr'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Fr
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
              Excerpt<span className="text-red-500">*</span>
              <span className="ml-1 text-xs text-gray-500">(minimum 50 caractères)</span>
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={data.excerpt}
              onChange={(e) => setData('excerpt', e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                data.excerpt.length > 0 && data.excerpt.length < 50
                  ? 'border-yellow-300'
                  : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
            />
            <div className="mt-1 flex justify-between">
              <span
                className={`text-xs ${data.excerpt.length < 50 ? 'text-yellow-600' : 'text-green-600'}`}
              >
                {data.excerpt.length} / 50 caractères minimum
              </span>
              {errors.excerpt && <p className="text-sm text-red-600">{errors.excerpt}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700">
                URL canonique
              </label>
              <input
                type="text"
                id="canonicalUrl"
                value={data.canonicalUrl}
                onChange={(e) => setData('canonicalUrl', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <TagInput value={data.tags} onChange={(tags: string[]) => setData('tags', tags)} />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenu<span className="text-red-500">*</span>
              <span className="ml-1 text-xs text-gray-500">(minimum 100 caractères)</span>
            </label>
            <div className="mt-1" data-color-mode="light">
              <Suspense>
                <MDEditor
                  value={data.content}
                  onChange={(value) => setData('content', value || '')}
                  preview="edit"
                  height={400}
                />
              </Suspense>
              <div className="mt-1 flex justify-between">
                <span
                  className={`text-xs ${data.content.length < 100 ? 'text-yellow-600' : 'text-green-600'}`}
                >
                  {data.content.length} / 100 caractères minimum
                </span>
                {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Switch.Group>
              <div className="flex items-center">
                <Switch
                  checked={!isDraft}
                  onChange={handleSwitchChange}
                  className={`$${
                    !isDraft ? 'bg-indigo-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`$${
                      !isDraft ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <Switch.Label className="ml-3 text-sm text-gray-600">
                  {isDraft ? 'Brouillon' : 'Prêt à publier'}
                </Switch.Label>
              </div>
            </Switch.Group>

            <div className="flex gap-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {/* {processing ? <Spinner /> : null}{' '} */}
                {data.status === ArticleStatus.DRAFT ? 'Sauvegarder comme brouillon' : 'Publier'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </SlideOver>
  )
}
