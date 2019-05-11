import AWS from 'aws-sdk'

import { UploadData } from './types'

/**
 * Generate AWS S3 bucket URL.
 * @param bucket AWS S3 bucket name
 * @param name File name
 * @param path (Optional) Path to bucket upload location. Should end with '/'.
 */
export const genS3BucketURL = (bucket: string, name: string, path?: string): string => {
  let url = `https://${bucket}.s3.amazonaws.com/`

  if (path) url += path
  url += name

  return url
}

/**
 * Get signed URL from Amazon Web Services Simple Storage Service (S3).
 * Credentials are determined by the AWS shared credentials file. For more info:
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html
 * @param s3 AWS S3 service object
 * @param bucket Generate AWS S3 bucket URL.
 * @param name File name
 * @param type File type
 * @param expiration Time in seconds on when to expire signed URL. Defaults to 60.
 * @param path (Optional) Path to bucket upload location. Should end with '/'.
 */
export const getS3SignedURL = (
  s3: AWS.S3,
  bucket: string,
  name: string,
  type: string,
  expiration: number = 60,
  path?: string
): Promise<string> => {
  let key = ''

  if (path) key += path
  key += name

  return new Promise(
    (resolve, reject): void => {
      s3.getSignedUrl(
        'putObject',
        {
          Bucket: bucket,
          Key: key,
          Expires: expiration,
          ContentType: type,
          ACL: 'public-read'
        },
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
 * Get upload data from Amazon Web Services Simple Storage Service (S3) bucket.
 * Credentials are determined by the AWS shared credentials file. For more info:
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html
 * @param s3 AWS S3 service object
 * @param bucket AWS S3 bucket name
 * @param name File name
 * @param type File type
 * @param expiration Time in seconds on when to expire signed URL. Defaults to 60.
 * @param path (Optional) Path to bucket upload location. Should end with '/'.
 */
export const getS3UploadData = (
  s3: AWS.S3,
  bucket: string,
  name: string,
  type: string,
  expiration: number = 60,
  path?: string
): Promise<UploadData> =>
  getS3SignedURL(s3, bucket, name, type, expiration, path)
    .then(
      (data): UploadData => ({
        signedRequest: data,
        url: genS3BucketURL(bucket, name, path)
      })
    )
    .catch((err): Promise<never> => Promise.reject(err))
