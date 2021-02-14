import { MAX_FILE_SIZE, ALLOWED_TYPES, AWS_BUCKET } from './constants'
import { s3Connection } from './s3Connection'
import { Request } from 'express'
import { FileFilterCallback } from 'multer'
import imager from 'multer-s3-v3'
import { nanoid } from 'nanoid'

interface opts {
  maxWidth?: number
  maxHeight?: number
  hidden?: boolean
}

export const multerSettings = (opts: opts) => ({
  storage: imager({
    s3: s3Connection,
    bucket: AWS_BUCKET,
    acl: opts.hidden ? 'private' : 'public-read',
    throwMimeTypeConflictErrorIf: (contentType, mimeType, _file) =>
      ![mimeType, 'application/octet-stream'].includes(contentType),
    key: (_req, _file, cb) => cb(null, nanoid()),
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  filter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    cb(null, ALLOWED_TYPES.includes(file.mimetype))
  },
})
