import { useState, useRef, FormEvent, Suspense, lazy } from 'react'
import { useForm } from '@inertiajs/react'
import { ArticleStatus } from '#enums/article_status'
import axios from 'axios'

export function useCreateArticleForm(onClose: () => void) {
  const [isDraft, setIsDraft] = useState(true)
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    content: '',
    excerpt: '',
    language: 'fr',
    status: ArticleStatus.DRAFT,
    coverImage: '',
    canonicalUrl: '',
    tags: [] as string[],
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // 1. Demander une URL presign au backend
    const presignRes = await axios.post('/api/upload/presign', {
      fileName: file.name,
      mimeType: file.type,
    })
    const { url, key } = presignRes.data
    // 2. Uploader le fichier sur l'URL presignée
    await fetch(url, {
      method: 'PUT',
      body: file,
      credentials: 'same-origin',
      headers: { 'Content-Type': file.type },
    })
    // 3. Stocker la clé et récupérer une presigned URL de lecture
    setData('coverImage', key)
    const viewRes = await axios.get(`/api/upload/presign-view?key=${encodeURIComponent(key)}`)
    setCoverPreview(viewRes.data.url)
  }

  function handleSwitchChange(checked: boolean) {
    setIsDraft(!checked)
    setData('status', checked ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    console.log('data', data)
    post('/articles', { onSuccess: () => onClose() })
  }

  return {
    data,
    setData,
    post,
    processing,
    errors,
    isDraft,
    setIsDraft,
    fileInputRef,
    coverPreview,
    setCoverPreview,
    handleCoverChange,
    handleSwitchChange,
    handleSubmit,
  }
} 