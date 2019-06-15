import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { Application } from 'express' // eslint-disable-line import/no-extraneous-dependencies
import { S3 } from 'aws-sdk'

import { createBucket, genBucketURL, getBucketSignedURL } from './s3'
import { genRandomFileName } from './util'

interface FFUHOptions {
  expiration?: number // S3 signed request expiration
  genRandKeys?: boolean // Flag to generate random keys
  localFileLocation?: string // Locally uploaded file server route location
  localUploadEndpoint?: string // Server endpoint for local file uploading
  localPath?: string // Local file system path
  s3Path?: string // S3 bucket path
}

/**
 * Create local upload middleware.
 * Moves uploaded file to a locally stored location.
 * @param options FFUH options
 */
const createLocalUploadMiddleware = (options: FFUHOptions = {}): ((req, res, next) => void) => (
  req,
  res,
  next
): void => {
  const form = new formidable.IncomingForm()

  form.on(
    'fileBegin',
    (name, file): void => {
      const f = file
      const { genRandKeys, localPath } = options
      const p = localPath || __dirname

      if (!fs.existsSync(p)) {
        return next(new Error('Local path does not exist'))
      }

      if (!res.locals.fileName) {
        res.locals.fileName = genRandKeys ? genRandomFileName(f.name) : f.name
      }

      f.path = path.join(p, res.locals.fileName)
    }
  )

  form.parse(
    req,
    (err, fields, files): void => {
      if (err) return next(err)

      if (Object.keys(files).length === 0) {
        return next(new Error('No files were uploaded'))
      }

      res.locals.files = files

      return next()
    }
  )
}

/**
 * Setup S3 middleware.
 * Required if you will be using the S3 signed request middleware.
 * @param app Express application. The S3 service object will be assigned to its local variables.
 * @param s3Options (Optional) S3 service object options
 */
const setupS3Middleware = (app: Application, s3Options?: S3.ClientConfiguration): ((req, res, next) => void) => (
  req,
  res,
  next
): void => {
  if (process.env.S3_BUCKET) {
    createBucket(s3Options, app)
  } else {
    console.warn('S3_BUCKET is not set') // eslint-disable-line no-console
  }

  next()
}

/**
 * Create S3 signed request middleware.
 * Creates middleware to handle creation of S3 signed request.
 * Sets upload data as uploadData in response locals.
 * @param app Express application.
 * @param options FFUH options
 */
const createS3SignedRequestMiddleware = (app: Application, options: FFUHOptions): ((req, res, next) => void) => (
  req,
  res,
  next
): void => {
  const { S3_BUCKET } = process.env

  if (S3_BUCKET) {
    if (!app.locals.bucket) {
      return next(new Error('S3 bucket is not setup'))
    }

    const { name, type } = req.query
    const { expiration, genRandKeys, s3Path } = options

    const n = genRandKeys ? genRandomFileName(name) : name
    const params = expiration ? { Expires: expiration } : undefined

    getBucketSignedURL(app.locals.bucket, S3_BUCKET, n, type, s3Path, params)
      .then(
        (signedRequest): void => {
          res.locals.uploadData = {
            upload: signedRequest,
            file: genBucketURL(S3_BUCKET, n, s3Path)
          }

          next()
        }
      )
      .catch((err): Promise<any> => next(err)) // eslint-disable-line @typescript-eslint/no-explicit-any
  } else {
    next(new Error('S3_BUCKET is not set'))
  }
}

/**
 * Create flexible file upload handler (FFUH) middleware.
 * Creates S3 signed request middleware or local upload middleware depending on conditions.
 * @param app Express application.
 * @param check Function called to determine which middleware to create.
 *   Return true to create S3 signed request middleware, false to create local upload middleware.
 *   By default it will return true if NODE_ENV is set to "production".
 * @param options FFUH options
 */
export default (
  app: Application,
  options?: FFUHOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  check: (...args: any[]) => any = (): boolean => {
    if (process.env.NODE_ENV === 'production') {
      return true
    }
    return false
  }
): ((req, res, next) => void) => (req, res, next): void => {
  if (check()) {
    createS3SignedRequestMiddleware(app, options)(req, res, next)
  } else {
    const { name } = req.query
    const { genRandKeys, localFileLocation, localUploadEndpoint } = options

    if (!localUploadEndpoint) {
      return next(new Error('No local upload endpoint set'))
    }

    res.locals.fileName = genRandKeys ? genRandomFileName(name) : name
    res.locals.uploadData = {
      upload: localUploadEndpoint
    }

    if (localFileLocation) {
      res.locals.uploadData.file = `${localFileLocation}/${res.locals.fileName}`
    }

    next()
  }
}

export { createLocalUploadMiddleware, setupS3Middleware, createS3SignedRequestMiddleware }
