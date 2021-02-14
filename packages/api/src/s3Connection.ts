import { S3 } from 'aws-sdk'
import { AWS_REGION } from './constants'

export const s3Connection = new S3({
  region: AWS_REGION,
  apiVersion: '2006-03-01',
})
