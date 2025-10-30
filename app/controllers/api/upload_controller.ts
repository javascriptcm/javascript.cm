import { HttpContext } from '@adonisjs/core/http'
import MinioService from '#services/minio_service'

export default class UploadController {
  async presign({ request }: HttpContext) {
    const { fileName, mimeType } = request.only(['fileName', 'mimeType'])
    const { url, key } = await MinioService.getPresignedUrl(fileName, mimeType)
    return { url, key }
  }

  async presignView({ request }: HttpContext) {
    const key = request.input('key') || request.qs().key
    if (!key) {
      return { error: 'Missing key' }
    }
    const url = await MinioService.getPresignedViewUrl(key)
    return { url }
  }
}
