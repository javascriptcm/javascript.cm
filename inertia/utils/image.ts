import { useState, useEffect } from 'react'
import axios from 'axios'

/**
 * Vérifie si une URL est une clé MinIO ou une URL complète
 */
export function isMinIOKey(url: string | null): boolean {
  if (!url) return false
  // Si l'URL contient un protocole (http:// ou https://), c'est une URL complète
  return !url.startsWith('http://') && !url.startsWith('https://')
}

/**
 * Hook React pour charger une URL d'image MinIO de manière asynchrone
 */
export function useImageUrl(imageKey: string | null): string | null {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!imageKey) {
      setImageUrl(null)
      return
    }

    // Si c'est déjà une URL complète, la retourner telle quelle
    if (!isMinIOKey(imageKey)) {
      setImageUrl(imageKey)
      return
    }

    // Pour les clés MinIO, charger l'URL presignée
    setLoading(true)
    axios
      .get(`/api/upload/presign-view?key=${encodeURIComponent(imageKey)}`)
      .then((res) => {
        setImageUrl(res.data.url)
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de l'URL d'image:", error)
        setImageUrl(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [imageKey])

  return imageUrl || ''
}
