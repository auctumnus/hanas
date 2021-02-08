import { awsSettings } from './s3Connection'
import { MAX_FILE_SIZE, ALLOWED_TYPES } from './constants'
import {Request} from 'express'
import {FileFilterCallback} from 'multer'

export const multerSettings = {
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  filter (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    cb(null, ALLOWED_TYPES.includes(file.mimetype))
  }
}

