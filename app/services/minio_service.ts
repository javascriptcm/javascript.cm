import { Client } from 'minio'
import env from '#start/env'
import { v4 as uuidv4 } from 'uuid'

const minioClient = new Client({
  endPoint: env.get('MINIO_ENDPOINT') || 'localhost',
  port: Number(env.get('MINIO_PORT') || '9000'),
  useSSL: false,
  accessKey: env.get('MINIO_ROOT_USER') || 'minio',
  secretKey: env.get('MINIO_ROOT_PASSWORD') || 'minio123',
})

const BUCKET = env.get('MINIO_DEFAULT_BUCKETS') || 'public'

export default class MinioService {
  static async upload(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    // S'assurer que le bucket existe
    const exists = await minioClient.bucketExists(BUCKET)
    if (!exists) {
      await minioClient.makeBucket(BUCKET)
    }
    await minioClient.putObject(BUCKET, fileName, file, undefined, { 'Content-Type': mimeType })
    // URL publique
    return `${env.get('MINIO_PUBLIC_URL') || 'http://localhost:9000'}/${BUCKET}/${fileName}`
  }

  static async getPresignedUrl(fileName: string, mimeType: string) {
    // S'assurer que le bucket existe
    const exists = await minioClient.bucketExists(BUCKET)
    if (!exists) {
      await minioClient.makeBucket(BUCKET)
    }

    const ext = fileName.split('.').pop()
    const key = `${uuidv4()}.${ext}`
    const url = await minioClient.presignedPutObject(BUCKET, key, 60 * 5)
    return { url, key, mimeType }
  }

  static async getPresignedViewUrl(key: string, expirySeconds = 300): Promise<string> {
    // S'assurer que le bucket existe
    const exists = await minioClient.bucketExists(BUCKET)
    if (!exists) {
      await minioClient.makeBucket(BUCKET)
    }

    return minioClient.presignedGetObject(BUCKET, key, expirySeconds)
  }
}
