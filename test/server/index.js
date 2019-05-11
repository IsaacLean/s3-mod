const aws = require('aws-sdk')
const express = require('express')
const morgan = require('morgan')

const { getS3UploadData } = require('../../dist')

const app = express()
const port = 4000

const BUCKET = process.env.S3_BUCKET
aws.config.region = process.env.S3_BUCKET_REGION || 'us-west-1'

if (!process.env.S3_BUCKET) {
  console.error('"S3_BUCKET" environment variable not set') // eslint-disable-line no-console
}

app.use(morgan('dev'))

app.get('/api', (req, res) => res.send('Hello World!'))

app.get('/api/sign-s3', async (req, res) => {
  const s3 = new aws.S3()

  const { name, type } = req.query

  try {
    const data = await getS3UploadData(s3, BUCKET, name, type, 60)
    res.write(JSON.stringify(data))
    res.end()
  } catch (err) {
    res.end()
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`)) // eslint-disable-line no-console
