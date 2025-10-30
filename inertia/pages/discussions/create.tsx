import { Head, useForm } from '@inertiajs/react'
import axios from 'axios'
import { useRef, useState } from 'react'
import Navbar from '../../components/navbar'

export default function CreateDiscussion() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    banner: '',
  })
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // 1. Demander une presigned URL
    const presignRes = await axios.post('/api/upload/presign', {
      fileName: file.name,
      mimeType: file.type,
    })
    const { url, key } = presignRes.data
    // 2. Uploader le fichier
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    setData('banner', key)
    // 3. Preview
    const viewRes = await axios.get(`/api/upload/presign-view?key=${encodeURIComponent(key)}`)
    setBannerPreview(viewRes.data.url)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/discussions')
  }

  return (
    <>
      <Head title="Créer une discussion" />
      <Navbar />
      <div className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Créer une discussion</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Titre</label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
              required
            />
            {errors.title && <div className="text-red-500 text-sm">{errors.title}</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">Image de bannière (optionnelle)</label>
            {bannerPreview && <img src={bannerPreview} alt="banner" className="h-24 rounded mb-2" />}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleBannerChange}
              className="block"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={processing}>Créer</button>
        </form>
      </div>
    </>
  )
} 