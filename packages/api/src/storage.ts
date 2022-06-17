import { Client as Minio } from 'minio'
import {
  STORAGE_ACCESS_KEY_ID,
  STORAGE_BUCKET_NAME,
  STORAGE_ENDPOINT,
  STORAGE_PORT,
  STORAGE_SECRET_ACCESS_KEY,
} from './env'

export const storageClient = new Minio({
  region: 'us-east-1',
  port: STORAGE_PORT,
  endPoint: STORAGE_ENDPOINT,
  accessKey: STORAGE_ACCESS_KEY_ID,
  secretKey: STORAGE_SECRET_ACCESS_KEY,
  useSSL: false,
})

export const uploadFile = async (name: string, file: Buffer) =>
  await storageClient.putObject(STORAGE_BUCKET_NAME, name, file, undefined)

export const removeFile = async (name: string) =>
  await storageClient.removeObject(STORAGE_BUCKET_NAME, name)

export const isSupportedImageType = (mimeType: string) =>
  ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mimeType)

// This isn't great but it works for the mime types above.
export const getExtension = (mimeType: string) => mimeType.split('/')[1]
