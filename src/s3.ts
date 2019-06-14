import AWS, { S3 } from 'aws-sdk'
import { Application } from 'express' // eslint-disable-line import/no-extraneous-dependencies

import { buildPath } from './util'

/**
 * Create Amazon Web Services Simple Storage Service (S3) service object.
 * @param options (Optional) S3 service object options
 * @param app (Optional) Express application
 */
export const createBucket = (options?: S3.ClientConfiguration, app?: Application): AWS.S3 => {
  const newBucket = new AWS.S3(options)

  if (app) {
    const a = app
    a.locals.bucket = newBucket
  }

  return newBucket
}

/**
 * Get signed URL from Amazon Web Services Simple Storage Service (S3).
 * Credentials are determined by the AWS shared credentials file. For more info:
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html
 * @param s3 AWS S3 service object
 * @param bucket AWS S3 bucket name
 * @param name File name
 * @param type File type
 * @param path (Optional) Path to bucket upload location
 * @param params (Optional) Parameters to pass to s3.getSignedUrl(). Defaults "ACL" to "public-read" and "Expires" to 60.
 */
export const getBucketSignedURL = (
  s3: AWS.S3,
  bucket: string,
  name: string,
  type: string,
  path?: string,
  params?: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<string> => {
  const key = buildPath(path, name)

  const p = {
    Bucket: bucket,
    Key: key,
    ContentType: type,
    ACL: 'public-read',
    Expires: 60,
    ...params
  }

  return new Promise(
    (resolve, reject): void => {
      s3.getSignedUrl(
        'putObject',
        p,
        (err, data): void => {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        }
      )
    }
  )
}

/**
 * Generate Amazon Web Services Simple Storage Service (S3) bucket URL.
 * @param bucket AWS S3 bucket name
 * @param name File name
 * @param path (Optional) Path to bucket upload location
 */
export const genBucketURL = (bucket: string, name: string, path?: string): string => {
  let url = `https://${bucket}.s3.amazonaws.com/`

  const key = buildPath(path, name)
  url += key

  return url
}
