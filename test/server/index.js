const aws = require('aws-sdk')
const express = require('express')
const morgan = require('morgan')

const { createLocalUploadMiddleware, setupS3Middleware, createS3SignedRequestMiddleware } = require('../../dist')

const app = express()
const port = 4000
const localFileLocation = 'http://localhost:4000/uploads'
const rootPath = '/api'

aws.config.region = process.env.S3_BUCKET_REGION || 'us-west-1'

app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'))
app.use(setupS3Middleware(app))

app.get(rootPath, (req, res) => res.send('Hello World!'))

app.get(`${rootPath}/sign-s3`, createS3SignedRequestMiddleware(app, { genRandKeys: true }), (req, res) => {
  res.write(JSON.stringify(res.locals.uploadData))
  res.end()
})

app.put(
  `${rootPath}/upload-local`,
  createLocalUploadMiddleware({
    genRandKeys: true,
    localFileLocation,
    localPath: `${process.cwd()}/uploads`
  }),
  (req, res) => {
    res.write(`${localFileLocation}/${res.locals.fileName}`)
    res.end()
  }
)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack) // eslint-disable-line no-console
  res.status(500).send('Something broke!')
})

app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Example app listening on port ${port}!`)
  console.log(`S3_BUCKET: ${process.env.S3_BUCKET}`)
  console.log(`S3_BUCKET_REGION: ${aws.config.region}`)
  /* eslint-enable no-console */
})
