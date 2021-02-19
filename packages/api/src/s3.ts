import {
  MAX_FILE_SIZE,
  ALLOWED_TYPES,
  AWS_BUCKET,
  CLOUDFRONT_DOMAIN,
  AWS_REGION,
} from './constants'
import { s3Connection } from './s3Connection'
import { Request } from 'express'
import { FileFilterCallback } from 'multer'
import imager from 'multer-s3-v3'
import { nanoid } from 'nanoid'
import { UnsupportedMediaTypeException } from '@nestjs/common'
import sharp from 'sharp'

interface opts {
  maxWidth?: number
  maxHeight?: number
  hidden?: boolean
}

export interface S3File extends Express.Multer.File {
  versionId: string
  storageClass: string
  bucket: string
  key: string
  acl: string
  metadata?: any
  location: string
  etag: string
  contentType: string
  contentDisposition?: string
}

export const setupBuckets = async () => {
  const { Buckets } = await s3Connection.listBuckets().promise()
  if (!Buckets.some((b) => b.Name === AWS_BUCKET)) {
    await s3Connection
      .createBucket({
        Bucket: AWS_BUCKET,
        ACL: 'public-read',
        CreateBucketConfiguration: {
          LocationConstraint: AWS_REGION,
        },
      })
      .promise()
  }
}

export const validateFile = (file: S3File, allowedTypes: string[]) => {
  if (
    !allowedTypes.includes(file.mimetype) ||
    !allowedTypes.includes(file.contentType)
  ) {
    throw new UnsupportedMediaTypeException(
      `File type "${
        file.contentType
      }" is not allowed. Allowed file types are: ${allowedTypes.join(', ')}`,
    )
  } else if (file.mimetype !== file.contentType) {
    throw new UnsupportedMediaTypeException('MIME type mismatch!')
  }
}

const transforms = (maxWidth?: number, maxHeight?: number) => {
  if (maxWidth || maxHeight) {
    return sharp().resize(maxWidth, maxHeight, {
      fit: sharp.fit.cover,
    })
  } else {
    return () => {}
  }
}

export const multerSettings = (opts?: opts) => ({
  storage: imager({
    s3: s3Connection,
    bucket: AWS_BUCKET,
    contentType: imager.AUTO_CONTENT_TYPE,
    acl: opts?.hidden ? 'private' : 'public-read',
    key: (_req, _file, cb) => cb(null, nanoid()),
    transforms: () => transforms(opts?.maxWidth, opts?.maxHeight),
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  filter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    cb(null, ALLOWED_TYPES.includes(file.mimetype))
  },
})

export const getUrl = (file: S3File) =>
  CLOUDFRONT_DOMAIN ? `https://${CLOUDFRONT_DOMAIN}/${file.key}` : file.location

const getLast = (a: Array<string>) =>
  a.length > 0 ? a[a.length - 1] : undefined

export const deleteObject = (url: string) => {
  const parts = url.split('/')
  const Key = getLast(parts)
  return new Promise((resolve, reject) => {
    s3Connection.deleteObject(
      {
        Bucket: AWS_BUCKET,
        Key,
      },
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      },
    )
  })
}
