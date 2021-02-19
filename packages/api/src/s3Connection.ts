import AWS from 'aws-sdk'
import { AWS_ENDPOINT, AWS_REGION } from './constants'

export const s3Connection = process.env.NODE_ENV === 'test' 
  ? new AWS.S3({
      s3ForcePathStyle: true,
      endpoint: new AWS.Endpoint(AWS_ENDPOINT),
      region: AWS_REGION,
      apiVersion: '2006-03-01'
    })
  : new AWS.S3({
      region: AWS_REGION,
      apiVersion: '2006-03-01'
  })

