# express-ffuh

## What is this?
**express-ffuh** is a library of [Express](https://expressjs.com) middleware that handles file uploading to [Amazon Simple Storage Service (S3)](https://aws.amazon.com/s3) and to the server's local file system. **FFUH** stands for *flexible file upload handler*.

## Why would I need this?
express-ffuh is useful if you need to support uploading to both S3 and the local file system within the same server. The most common scenario is when you want to upload to the local file system when the server is running in the development environment and then upload to S3 when the server is running in the production environment. This helps keep uploads working when developing offline while saving some costs from hosting on an extra development S3 bucket.